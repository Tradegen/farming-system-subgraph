import {
    Address,
    BigDecimal,
    BigInt
  } from "@graphprotocol/graph-ts";
import {
    PoolManager,
    Pool,
    Farm,
    PoolPeriod,
    GlobalPeriod,
  } from "../types/schema";
  import {
    RewardPaid,
    RegisteredPool,
    MarkedPoolAsEligible,
    UpdatedWeight
  } from "../types/PoolManager/PoolManager";
  import {
    ZERO_BI,
    POOL_MANAGER_ADDRESS,
    calculatePeriodIndex,
    fetchGlobalWeight,
    fetchPoolWeight
  } from "./helpers";
  import {
    updatePoolDayData,
    updatePoolManagerDayData,
  } from "./dayUpdates";
  import { StakingRewards as StakingRewardsTemplate } from "../types/templates";
  
export function handleRewardPaid(event: RewardPaid): void {
    let periodIndex = calculatePeriodIndex(event.block.timestamp.toI32());
    let globalWeight = fetchGlobalWeight(periodIndex);
    let poolWeight = fetchPoolWeight(event.params.poolAddress, periodIndex);

    let poolManager = PoolManager.load(POOL_MANAGER_ADDRESS);
    poolManager.globalWeight = globalWeight;
    poolManager.totalRewardsDistributed = poolManager.totalRewardsDistributed.plus(event.params.reward);
    poolManager.save();

    let pool = Pool.load(event.params.poolAddress.toHexString());
    pool.totalRewardsCollected = pool.totalRewardsCollected.plus(event.params.reward);
    pool.save();

    let poolPeriodID = event.params.poolAddress.toHexString() + "-" + periodIndex.toString();
    let poolPeriod = PoolPeriod.load(poolPeriodID);
    if (poolPeriod === null) {
        poolPeriod = new PoolPeriod(poolPeriodID);
        poolPeriod.pool = event.params.poolAddress.toHexString();
        poolPeriod.index = periodIndex.toI32();
        poolPeriod.weight = poolWeight;
        poolPeriod.rewardsCollected = ZERO_BI;
    }
    poolPeriod.rewardsCollected = poolPeriod.rewardsCollected.plus(event.params.reward);
    poolPeriod.save();

    let globalPeriodID = periodIndex.toString();
    let globalPeriod = GlobalPeriod.load(globalPeriodID);
    if (globalPeriod === null) {
        globalPeriod = new GlobalPeriod(globalPeriodID);
        globalPeriod.rewardsDistributed = ZERO_BI;
        globalPeriod.index = periodIndex.toI32();
        globalPeriod.weight = globalWeight;
    }
    globalPeriod.rewardsDistributed = globalPeriod.rewardsDistributed.plus(event.params.reward);
    globalPeriod.save();

    let poolManagerDayData = updatePoolManagerDayData(event);
    poolManagerDayData.dailyRewardsDistributed = poolManagerDayData.dailyRewardsDistributed.plus(event.params.reward);
    poolManagerDayData.save();

    let poolDayData = updatePoolDayData(event, event.params.poolAddress);
    poolDayData.dailyRewardsCollected = poolDayData.dailyRewardsCollected.plus(event.params.reward);
    poolDayData.save();
}

export function handleRegisteredPool(event: RegisteredPool): void {
    let periodIndex = calculatePeriodIndex(event.block.timestamp.toI32());
    let globalWeight = fetchGlobalWeight(periodIndex);

    let poolManager = PoolManager.load(POOL_MANAGER_ADDRESS);
    if (poolManager === null) {
        poolManager = new PoolManager(POOL_MANAGER_ADDRESS);
        poolManager.numberOfRegisteredPools = 0;
        poolManager.numberOfEligiblePools = 0;
        poolManager.globalWeight = ZERO_BI;
        poolManager.totalRewardsDistributed = ZERO_BI;
        poolManager.lastUpdated = ZERO_BI;
    }
    poolManager.globalWeight = globalWeight;
    poolManager.numberOfRegisteredPools = poolManager.numberOfRegisteredPools + 1;
    poolManager.save();

    let pool = new Pool(event.params.poolAddress.toHexString());
    pool.isEligible = false;
    pool.totalRewardsCollected = ZERO_BI;
    pool.unrealizedProfit = ZERO_BI;
    pool.latestRecordedPrice = event.params.seedPrice;
    pool.latestRecordedPeriodIndex = periodIndex.toI32();
    pool.previousRecordedPeriodIndex = periodIndex.toI32();
    pool.previousRecordedPrice = event.params.seedPrice;
    pool.lastUpdated = event.block.timestamp;
    pool.createdOn = event.block.timestamp;
    pool.save();

    let farm = new Farm(event.params.farmAddress.toHexString());
    farm.pool = event.params.poolAddress.toHexString();
    farm.totalRewardsEarned = ZERO_BI;
    farm.totalSupply = ZERO_BI;
    farm.weightedTotalSupply = ZERO_BI;
    farm.numberOfC1 = ZERO_BI;
    farm.numberOfC2 = ZERO_BI;
    farm.numberOfC3 = ZERO_BI;
    farm.numberOfC4 = ZERO_BI;
    farm.save();

    let poolManagerDayData = updatePoolManagerDayData(event);
    poolManagerDayData.dailyPoolsRegistered = poolManagerDayData.dailyPoolsRegistered + 1;
    poolManagerDayData.save();

    let poolDayData = updatePoolDayData(event, event.params.poolAddress);
    poolDayData.unrealizedProfit = ZERO_BI;
    poolDayData.tokenPrice = event.params.seedPrice;
    poolDayData.save();

    // Create the tracked contract based on the template.
    StakingRewardsTemplate.create(event.params.farmAddress);
}

export function handleMarkedPoolAsEligible(event: MarkedPoolAsEligible): void {
    let poolManager = PoolManager.load(POOL_MANAGER_ADDRESS);
    if (poolManager === null) {
        poolManager = new PoolManager(POOL_MANAGER_ADDRESS);
        poolManager.numberOfRegisteredPools = 0;
        poolManager.numberOfEligiblePools = 0;
        poolManager.globalWeight = ZERO_BI;
        poolManager.totalRewardsDistributed = ZERO_BI;
        poolManager.lastUpdated = ZERO_BI;
    }
    poolManager.numberOfEligiblePools = poolManager.numberOfEligiblePools + 1;
    poolManager.save();

    let pool = new Pool(event.params.poolAddress.toHexString());
    pool.isEligible = true;
    pool.save();

    let poolManagerDayData = updatePoolManagerDayData(event);
    poolManagerDayData.dailyPoolsMarkedAsEligible = poolManagerDayData.dailyPoolsMarkedAsEligible + 1;
    poolManagerDayData.save();
}

export function handleUpdatedWeight(event: UpdatedWeight): void {
    let periodIndex = calculatePeriodIndex(event.block.timestamp.toI32());
    let globalWeight = fetchGlobalWeight(periodIndex);
    let poolWeight = fetchPoolWeight(event.params.poolAddress, periodIndex);

    let poolManager = PoolManager.load(POOL_MANAGER_ADDRESS);
    poolManager.globalWeight = globalWeight;
    poolManager.lastUpdated = event.block.timestamp;
    poolManager.save();

    let pool = Pool.load(event.params.poolAddress.toHexString());
    pool.unrealizedProfit = event.params.newUnrealizedProfits;
    pool.lastUpdated = event.block.timestamp;
    if (periodIndex.toI32() > pool.latestRecordedPeriodIndex) {
        pool.previousRecordedPeriodIndex = pool.latestRecordedPeriodIndex;
        pool.previousRecordedPrice = pool.latestRecordedPrice;
    }
    pool.latestRecordedPeriodIndex = periodIndex.toI32();
    pool.latestRecordedPrice = event.params.newTokenPrice;
    pool.save();

    let poolPeriodID = event.params.poolAddress.toHexString() + "-" + periodIndex.toString();
    let poolPeriod = PoolPeriod.load(poolPeriodID);
    if (poolPeriod === null) {
        poolPeriod = new PoolPeriod(poolPeriodID);
        poolPeriod.pool = event.params.poolAddress.toHexString();
        poolPeriod.index = periodIndex.toI32();
        poolPeriod.weight = ZERO_BI;
        poolPeriod.rewardsCollected = ZERO_BI;
    }
    poolPeriod.weight = poolWeight;
    poolPeriod.save();

    let globalPeriodID = periodIndex.toString();
    let globalPeriod = GlobalPeriod.load(globalPeriodID);
    if (globalPeriod === null) {
        globalPeriod = new GlobalPeriod(globalPeriodID);
        globalPeriod.rewardsDistributed = ZERO_BI;
        globalPeriod.index = periodIndex.toI32();
        globalPeriod.weight = ZERO_BI;
    }
    globalPeriod.weight = globalWeight;
    globalPeriod.save();

    let poolDayData = updatePoolDayData(event, event.params.poolAddress);
    poolDayData.unrealizedProfit = event.params.newUnrealizedProfits;
    poolDayData.tokenPrice = event.params.newTokenPrice;
    poolDayData.save();
}