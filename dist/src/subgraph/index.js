"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPool = void 0;
const graphql_request_1 = require("graphql-request");
const getPool = async (poolId, blockNumber, network = "mainnet") => {
    const data = `
    id
    address
    poolType
    swapFee
    totalShares
    amp
    tokens {
      id
      address
      symbol
      balance
      decimals
      weight
    }
  `;
    let query;
    if (blockNumber) {
        query = (0, graphql_request_1.gql) `
      query getPool($poolId: ID!, $blockNumber: Int!) {
        pools(where: { id: $poolId }, block: { number: $blockNumber }) {
          ${data}
        }
      }
    `;
    }
    else {
        query = (0, graphql_request_1.gql) `
      query getPool($poolId: ID!) {
        pools(where: { id: $poolId }) {
          ${data}
        }
      }
    `;
    }
    let subgraphUrl;
    if (network === "mainnet") {
        subgraphUrl =
            "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-v2";
    }
    else {
        subgraphUrl = `https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-${network}-v2`;
    }
    const result = await (0, graphql_request_1.request)(subgraphUrl, query, { poolId, blockNumber });
    if (result && result.pools && result.pools.length) {
        return result.pools[0];
    }
    return null;
};
exports.getPool = getPool;
