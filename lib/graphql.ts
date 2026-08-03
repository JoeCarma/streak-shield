import { GraphQLClient, gql } from "graphql-request";
import { getAddress } from "viem";

export const BASEPAINT_GRAPHQL_ENDPOINT = "https://graphql.basepaint.xyz";

export const graphqlClient = new GraphQLClient(BASEPAINT_GRAPHQL_ENDPOINT);

/**
 * BasePaint's indexer keys accounts by their EIP-55 **checksummed** address —
 * `Account.id` and `Contribution.accountId` both look like
 * `0xfd82e4b3aDDcF02E00196a7ba23876ac96820881`, not the lowercase form.
 *
 * This matters more than it looks. Filtering by a lowercased address doesn't
 * error, it just silently matches nothing: `account` comes back `null` and
 * `contributions` comes back `[]`. Downstream, an empty painting history makes
 * the streak simulation report a confident 0-day streak — indistinguishable
 * from a genuinely broken streak. Wallets hand back lowercase addresses, so
 * every lookup has to be re-checksummed here.
 */
function toIndexerId(address: string): string {
  try {
    return getAddress(address);
  } catch {
    // Not a valid address — pass through and let the query return nothing.
    return address;
  }
}

/**
 * The indexer (basepaint-ponder) is built with Ponder, whose generated GraphQL
 * API wraps plural query results as `{ items: [...], pageInfo }`. We defend
 * against that shape changing (e.g. a bare array) so a schema tweak upstream
 * doesn't hard-crash the app.
 */
function unwrapItems<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object" && Array.isArray((value as any).items)) {
    return (value as any).items as T[];
  }
  return [];
}

export type AccountRecord = {
  id: string;
  totalPixels: number;
  streak: number;
  longestStreak: number;
  lastPaintedDay: number | null;
  totalDaysPainted: number;
};

const ACCOUNT_QUERY = gql`
  query Account($id: String!) {
    account(id: $id) {
      id
      totalPixels
      streak
      longestStreak
      lastPaintedDay
      totalDaysPainted
    }
  }
`;

/**
 * Fetch the indexer's own account record (it already tracks a raw, unshielded
 * streak). Throws on request failure — see fetchContributionDays for why a
 * swallowed error is worse than a visible one here.
 */
export async function fetchAccount(address: string): Promise<AccountRecord | null> {
  const data = await graphqlClient.request<{ account: AccountRecord | null }>(ACCOUNT_QUERY, {
    id: toIndexerId(address),
  });
  return data.account ?? null;
}

export type ContributionRecord = {
  canvasId: number;
  pixelsCount: number;
};

const CONTRIBUTIONS_QUERY = gql`
  query Contributions($accountId: String!, $limit: Int!, $after: String) {
    contributions(
      where: { accountId: $accountId }
      orderBy: "canvasId"
      orderDirection: "desc"
      limit: $limit
      after: $after
    ) {
      items {
        canvasId
        pixelsCount
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/**
 * Ponder rejects `limit` above 1000, so pages have to be walked rather than
 * asked for in one shot. An earlier version requested 2000 in a single call,
 * which failed validation — and because the failure was swallowed and returned
 * an empty array, the UI confidently rendered a 0-day streak for accounts with
 * years of history. Errors now propagate so react-query can surface them.
 */
const CONTRIBUTIONS_PAGE_SIZE = 1000;

/** Plain-as-possible variant, used if the cursor arguments aren't supported. */
const CONTRIBUTIONS_FALLBACK_QUERY = gql`
  query ContributionsFallback($accountId: String!, $limit: Int!) {
    contributions(
      where: { accountId: $accountId }
      orderBy: "canvasId"
      orderDirection: "desc"
      limit: $limit
    ) {
      items {
        canvasId
        pixelsCount
      }
    }
  }
`;

/**
 * Every day this account painted (has a Contribution row), most recent first.
 * This is the ground truth Streak Shield replays forward to simulate shield
 * consumption — the indexer's own `streak` field can't be reused directly
 * because it resets on any missed day, with no concept of shields.
 *
 * Throws on failure rather than returning []: an empty result and a failed
 * request mean very different things here (no history vs. we don't know), and
 * silently conflating them produces a wrong-but-plausible streak.
 */
export async function fetchContributionDays(address: string): Promise<ContributionRecord[]> {
  const accountId = toIndexerId(address);

  try {
    const all: ContributionRecord[] = [];
    let after: string | null = null;

    // Bounded so a misbehaving cursor can't spin forever.
    for (let page = 0; page < 20; page++) {
      const data: { contributions: unknown } = await graphqlClient.request(CONTRIBUTIONS_QUERY, {
        accountId,
        limit: CONTRIBUTIONS_PAGE_SIZE,
        after,
      });

      all.push(...unwrapItems<ContributionRecord>(data.contributions));

      const pageInfo = (
        data.contributions as { pageInfo?: { hasNextPage?: boolean; endCursor?: string } }
      )?.pageInfo;
      if (!pageInfo?.hasNextPage || !pageInfo.endCursor) break;
      after = pageInfo.endCursor;
    }

    return all;
  } catch (err) {
    /*
     * The cursor arguments above (`after`, `pageInfo`) are Ponder conventions
     * that this indexer's schema may not expose. Rather than fail outright,
     * retry with the plainest possible query — BasePaint is only ~1100 days
     * old, so a single 1000-row page covers all but the most complete history.
     */
    console.warn("Paginated contributions query failed, retrying unpaginated", err);
    const data = await graphqlClient.request<{ contributions: unknown }>(
      CONTRIBUTIONS_FALLBACK_QUERY,
      { accountId, limit: CONTRIBUTIONS_PAGE_SIZE }
    );
    return unwrapItems<ContributionRecord>(data.contributions);
  }
}

export type LeaderboardEntry = {
  id: string;
  streak: number;
  longestStreak: number;
  lastPaintedDay: number | null;
  totalDaysPainted: number;
};

const LEADERBOARD_QUERY = gql`
  query Leaderboard($limit: Int!) {
    accounts(orderBy: "streak", orderDirection: "desc", limit: $limit) {
      items {
        id
        streak
        longestStreak
        lastPaintedDay
        totalDaysPainted
      }
    }
  }
`;

/**
 * Public leaderboard, sorted by the indexer's raw streak. Note this ranks the
 * *unshielded* BasePaint streak (consecutive Contribution days) since Streak
 * Shield's per-wallet shield ledger is app-local (see lib/shieldStore.ts) and
 * isn't something the shared indexer knows about.
 */
export async function fetchLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  try {
    const data = await graphqlClient.request<{ accounts: unknown }>(LEADERBOARD_QUERY, { limit });
    return unwrapItems<LeaderboardEntry>(data.accounts).filter((a) => a.streak > 0);
  } catch (err) {
    console.error("fetchLeaderboard failed", err);
    return [];
  }
}
