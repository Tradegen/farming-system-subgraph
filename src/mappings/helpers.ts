import {
    Address,
    BigDecimal,
    BigInt
  } from "@graphprotocol/graph-ts";
  import { PoolManager } from "../types/PoolManager/PoolManager";
  
  export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
  export const POOL_MANAGER_ADDRESS = "0xBcF24A50cd948b111bB0D297F27c53c063294fa4";
  export const START_TIME = 1661990400
  export const PERIOD_DURATION = 86400 * 14 // 14 days
    
  export let ZERO_BI = BigInt.fromI32(0);
  export let ONE_BI = BigInt.fromI32(1);
  export let ZERO_BD = BigDecimal.fromString("0");
  export let ONE_BD = BigDecimal.fromString("1");
  export let BI_18 = BigInt.fromI32(18);
  
  export let poolManagerContract = PoolManager.bind(
    Address.fromString(POOL_MANAGER_ADDRESS)
  );
  
  export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
    let bd = BigDecimal.fromString("1");
    for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
      bd = bd.times(BigDecimal.fromString("10"));
    }
    return bd;
  }
  
  export function bigDecimalExp18(): BigDecimal {
    return BigDecimal.fromString("1000000000000000000");
  }
  
  export function convertEthToDecimal(eth: BigInt): BigDecimal {
    return eth.toBigDecimal().div(exponentToBigDecimal(new BigInt(18)));
  }
  
  export function convertTokenToDecimal(
    tokenAmount: BigInt,
    exchangeDecimals: BigInt
  ): BigDecimal {
    if (exchangeDecimals == ZERO_BI) {
      return tokenAmount.toBigDecimal();
    }
    return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals));
  }
  
  export function equalToZero(value: BigDecimal): boolean {
    const formattedVal = parseFloat(value.toString());
    const zero = parseFloat(ZERO_BD.toString());
    if (zero == formattedVal) {
      return true;
    }
    return false;
  }
  
  export function isNullEthValue(value: string): boolean {
    return (
      value ==
      "0x0000000000000000000000000000000000000000000000000000000000000001"
    );
  }

  export function calculatePeriodIndex(currentTime: number): number {
    const delta = (currentTime - START_TIME) % PERIOD_DURATION
    return (currentTime - START_TIME - delta) / PERIOD_DURATION
  }

  export function fetchPoolWeight(poolAddress: Address, index: number): BigInt {
    let contract = PoolManager.bind(Address.fromString(POOL_MANAGER_ADDRESS));
  
    let weightResult = contract.try_poolPeriods(poolAddress, BigInt.fromI32(index));
  
    return weightResult.value ? weightResult.value : ZERO_BI;
  }

  export function fetchGlobalWeight(index: number): BigInt {
    let contract = PoolManager.bind(Address.fromString(POOL_MANAGER_ADDRESS));
  
    let weightResult = contract.try_globalPeriods(BigInt.fromI32(index));
  
    return weightResult.value ? weightResult.value : ZERO_BI;
  }