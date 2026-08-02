import { GraphQLClient, gql } from "graphql-request";

export const BASEPAINT_GRAPHQL_ENDPOINT = "https://graphql.basepaint.xyz";

export const graphqlClient = new GraphQLClient(BASEPAINT_GRAPHQL_ENDPOINT);

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

/** Fetch the indexer's own account record (it already tracks a raw, unshielded streak). */
export async function fetchAccount(address: string): Promise<AccountRecord | null> {
  const id = address.toLowerCase();
  try {
    const data = await graphqlClient.request<{ account: AccountRecord | null }>(ACCOUNT_QUERY, {
      id,
    });
    return data.account ?? null;
  } catch (err) {
    console.error("fetchAccount failed", err);
    return null;
  }
}

export type ContributionRecord = {
  canvasId: number;
  pixelsCount: number;
};

const CONTRIBUTIONS_QUERY = gql`
  query Contributions($accountId: String!, $limit: Int!) {
    contributions(where: { accountId: $accountId }, orderBy: "canvasId", orderDirection: "desc", limit: $limit) {
      items {
        canvasId
        pixelsCount
      }
    }
  }
`;

/**
 * Every day this account painted (has a Contribution row), most recent first.
 * This is the ground truth Streak Shield walks backward over to simulate
 * shield consumption — the indexer's own `streak` field can't be reused
 * directly because it resets on any missed day, with no concept of shields.
 */
export async function fetchContributionDays(
  address: string,
  limit = 2000
): Promise<ContributionRecord[]> {
  const accountId = address.toLowerCase();
  try {
    const data = await graphqlClient.request<{ contributions: unknown }>(CONTRIBUTIONS_QUERY, {
      accountId,
      limit,
    });
    return unwrapItems<ContributionRecord>(data.contributions);
  } catch (err) {
    console.error("fetchContributionDays failed", err);
    return [];
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
