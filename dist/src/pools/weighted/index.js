"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const v2_deployments_1 = require("@balancer-labs/v2-deployments");
const abi_1 = require("@ethersproject/abi");
const contracts_1 = require("@ethersproject/contracts");
const units_1 = require("@ethersproject/units");
const index_1 = require("../../subgraph/index");
const big_number_1 = require("../../utils/big-number");
const common_1 = require("../../utils/common");
const base_1 = require("../base");
const math = require("./math");
class WeightedPool extends base_1.default {
    // ---------------------- Constructor ----------------------
    constructor(params) {
        super(params);
        this.MIN_TOKENS = 2;
        this.MAX_TOKENS = 8;
        // A minimum normalized weight imposes a maximum weight ratio
        // We need this due to limitations in the implementation of the power function, as these ratios are often exponents
        this.MIN_WEIGHT = (0, big_number_1.bn)("0.01"); // 0.01e18
        if (params.tokens.length < this.MIN_TOKENS) {
            throw new Error("MIN_TOKENS");
        }
        if (params.tokens.length > this.MAX_TOKENS) {
            throw new Error("MAX_TOKENS");
        }
        this._tokens = (0, common_1.shallowCopyAll)(params.tokens);
        let normalizedSum = (0, big_number_1.bn)(0);
        for (let i = 0; i < params.tokens.length; i++) {
            if ((0, big_number_1.bn)(params.tokens[i].weight).lt(this.MIN_WEIGHT)) {
                throw new Error("MIN_WEIGHT");
            }
            normalizedSum = normalizedSum.plus(params.tokens[i].weight);
        }
        if (!normalizedSum.eq(1)) {
            throw new Error("NORMALIZED_WEIGHT_INVARIANT");
        }
    }
    // ---------------------- Getters ----------------------
    get tokens() {
        // Shallow-copy to disallow direct changes
        return (0, common_1.shallowCopyAll)(this._tokens);
    }
    // ---------------------- On-chain initializer ----------------------
    static async initFromOnchain(provider, poolId, network = "mainnet", query = false) {
        const vaultInterface = new abi_1.Interface([
            "function getPool(bytes32 poolId) view returns (address, uint8)",
            "function getPoolTokens(bytes32 poolId) view returns (address[], uint256[], uint256)",
        ]);
        const poolInterface = new abi_1.Interface([
            "function getSwapFeePercentage() view returns (uint256)",
            "function totalSupply() view returns (uint256)",
            "function getNormalizedWeights() view returns (uint256[])",
        ]);
        const tokenInterface = new abi_1.Interface([
            "function symbol() view returns (string)",
            "function decimals() view returns (uint8)",
        ]);
        // Initialize vault contract
        const vaultAddress = await (0, v2_deployments_1.getBalancerContractAddress)("20210418-vault", "Vault", network);
        const vault = new contracts_1.Contract(vaultAddress, vaultInterface, provider);
        // Initialize pool contract
        const [poolAddress] = await vault.getPool(poolId);
        const pool = new contracts_1.Contract(poolAddress, poolInterface, provider);
        // Fetch pool information
        const bptTotalSupply = (0, units_1.formatEther)(await pool.totalSupply());
        const swapFeePercentage = (0, units_1.formatEther)(await pool.getSwapFeePercentage());
        // Fetch tokens information
        const [tokenAddresses, tokenBalances] = await vault.getPoolTokens(poolId);
        const tokenWeights = await pool.getNormalizedWeights();
        const numTokens = Math.min(tokenAddresses.length, tokenBalances.length, tokenWeights.length);
        const tokens = [];
        for (let i = 0; i < numTokens; i++) {
            // Initialize token contract
            const token = new contracts_1.Contract(tokenAddresses[i], tokenInterface, provider);
            const symbol = await token.symbol();
            const decimals = await token.decimals();
            const balance = (0, units_1.formatUnits)(tokenBalances[i], decimals);
            const weight = (0, units_1.formatEther)(tokenWeights[i]);
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
    static async initFromSubgraph(poolId, network = "mainnet", query = false, blockNumber) {
        const pool = await (0, index_1.getPool)(poolId, blockNumber, network);
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
        const tokens = [];
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
    getInvariant() {
        const invariant = math._calculateInvariant(this._tokens.map((t) => this._upScale(t.weight, 18)), this._tokens.map((t) => this._upScale(t.balance, t.decimals)));
        return invariant.toString();
    }
    // ---------------------- Swap actions ----------------------
    swapGivenIn(tokenInSymbol, tokenOutSymbol, amountIn) {
        const tokenIn = this._tokens.find((t) => t.symbol === tokenInSymbol);
        const tokenOut = this._tokens.find((t) => t.symbol === tokenOutSymbol);
        const scaledAmountOut = math._calcOutGivenIn(this._upScale(tokenIn.balance, tokenIn.decimals), this._upScale(tokenIn.weight, 18), this._upScale(tokenOut.balance, tokenOut.decimals), this._upScale(tokenOut.weight, 18), this._upScale(amountIn, tokenIn.decimals), {
            swapFeePercentage: this._upScale(this._swapFeePercentage, 18),
            tokenInDecimals: tokenIn.decimals,
        });
        const amountOut = this._downScaleDown(scaledAmountOut, tokenOut.decimals);
        // In-place balance updates
        if (!this._query) {
            tokenIn.balance = (0, big_number_1.bn)(tokenIn.balance).plus(amountIn).toString();
            tokenOut.balance = (0, big_number_1.bn)(tokenOut.balance).minus(amountOut).toString();
        }
        return amountOut.toString();
    }
    swapGivenOut(tokenInSymbol, tokenOutSymbol, amountOut) {
        const tokenIn = this._tokens.find((t) => t.symbol === tokenInSymbol);
        const tokenOut = this._tokens.find((t) => t.symbol === tokenOutSymbol);
        const scaledAmountIn = math._calcInGivenOut(this._upScale(tokenIn.balance, tokenIn.decimals), this._upScale(tokenIn.weight, 18), this._upScale(tokenOut.balance, tokenOut.decimals), this._upScale(tokenOut.weight, 18), this._upScale(amountOut, tokenOut.decimals), {
            swapFeePercentage: this._upScale(this._swapFeePercentage, 18),
            tokenInDecimals: tokenIn.decimals,
        });
        const amountIn = this._downScaleUp(scaledAmountIn, tokenIn.decimals);
        // In-place balance updates
        if (!this._query) {
            tokenIn.balance = (0, big_number_1.bn)(tokenIn.balance).plus(amountIn).toString();
            tokenOut.balance = (0, big_number_1.bn)(tokenOut.balance).minus(amountOut).toString();
        }
        return amountIn.toString();
    }
    // ---------------------- LP actions ----------------------
    joinExactTokensInForBptOut(amountsIn) {
        if (Object.keys(amountsIn).length !== this._tokens.length) {
            throw new Error("Invalid input");
        }
        const scaledBptOut = math._calcBptOutGivenExactTokensIn(this._tokens.map((t) => this._upScale(t.balance, t.decimals)), this._tokens.map((t) => this._upScale(t.weight, 18)), this._tokens.map((t) => this._upScale(amountsIn[t.symbol], t.decimals)), this._upScale(this._bptTotalSupply, 18), this._upScale(this._swapFeePercentage, 18));
        const bptOut = this._downScaleDown(scaledBptOut, 18);
        // In-place balance updates
        if (!this._query) {
            for (let i = 0; i < this._tokens.length; i++) {
                const token = this._tokens[i];
                token.balance = (0, big_number_1.bn)(token.balance)
                    .plus(amountsIn[token.symbol])
                    .toString();
            }
            this._bptTotalSupply = (0, big_number_1.bn)(this._bptTotalSupply).plus(bptOut).toString();
        }
        return bptOut.toString();
    }
    joinTokenInForExactBptOut(tokenInSymbol, bptOut) {
        const tokenIn = this._tokens.find((t) => t.symbol === tokenInSymbol);
        if (!tokenIn) {
            throw new Error("Invalid input");
        }
        const scaledAmountIn = math._calcTokenInGivenExactBptOut(this._upScale(tokenIn.balance, tokenIn.decimals), this._upScale(tokenIn.weight, 18), this._upScale(bptOut, 18), this._upScale(this._bptTotalSupply, 18), this._upScale(this._swapFeePercentage, 18));
        const amountIn = this._downScaleUp(scaledAmountIn, tokenIn.decimals);
        // In-place balance updates
        if (!this._query) {
            tokenIn.balance = (0, big_number_1.bn)(tokenIn.balance).plus(amountIn).toString();
            this._bptTotalSupply = (0, big_number_1.bn)(this._bptTotalSupply).plus(bptOut).toString();
        }
        return amountIn.toString();
    }
    exitExactBptInForTokenOut(tokenOutSymbol, bptIn) {
        const tokenOut = this._tokens.find((t) => t.symbol === tokenOutSymbol);
        if (!tokenOut) {
            throw new Error("Invalid input");
        }
        const scaledAmountOut = math._calcTokenOutGivenExactBptIn(this._upScale(tokenOut.balance, tokenOut.decimals), this._upScale(tokenOut.weight, 18), this._upScale(bptIn, 18), this._upScale(this._bptTotalSupply, 18), this._upScale(this._swapFeePercentage, 18));
        const amountOut = this._downScaleDown(scaledAmountOut, tokenOut.decimals);
        // In-place balance updates
        if (!this._query) {
            tokenOut.balance = (0, big_number_1.bn)(tokenOut.balance).minus(amountOut).toString();
            this._bptTotalSupply = (0, big_number_1.bn)(this._bptTotalSupply).minus(bptIn).toString();
        }
        return amountOut.toString();
    }
    exitExactBptInForTokensOut(bptIn) {
        // Exactly match the EVM version
        if ((0, big_number_1.bn)(bptIn).gt(this._bptTotalSupply)) {
            throw new Error("BPT in exceeds total supply");
        }
        const scaledAmountsOut = math._calcTokensOutGivenExactBptIn(this._tokens.map((t) => this._upScale(t.balance, t.decimals)), this._upScale(bptIn, 18), this._upScale(this._bptTotalSupply, 18));
        const amountsOut = scaledAmountsOut.map((amount, i) => this._downScaleDown(amount, this._tokens[i].decimals));
        // In-place balance updates
        if (!this._query) {
            for (let i = 0; i < this._tokens.length; i++) {
                const token = this._tokens[i];
                token.balance = (0, big_number_1.bn)(token.balance).minus(amountsOut[i]).toString();
            }
            this._bptTotalSupply = (0, big_number_1.bn)(this._bptTotalSupply).minus(bptIn).toString();
        }
        return amountsOut.map((a) => a.toString());
    }
    exitBptInForExactTokensOut(amountsOut) {
        if (Object.keys(amountsOut).length !== this._tokens.length) {
            throw new Error("Invalid input");
        }
        const scaledBptIn = math._calcBptInGivenExactTokensOut(this._tokens.map((t) => this._upScale(t.balance, t.decimals)), this._tokens.map((t) => this._upScale(t.weight, 18)), this._tokens.map((t) => this._upScale(amountsOut[t.symbol], t.decimals)), this._upScale(this._bptTotalSupply, 18), this._upScale(this._swapFeePercentage, 18));
        const bptIn = this._downScaleUp(scaledBptIn, 18);
        // In-place balance updates
        if (!this._query) {
            for (let i = 0; i < this._tokens.length; i++) {
                const token = this._tokens[i];
                token.balance = (0, big_number_1.bn)(token.balance)
                    .minus(amountsOut[token.symbol])
                    .toString();
            }
            this._bptTotalSupply = (0, big_number_1.bn)(this._bptTotalSupply).minus(bptIn).toString();
        }
        return bptIn.toString();
    }
}
exports.default = WeightedPool;
