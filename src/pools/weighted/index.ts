import { getBalancerContractAddress } from "@balancer-labs/v2-deployments";
import { Interface } from "@ethersproject/abi";
import { Provider } from "@ethersproject/abstract-provider";
import { Contract } from "@ethersproject/contracts";
import { formatEther, formatUnits } from "@ethersproject/units";

import { getPool } from "../../subgraph/index";
import { bn } from "../../utils/big-number";
import { shallowCopyAll } from "../../utils/common";
import BasePool, { IBasePoolParams, IBasePoolToken } from "../base";
import * as math from "./math";

export interface IWeightedPoolToken extends IBasePoolToken {
  weight: string;
}

export interface IWeightedPoolParams extends IBasePoolParams {
  tokens: IWeightedPoolToken[];
}

export default class WeightedPool extends BasePool {
  private MIN_TOKENS = 2;
  private MAX_TOKENS = 8;

  // A minimum normalized weight imposes a maximum weight ratio
  // We need this due to limitations in the implementation of the power function, as these ratios are often exponents
  private MIN_WEIGHT = bn("0.01"); // 0.01e18

  private _tokens: IWeightedPoolToken[];

  // ---------------------- Getters ----------------------

  get tokens() {
    // Shallow-copy to disallow direct changes
    return shallowCopyAll(this._tokens);
  }

  // ---------------------- Constructor ----------------------

  constructor(params: IWeightedPoolParams) {
    super(params);

    if (params.tokens.length < this.MIN_TOKENS) {
      throw new Error("MIN_TOKENS");
    }
    if (params.tokens.length > this.MAX_TOKENS) {
      throw new Error("MAX_TOKENS");
    }

    this._tokens = shallowCopyAll(params.tokens);

    let normalizedSum = bn(0);
    for (let i = 0; i < params.tokens.length; i++) {
      if (bn(params.tokens[i].weight).lt(this.MIN_WEIGHT)) {
        throw new Error("MIN_WEIGHT");
      }
      normalizedSum = normalizedSum.plus(params.tokens[i].weight);
    }

    if (!normalizedSum.eq(1)) {
      throw new Error("NORMALIZED_WEIGHT_INVARIANT");
    }
  }

  // ---------------------- On-chain initializer ----------------------

  public static async initFromOnchain(
    provider: Provider,
    poolId: string,
    network = "mainnet",
    query = false
  ) {
    const vaultInterface = new Interface([
      "function getPool(bytes32 poolId) view returns (address, uint8)",
      "function getPoolTokens(bytes32 poolId) view returns (address[], uint256[], uint256)",
    ]);
    const poolInterface = new Interface([
      "function getSwapFeePercentage() view returns (uint256)",
      "function totalSupply() view returns (uint256)",
      "function getNormalizedWeights() view returns (uint256[])",
    ]);
    const tokenInterface = new Interface([
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
    ]);

    // Initialize vault contract
    const vaultAddress = await getBalancerContractAddress(
      "20210418-vault",
      "Vault",
      network
    );
    const vault = new Contract(vaultAddress, vaultInterface, provider);

    // Initialize pool contract
    const [poolAddress] = await vault.getPool(poolId);
    const pool = new Contract(poolAddress, poolInterface, provider);

    // Fetch pool information
    const bptTotalSupply = formatEther(await pool.totalSupply());
    const swapFeePercentage = formatEther(await pool.getSwapFeePercentage());

    // Fetch tokens information
    const [tokenAddresses, tokenBalances] = await vault.getPoolTokens(poolId);
    const tokenWeights = await pool.getNormalizedWeights();
    const numTokens = Math.min(
      tokenAddresses.length,
      tokenBalances.length,
      tokenWeights.length
    );

    const tokens: IWeightedPoolToken[] = [];
    for (let i = 0; i < numTokens; i++) {
      // Initialize token contract
      const token = new Contract(tokenAddresses[i], tokenInterface, provider);

      const symbol = await token.symbol();
      const decimals = await token.decimals();
      const balance = formatUnits(tokenBalances[i], decimals);
      const weight = formatEther(tokenWeights[i]);

      tokens.push({
        address: token.address,
        symbol,
        balance,
        decimals,
        weight,
      });
    }

    return new WeightedPool({
      id: poolId,
      address: poolAddress,
      tokens,
      bptTotalSupply,
      swapFeePercentage,
      query,
    });
  }

  // ---------------------- Subgraph initializer ----------------------

  public static async initFromSubgraph(
    poolId: string,
    network = "mainnet",
    query = false,
    blockNumber?: number
  ): Promise<WeightedPool> {
    const pool = await getPool(poolId, blockNumber, network);
    if (!pool) {
      throw new Error("Could not fetch pool data");
    }

    if (pool.poolType !== "Weighted") {
      throw new Error("Pool must be weighted");
    }

    const id = pool.id;
    const address = pool.address;
    const bptTotalSupply = pool.totalShares;
    const swapFeePercentage = pool.swapFee;

    const tokens: IWeightedPoolToken[] = [];
    for (const token of pool.tokens) {
      tokens.push({
        address: token.address,
        symbol: token.symbol,
        balance: token.balance,
        decimals: token.decimals,
        weight: token.weight,
      });
    }

    return new WeightedPool({
      id,
      address,
      tokens,
      bptTotalSupply,
      swapFeePercentage,
      query,
    });
  }

  // ---------------------- Misc ----------------------

  public getInvariant(): string {
    const invariant = math._calculateInvariant(
      this._tokens.map((t) => this._upScale(t.weight, 18)),
      this._tokens.map((t) => this._upScale(t.balance, t.decimals))
    );
    return invariant.toString();
  }

  // ---------------------- Swap actions ----------------------

  public swapGivenIn(
    tokenInSymbol: string,
    tokenOutSymbol: string,
    amountIn: string
  ): string {
    const tokenIn = this._tokens.find((t) => t.symbol === tokenInSymbol);
    const tokenOut = this._tokens.find((t) => t.symbol === tokenOutSymbol);

    const scaledAmountOut = math._calcOutGivenIn(
      this._upScale(tokenIn.balance, tokenIn.decimals),
      this._upScale(tokenIn.weight, 18),
      this._upScale(tokenOut.balance, tokenOut.decimals),
      this._upScale(tokenOut.weight, 18),
      this._upScale(amountIn, tokenIn.decimals),
      {
        swapFeePercentage: this._upScale(this._swapFeePercentage, 18),
        tokenInDecimals: tokenIn.decimals,
      }
    );
    const amountOut = this._downScaleDown(scaledAmountOut, tokenOut.decimals);

    // In-place balance updates
    if (!this._query) {
      tokenIn.balance = bn(tokenIn.balance).plus(amountIn).toString();
      tokenOut.balance = bn(tokenOut.balance).minus(amountOut).toString();
    }

    return amountOut.toString();
  }

  public swapGivenOut(
    tokenInSymbol: string,
    tokenOutSymbol: string,
    amountOut: string
  ): string {
    const tokenIn = this._tokens.find((t) => t.symbol === tokenInSymbol);
    const tokenOut = this._tokens.find((t) => t.symbol === tokenOutSymbol);

    const scaledAmountIn = math._calcInGivenOut(
      this._upScale(tokenIn.balance, tokenIn.decimals),
      this._upScale(tokenIn.weight, 18),
      this._upScale(tokenOut.balance, tokenOut.decimals),
      this._upScale(tokenOut.weight, 18),
      this._upScale(amountOut, tokenOut.decimals),
      {
        swapFeePercentage: this._upScale(this._swapFeePercentage, 18),
        tokenInDecimals: tokenIn.decimals,
      }
    );
    const amountIn = this._downScaleUp(scaledAmountIn, tokenIn.decimals);

    // In-place balance updates
    if (!this._query) {
      tokenIn.balance = bn(tokenIn.balance).plus(amountIn).toString();
      tokenOut.balance = bn(tokenOut.balance).minus(amountOut).toString();
    }

    return amountIn.toString();
  }

  // ---------------------- LP actions ----------------------

  public joinExactTokensInForBptOut(amountsIn: {
    [symbol: string]: string;
  }): string {
    if (Object.keys(amountsIn).length !== this._tokens.length) {
      throw new Error("Invalid input");
    }

    const scaledBptOut = math._calcBptOutGivenExactTokensIn(
      this._tokens.map((t) => this._upScale(t.balance, t.decimals)),
      this._tokens.map((t) => this._upScale(t.weight, 18)),
      this._tokens.map((t) => this._upScale(amountsIn[t.symbol], t.decimals)),
      this._upScale(this._bptTotalSupply, 18),
      this._upScale(this._swapFeePercentage, 18)
    );
    const bptOut = this._downScaleDown(scaledBptOut, 18);

    // In-place balance updates
    if (!this._query) {
      for (let i = 0; i < this._tokens.length; i++) {
        const token = this._tokens[i];
        token.balance = bn(token.balance)
          .plus(amountsIn[token.symbol])
          .toString();
      }
      this._bptTotalSupply = bn(this._bptTotalSupply).plus(bptOut).toString();
    }

    return bptOut.toString();
  }

  public joinTokenInForExactBptOut(
    tokenInSymbol: string,
    bptOut: string
  ): string {
    const tokenIn = this._tokens.find((t) => t.symbol === tokenInSymbol);
    if (!tokenIn) {
      throw new Error("Invalid input");
    }

    const scaledAmountIn = math._calcTokenInGivenExactBptOut(
      this._upScale(tokenIn.balance, tokenIn.decimals),
      this._upScale(tokenIn.weight, 18),
      this._upScale(bptOut, 18),
      this._upScale(this._bptTotalSupply, 18),
      this._upScale(this._swapFeePercentage, 18)
    );
    const amountIn = this._downScaleUp(scaledAmountIn, tokenIn.decimals);

    // In-place balance updates
    if (!this._query) {
      tokenIn.balance = bn(tokenIn.balance).plus(amountIn).toString();
      this._bptTotalSupply = bn(this._bptTotalSupply).plus(bptOut).toString();
    }

    return amountIn.toString();
  }

  public exitExactBptInForTokenOut(
    tokenOutSymbol: string,
    bptIn: string
  ): string {
    const tokenOut = this._tokens.find((t) => t.symbol === tokenOutSymbol);
    if (!tokenOut) {
      throw new Error("Invalid input");
    }

    const scaledAmountOut = math._calcTokenOutGivenExactBptIn(
      this._upScale(tokenOut.balance, tokenOut.decimals),
      this._upScale(tokenOut.weight, 18),
      this._upScale(bptIn, 18),
      this._upScale(this._bptTotalSupply, 18),
      this._upScale(this._swapFeePercentage, 18)
    );
    const amountOut = this._downScaleDown(scaledAmountOut, tokenOut.decimals);

    // In-place balance updates
    if (!this._query) {
      tokenOut.balance = bn(tokenOut.balance).minus(amountOut).toString();
      this._bptTotalSupply = bn(this._bptTotalSupply).minus(bptIn).toString();
    }

    return amountOut.toString();
  }

  public exitExactBptInForTokensOut(bptIn: string): string[] {
    // Exactly match the EVM version
    if (bn(bptIn).gt(this._bptTotalSupply)) {
      throw new Error("BPT in exceeds total supply");
    }

    const scaledAmountsOut = math._calcTokensOutGivenExactBptIn(
      this._tokens.map((t) => this._upScale(t.balance, t.decimals)),
      this._upScale(bptIn, 18),
      this._upScale(this._bptTotalSupply, 18)
    );
    const amountsOut = scaledAmountsOut.map((amount, i) =>
      this._downScaleDown(amount, this._tokens[i].decimals)
    );

    // In-place balance updates
    if (!this._query) {
      for (let i = 0; i < this._tokens.length; i++) {
        const token = this._tokens[i];
        token.balance = bn(token.balance).minus(amountsOut[i]).toString();
      }
      this._bptTotalSupply = bn(this._bptTotalSupply).minus(bptIn).toString();
    }

    return amountsOut.map((a) => a.toString());
  }

  public exitBptInForExactTokensOut(amountsOut: {
    [symbol: string]: string;
  }): string {
    if (Object.keys(amountsOut).length !== this._tokens.length) {
      throw new Error("Invalid input");
    }

    const scaledBptIn = math._calcBptInGivenExactTokensOut(
      this._tokens.map((t) => this._upScale(t.balance, t.decimals)),
      this._tokens.map((t) => this._upScale(t.weight, 18)),
      this._tokens.map((t) => this._upScale(amountsOut[t.symbol], t.decimals)),
      this._upScale(this._bptTotalSupply, 18),
      this._upScale(this._swapFeePercentage, 18)
    );
    const bptIn = this._downScaleUp(scaledBptIn, 18);

    // In-place balance updates
    if (!this._query) {
      for (let i = 0; i < this._tokens.length; i++) {
        const token = this._tokens[i];
        token.balance = bn(token.balance)
          .minus(amountsOut[token.symbol])
          .toString();
      }
      this._bptTotalSupply = bn(this._bptTotalSupply).minus(bptIn).toString();
    }

    return bptIn.toString();
  }
}
