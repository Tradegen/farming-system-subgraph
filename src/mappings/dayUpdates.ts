import { BigInt, Address, ethereum } from "@graphprotocol/graph-ts";
import {
  PoolManager,
  PoolManagerDayData,
  PoolDayData,
} from "../types/schema";
import {
  POOL_MANAGER_ADDRESS,
  ZERO_BI } from "./helpers";

export function updatePoolManagerDayData(event: ethereum.Event): PoolManagerDayData {
  let poolManager = PoolManager.load(POOL_MANAGER_ADDRESS);
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;
  let poolManagerDayData = PoolManagerDayData.load(dayID.toString());
  if (poolManagerDayData === null)
  {
    poolManagerDayData = new PoolManagerDayData(dayID.toString());
    poolManagerDayData.date = dayStartTimestamp;
    poolManagerDayData.dailyRewardsDistributed = ZERO_BI;
    poolManagerDayData.totalRewardsDistributed = ZERO_BI;
    poolManagerDayData.dailyPoolsRegistered = 0;
    poolManagerDayData.totalPoolsRegistered = 0;
    poolManagerDayData.dailyPoolsMarkedAsEligible = 0;
    poolManagerDayData.totalPoolsMarkedAsEligible = 0;
  }

  poolManagerDayData.totalRewardsDistributed = poolManager.totalRewardsDistributed;
  poolManagerDayData.totalPoolsRegistered = poolManager.numberOfRegisteredPools;
  poolManagerDayData.totalPoolsMarkedAsEligible = poolManager.numberOfEligiblePools;
  poolManagerDayData.save();

  return poolManagerDayData as PoolManagerDayData;
}

export function updatePoolDayData(event: ethereum.Event, poolAddress: Address): PoolDayData {
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;
  let dayPoolID = poolAddress
    .toHexString()
    .concat("-")
    .concat(BigInt.fromI32(dayID).toString());
  let poolDayData = PoolDayData.load(dayPoolID);
  if (poolDayData === null) {
    poolDayData = new PoolDayData(dayPoolID);
    poolDayData.date = dayStartTimestamp;
    poolDayData.dailyRewardsCollected = ZERO_BI;
    poolDayData.unrealizedProfit = ZERO_BI;
    poolDayData.tokenPrice = ZERO_BI;
  }

  poolDayData.save();

  return poolDayData as PoolDayData;
}