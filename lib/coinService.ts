import CoinTransaction from "@/models/CoinTransaction";
import { generateTxId } from "@/utils/formatters";

export interface CoinTxArgs {
  user: {
    userId: string;
    _id: any;
    coins?: number;
  };
  type: "earn" | "spend";
  coins: number;
  source:
    | "purchase"
    | "checkin"
    | "task"
    | "ad_reward"
    | "referral"
    | "convert_to_wallet"
    | "admin"
    | "game";
  description?: string;
  referenceId?: string;
  performedBy?: "system" | "admin" | "user";
  balanceBefore?: number;
  balanceAfter?: number;
}

/**
 * Creates and logs a CoinTransaction record.
 */
export async function createCoinTx({
  user,
  type,
  coins,
  source,
  description = "Coin Transaction",
  referenceId,
  performedBy = "system",
  balanceBefore,
  balanceAfter,
}: CoinTxArgs) {
  const transactionId = generateTxId(source.toUpperCase());
  const before = balanceBefore !== undefined ? balanceBefore : (user.coins || 0);
  const after =
    balanceAfter !== undefined
      ? balanceAfter
      : before + (type === "earn" ? coins : -coins);

  return CoinTransaction.create({
    transactionId,
    userId: user.userId,
    userObjectId: user._id,
    type,
    coins,
    balanceBefore: before,
    balanceAfter: after,
    source,
    description,
    referenceId,
    performedBy,
  });
}

/**
 * Credits coins to a user and logs the transaction.
 */
export async function creditCoins(
  user: any,
  coins: number,
  source: CoinTxArgs["source"],
  description?: string,
  referenceId?: string,
  performedBy: "system" | "admin" | "user" = "system"
) {
  const balanceBefore = user.coins || 0;
  user.coins = balanceBefore + coins;
  await user.save();

  return createCoinTx({
    user,
    type: "earn",
    coins,
    source,
    description,
    referenceId,
    performedBy,
    balanceBefore,
    balanceAfter: user.coins,
  });
}
