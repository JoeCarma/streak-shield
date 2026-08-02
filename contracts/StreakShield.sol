// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/// @notice STRETCH GOAL — sketch only, not deployed or audited.
///
/// The hackathon MVP tracks shields off-chain (see lib/shieldStore.ts) because
/// six build days isn't enough to also design, test, and audit a contract that
/// moves real ETH. This file documents what the on-chain version would look
/// like, per spec section 5, so the write-up can describe the intended
/// trustless path even though it isn't shipped.
///
/// Design notes:
/// - `buyShield()` is a thin wrapper around BasePaint's own `mint(day, count)` —
///   it never holds a separate treasury. Payment is forwarded verbatim to
///   BasePaint at the live `openEditionPrice()`, and a shield is only credited
///   after that inner call succeeds (so a failed mint can't credit a shield).
/// - `claimMilestone()` is intentionally *not* wired to a self-reported streak
///   counter. Before shipping this for real, it needs a way to verify 30
///   consecutive Contribution days against BasePaint's own indexed state
///   (or replay `Painted` events) without trusting the caller. That
///   verification path needs more design time than this contract sketch has
///   had — see the honest caveat at the bottom.
interface IBasePaint {
    function mint(uint256 day, uint256 count) external payable;
    function openEditionPrice() external view returns (uint256);
    function today() external view returns (uint256);
    function contribution(uint256 day, address author) external view returns (uint256);
}

contract StreakShield {
    uint256 public constant MAX_SHIELDS = 2;
    uint256 public constant PURCHASE_WINDOW = 30 days;
    uint256 public constant MILESTONE_INTERVAL = 30;

    IBasePaint public immutable basePaint;

    struct ShieldAccount {
        uint8 shieldsHeld;
        uint40 lastPurchaseDay; // BasePaint day number of the last purchase
        uint40 lastMilestoneClaimed; // highest streak-length milestone already credited
    }

    mapping(address => ShieldAccount) public accounts;

    event ShieldPurchased(address indexed account, uint256 day, uint256 pricePaid);
    event ShieldEarned(address indexed account, uint256 milestoneDay);
    event ShieldConsumed(address indexed account, uint256 day);

    error AtShieldCap();
    error PurchaseTooSoon(uint256 nextEligibleDay);
    error MintFailed();

    constructor(IBasePaint _basePaint) {
        basePaint = _basePaint;
    }

    /// @notice Buy a shield by minting the canvas currently in its sale window.
    /// Forwards payment straight into BasePaint's real mint function — this
    /// contract never custodies mint proceeds, only tracks the shield credit.
    function buyShield() external payable {
        ShieldAccount storage acct = accounts[msg.sender];
        if (acct.shieldsHeld >= MAX_SHIELDS) revert AtShieldCap();

        uint256 today = basePaint.today();
        uint256 mintDay = today - 1;

        if (acct.lastPurchaseDay != 0 && today < acct.lastPurchaseDay + MILESTONE_INTERVAL) {
            revert PurchaseTooSoon(acct.lastPurchaseDay + MILESTONE_INTERVAL);
        }

        uint256 price = basePaint.openEditionPrice();
        // solhint-disable-next-line avoid-low-level-calls
        basePaint.mint{value: price}(mintDay, 1);

        acct.shieldsHeld += 1;
        acct.lastPurchaseDay = uint40(today);

        // Refund any excess ETH sent above the live mint price.
        if (msg.value > price) {
            (bool ok,) = msg.sender.call{value: msg.value - price}("");
            require(ok, "refund failed");
        }

        emit ShieldPurchased(msg.sender, mintDay, price);
    }

    /// @notice Credit a free shield once a 30-day streak milestone is reached.
    /// @dev Sketch only: `streakLengthProof` below stands in for whatever
    /// verified streak length the caller is claiming. A real implementation
    /// must derive this from BasePaint's own indexed contribution history
    /// (e.g. a Merkle proof against indexer state, or a trusted oracle/relayer
    /// that replays `Painted` events) rather than trusting a raw argument —
    /// that verification design is the actual unsolved part of this stretch
    /// goal and needs more time than the hackathon window allows.
    function claimMilestone(uint256 streakLengthProof) external {
        require(streakLengthProof % MILESTONE_INTERVAL == 0 && streakLengthProof > 0, "not a milestone");

        ShieldAccount storage acct = accounts[msg.sender];
        require(streakLengthProof > acct.lastMilestoneClaimed, "already claimed");
        if (acct.shieldsHeld >= MAX_SHIELDS) revert AtShieldCap();

        acct.shieldsHeld += 1;
        acct.lastMilestoneClaimed = uint40(streakLengthProof);

        emit ShieldEarned(msg.sender, streakLengthProof);
    }

    /// @notice Consume a shield to cover a missed day. In production this
    /// would be called by a keeper/relayer once a day rolls over with no
    /// Contribution recorded for `account`, not by the account itself.
    function consumeShield(address account, uint256 missedDay) external {
        ShieldAccount storage acct = accounts[account];
        require(acct.shieldsHeld > 0, "no shields held");
        require(basePaint.contribution(missedDay, account) == 0, "day was actually painted");

        acct.shieldsHeld -= 1;
        emit ShieldConsumed(account, missedDay);
    }
}
