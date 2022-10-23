# Farming System Subgraph

This subgraph dynamically tracks the pools, farms, and reward distribution in the [Tradegen farming system](https://github.com/Tradegen/farming-v2).

- aggregated data across pools and farms,
- data on individual pools,
- data on individual farms,
- data on each user's positions and total rewards collected,
- data on each position in a farm,
- historical data on each pool's unrealized profits, token price, and rewards distributed

## Running Locally

Make sure to update package.json settings to point to your own graph account.

## Queries

Below are a few ways to show how to query the [farming-system subgraph](https://thegraph.com/hosted-service/subgraph/tradegen/farming-system) for data. The queries show most of the information that is queryable, but there are many other filtering options that can be used, just check out the [querying api](https://thegraph.com/docs/graphql-api). These queries can be used locally or in The Graph Explorer playground.

## Key Entity Overviews

#### PoolManager

Contains aggregated data across all pools. This entity tracks the number of registered pools, the number of eligible pools, total weight across all pools, total rewards distributed, and the timestamp at which the system was last updated (a transaction occurred).

#### Pool

Contains data on a specific pool. Tracks the total rewards users have collected from the pool, the pool's unrealized profit, latest/previous recorded price/index, and the pool's associated periods.

#### Farm

Contains data on a specific farm. Each farm is linked to a Pool entity. This entity tracks deposits by token class and all positions associated with the farm.

#### Position

Represents a user's position in a farm. Each user can only have one Position entity per farm. Future deposits/withdraws are accounted for by updating the user's existing Position entity for the farm. Each Position entity is linked to a Farm and a User entity. This entity tracks a user's deposits by token class (C1-C4; specifies the rarity of a token), the total number of tokens the user has in the position (aggregated across token classes), and the total rewards the user has claimed from the farm (denominated in the farm's reward token; not necessarily USD). 

## Example Queries

### Querying Aggregated Data

This query fetches aggredated data from all pools, to give a view into how much activity is happening within the protocol.

```graphql
{
  poolManagers(first: 1) {
    numberOfRegisteredPools
    numberOfEligiblePools
    globalWeight
    totalRewardsDistributed
  }
}
```
