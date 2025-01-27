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

export interface IStablePoolToken extends IBasePoolToken {}

export interface IStablePoolParams extends IBasePoolParams {
  tokens: IStablePoolToken[];
  amplificationParameter: string;
}

export default class StablePool extends BasePool {
  private _tokens: IStablePoolToken[];
  private _amplificationParameter: string;

  // ---------------------- Getters ----------------------

  get tokens() {
    // Shallow-copy to disallow direct changes
    return shallowCopyAll(this._tokens);
  }

  get amplificationParameter() {
    return bn(this._amplificationParameter).idiv(math.AMP_PRECISION).toString();
  }

  // ---------------------- Constructor ----------------------

  constructor(params: IStablePoolParams) {
    super(params);

    if (params.tokens.length > math.MAX_STABLE_TOKENS) {
      throw new Error("MAX_STABLE_TOKENS");
    }

    this._tokens = shallowCopyAll(params.tokens);

    if (bn(params.amplificationParameter).lt(math.MIN_AMP)) {
      throw new Error("MIN_AMP");
    }
    if (bn(params.amplificationParameter).gt(math.MAX_AMP)) {
      throw new Error("MAX_AMP");
    }

    this._amplificationParameter = bn(params.amplificationParameter)
      .times(math.AMP_PRECISION)
      .toString();
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
      "function getAmplificationParameter() view returns (uint256, bool, uint256)",
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
    const [ampValue, , ampPrecision] = await pool.getAmplificationParameter();
    const amplificationParameter = ampValue.div(ampPrecision).toString();

    // Fetch tokens information
    const [tokenAddresses, tokenBalances] = await vault.getPoolTokens(poolId);
    const numTokens = Math.min(tokenAddresses.length, tokenBalances.length);

    const tokens: IStablePoolToken[] = [];
    for (let i = 0; i < numTokens; i++) {
      // Initialize token contract
      const token = new Contract(tokenAddresses[i], tokenInterface, provider);

      const symbol = await token.symbol();
      const decimals = await token.decimals();
      const balance = formatUnits(tokenBalances[i], decimals);

      tokens.push({
        address: token.address,
        symbol,
        balance,
        decimals,
      });
    }

    return new StablePool({
      id: poolId,
      address: poolAddress,
      tokens,
      bptTotalSupply,
      swapFeePercentage,
      amplificationParameter,
      query,
    });
  }

  // ---------------------- Subgraph initializer ----------------------

  public static async initFromSubgraph(
    poolId: string,
    network = "mainnet",
    query = false,
    blockNumber?: number
  ): Promise<StablePool> {
    const pool = await getPool(poolId, blockNumber, network);
    if (!pool) {
      throw new Error("Could not fetch pool data");
    }

    if (pool.poolType !== "Stable") {
      throw new Error("Pool must be stable");
    }

    const id = pool.id;
    const address = pool.address;
    const bptTotalSupply = pool.totalShares;
    const swapFeePercentage = pool.swapFee;
    const amplificationParameter = pool.amp;

    const tokens: IStablePoolToken[] = [];
    for (const token of pool.tokens) {
      tokens.push({
        address: token.address,
        symbol: token.symbol,
        balance: token.balance,
        decimals: token.decimals,
      });
    }

    return new StablePool({
      id,
      address,
      tokens,
      bptTotalSupply,
      swapFeePercentage,
      amplificationParameter,
      query,
    });
  }

  // ---------------------- Swap actions ----------------------

  public swapGivenIn(
    tokenInSymbol: string,
    tokenOutSymbol: string,
    amountIn: string
  ): string {
    const tokenIndexIn = this._tokens.findIndex(
      (t) => t.symbol === tokenInSymbol
    );
    const tokenIndexOut = this._tokens.findIndex(
      (t) => t.symbol === tokenOutSymbol
    );

    const tokenIn = this._tokens[tokenIndexIn];
    const tokenOut = this._tokens[tokenIndexOut];

    const scaledAmountOut = math._calcOutGivenIn(
      bn(this._amplificationParameter),
      this._tokens.map((t) => this._upScale(t.balance, t.decimals)),
      tokenIndexIn,
      tokenIndexOut,
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
    const tokenIndexIn = this._tokens.findIndex(
      (t) => t.symbol === tokenInSymbol
    );
    const tokenIndexOut = this._tokens.findIndex(
      (t) => t.symbol === tokenOutSymbol
    );

    const tokenIn = this._tokens[tokenIndexIn];
    const tokenOut = this._tokens[tokenIndexOut];

    const scaledAmountIn = math._calcInGivenOut(
      bn(this._amplificationParameter),
      this._tokens.map((t) => this._upScale(t.balance, t.decimals)),
      tokenIndexIn,
      tokenIndexOut,
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
      bn(this._amplificationParameter),
      this._tokens.map((t) => this._upScale(t.balance, t.decimals)),
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
    const tokenIndex = this._tokens.findIndex(
      (t) => t.symbol === tokenInSymbol
    );

    const tokenIn = this._tokens[tokenIndex];
    if (!tokenIn) {
      throw new Error("Invalid input");
    }

    const scaledAmountIn = math._calcTokenInGivenExactBptOut(
      bn(this._amplificationParameter),
      this._tokens.map((t) => this._upScale(t.balance, t.decimals)),
      tokenIndex,
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
    const tokenIndex = this._tokens.findIndex(
      (t) => t.symbol === tokenOutSymbol
    );

    const tokenOut = this._tokens[tokenIndex];
    if (!tokenOut) {
      throw new Error("Invalid input");
    }

    const scaledAmountOut = math._calcTokenOutGivenExactBptIn(
      bn(this._amplificationParameter),
      this._tokens.map((t) => this._upScale(t.balance, t.decimals)),
      tokenIndex,
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
      bn(this._amplificationParameter),
      this._tokens.map((t) => this._upScale(t.balance, t.decimals)),
      this._tokens.map((t) => this._upScale(amountsOut[t.symbol], t.decimals)),
      this._upScale(this._bptTotalSupply, 18),
      this._upScale(this._swapFeePercentage, 18)
    );
    const bptIn = this._downScaleDown(scaledBptIn, 18);

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
