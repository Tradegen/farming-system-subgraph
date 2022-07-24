import {
    Address,
    BigDecimal,
    BigInt
  } from "@graphprotocol/graph-ts";
import {
    Farm,
    User,
    Position,
  } from "../types/schema";
  import {
    Staked,
    Withdrawn,
    RewardPaid
  } from "../types/templates/StakingRewards/StakingRewards";
  import {
    ZERO_BI,
  } from "./helpers";
  import {
    updatePoolDayData
  } from "./dayUpdates";
  
  export function handleStaked(event: Staked): void {
      let farm = Farm.load(event.address.toHexString());
      farm.totalSupply = farm.totalSupply.plus(event.params.amount);
      farm.save();
  
      let user = User.load(event.params.user.toHexString());
      if (user === null) {
        user = new User(event.params.user.toHexString());
        user.totalRewardsCollected = ZERO_BI;
        user.save();
      }

      let positionID = event.address.toHexString() + "-" + event.params.user.toHexString();
      let position = Position.load(positionID);
      if (position === null) {
        position = new Position(positionID);
        position.farm = event.address.toHexString();
        position.user = event.params.user.toHexString();
        position.totalRewardsEarned = ZERO_BI;
        position.totalSupply = ZERO_BI;
        position.numberOfC1 = ZERO_BI;
        position.numberOfC2 = ZERO_BI;
        position.numberOfC3 = ZERO_BI;
        position.numberOfC4 = ZERO_BI;
      }
      position.totalSupply = position.totalSupply.plus(event.params.amount);
      position.save();

      if (event.params.tokenClass == BigInt.fromI32(1)) {
        farm.numberOfC1 = farm.numberOfC1.plus(event.params.amount);
        position.numberOfC1 = position.numberOfC1.plus(event.params.amount);
        
        farm.weightedTotalSupply = farm.weightedTotalSupply.plus(event.params.amount.times(BigInt.fromI32(65)));
      }
      else if (event.params.tokenClass == BigInt.fromI32(2)) {
        farm.numberOfC2 = farm.numberOfC2.plus(event.params.amount);
        position.numberOfC2 = position.numberOfC2.plus(event.params.amount);
        
        farm.weightedTotalSupply = farm.weightedTotalSupply.plus(event.params.amount.times(BigInt.fromI32(20)));
      }
      else if (event.params.tokenClass == BigInt.fromI32(3)) {
        farm.numberOfC3 = farm.numberOfC3.plus(event.params.amount);
        position.numberOfC3 = position.numberOfC3.plus(event.params.amount);
        
        farm.weightedTotalSupply = farm.weightedTotalSupply.plus(event.params.amount.times(BigInt.fromI32(10)));
      }
      else if (event.params.tokenClass == BigInt.fromI32(4)) {
        farm.numberOfC4 = farm.numberOfC4.plus(event.params.amount);
        position.numberOfC4 = position.numberOfC4.plus(event.params.amount);
        
        farm.weightedTotalSupply = farm.weightedTotalSupply.plus(event.params.amount.times(BigInt.fromI32(5)));
      }

      farm.save();
      position.save();
  }

  export function handleWithdrawn(event: Withdrawn): void {
    let farm = Farm.load(event.address.toHexString());
    farm.totalSupply = farm.totalSupply.minus(event.params.amount);
    farm.save();

    let user = User.load(event.params.user.toHexString());
    if (user === null) {
      user = new User(event.params.user.toHexString());
      user.totalRewardsCollected = ZERO_BI;
      user.save();
    }

    let positionID = event.address.toHexString() + "-" + event.params.user.toHexString();
    let position = Position.load(positionID);
    position.totalSupply = position.totalSupply.minus(event.params.amount);
    position.save();

    if (event.params.tokenClass == BigInt.fromI32(1)) {
      farm.numberOfC1 = farm.numberOfC1.minus(event.params.amount);
      position.numberOfC1 = position.numberOfC1.minus(event.params.amount);
      
      farm.weightedTotalSupply = farm.weightedTotalSupply.minus(event.params.amount.times(BigInt.fromI32(65)));
    }
    else if (event.params.tokenClass == BigInt.fromI32(2)) {
      farm.numberOfC2 = farm.numberOfC2.minus(event.params.amount);
      position.numberOfC2 = position.numberOfC2.minus(event.params.amount);
      
      farm.weightedTotalSupply = farm.weightedTotalSupply.minus(event.params.amount.times(BigInt.fromI32(20)));
    }
    else if (event.params.tokenClass == BigInt.fromI32(3)) {
      farm.numberOfC3 = farm.numberOfC3.minus(event.params.amount);
      position.numberOfC3 = position.numberOfC3.minus(event.params.amount);
      
      farm.weightedTotalSupply = farm.weightedTotalSupply.minus(event.params.amount.times(BigInt.fromI32(10)));
    }
    else if (event.params.tokenClass == BigInt.fromI32(4)) {
      farm.numberOfC4 = farm.numberOfC4.minus(event.params.amount);
      position.numberOfC4 = position.numberOfC4.minus(event.params.amount);
      
      farm.weightedTotalSupply = farm.weightedTotalSupply.minus(event.params.amount.times(BigInt.fromI32(5)));
    }

    farm.save();
    position.save();
}

export function handleRewardPaid(event: RewardPaid): void {
    let farm = Farm.load(event.address.toHexString());
    farm.totalRewardsEarned = farm.totalRewardsEarned.plus(event.params.reward);
    farm.save();

    let user = User.load(event.params.user.toHexString());
    if (user === null) {
      user = new User(event.params.user.toHexString());
      user.totalRewardsCollected = ZERO_BI;
    }
    user.totalRewardsCollected = user.totalRewardsCollected.plus(event.params.reward);
    user.save();

    let positionID = event.address.toHexString() + "-" + event.params.user.toHexString();
    let position = Position.load(positionID);
    if (position === null) {
      position = new Position(positionID);
      position.farm = event.address.toHexString();
      position.user = event.params.user.toHexString();
      position.totalRewardsEarned = ZERO_BI;
      position.totalSupply = ZERO_BI;
      position.numberOfC1 = ZERO_BI;
      position.numberOfC2 = ZERO_BI;
      position.numberOfC3 = ZERO_BI;
      position.numberOfC4 = ZERO_BI;
    }
    position.totalRewardsEarned = position.totalRewardsEarned.plus(event.params.reward);
    position.save();

    let dayData = updatePoolDayData(event);
    dayData.dailyRewardsCollected = dayData.dailyRewardsCollected.plus(event.params.reward);
    dayData.save();
}