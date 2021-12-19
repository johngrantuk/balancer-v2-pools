"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const v2_deployments_1 = require("@balancer-labs/v2-deployments");
const chai_1 = require("chai");
const hardhat_1 = require("hardhat");
const weighted_1 = require("../../src/pools/weighted");
const big_number_1 = require("../../src/utils/big-number");
const test_1 = require("../../src/utils/test");
const query = require("../../src/utils/test/pools/query");
describe("WeightedPool", () => {
    let sdkPool;
    let evmVault;
    let evmHelpers;
    before(async () => {
        const network = "mainnet";
        sdkPool = await weighted_1.default.initFromOnchain(hardhat_1.ethers.provider, 
        // WETH/DAI 60/40 on Mainnet
        "0x0b09dea16768f0799065c475be02919503cb2a3500020000000000000000001a", network);
        evmVault = await (0, v2_deployments_1.getBalancerContract)("20210418-vault", "Vault", network);
        evmHelpers = await (0, v2_deployments_1.getBalancerContract)("20210418-vault", "BalancerHelpers", network);
    });
    describe("swapGivenIn", () => {
        let tokenIn;
        let tokenOut;
        let amountIn;
        afterEach(async () => {
            const evmExecution = query.swapGivenIn(evmVault, sdkPool.id, [tokenIn, tokenOut], tokenIn.symbol, tokenOut.symbol, amountIn);
            const sdkExecution = new Promise((resolve) => resolve(sdkPool.swapGivenIn(tokenIn.symbol, tokenOut.symbol, amountIn)));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("simple values", () => {
            tokenIn = sdkPool.tokens[0];
            tokenOut = sdkPool.tokens[1];
            // 0.1% of the balance
            amountIn = (0, big_number_1.bn)(tokenIn.balance)
                .div(1000)
                .decimalPlaces(tokenIn.decimals)
                .toString();
        });
        it("extreme values", () => {
            tokenIn = sdkPool.tokens[1];
            tokenOut = sdkPool.tokens[0];
            // 25% of the balance
            amountIn = (0, big_number_1.bn)(tokenIn.balance)
                .div(4)
                .decimalPlaces(tokenIn.decimals)
                .toString();
        });
    });
    describe("swapGivenOut", () => {
        let tokenIn;
        let tokenOut;
        let amountOut;
        afterEach(async () => {
            const evmExecution = query.swapGivenOut(evmVault, sdkPool.id, [tokenIn, tokenOut], tokenIn.symbol, tokenOut.symbol, amountOut);
            const sdkExecution = new Promise((resolve) => resolve(sdkPool.swapGivenOut(tokenIn.symbol, tokenOut.symbol, amountOut)));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("simple values", () => {
            tokenIn = sdkPool.tokens[0];
            tokenOut = sdkPool.tokens[1];
            // 0.1% of the balance
            amountOut = (0, big_number_1.bn)(tokenOut.balance)
                .div(1000)
                .decimalPlaces(tokenOut.decimals)
                .toString();
        });
        it("extreme values", () => {
            tokenIn = sdkPool.tokens[1];
            tokenOut = sdkPool.tokens[0];
            // 25% of the balance
            amountOut = (0, big_number_1.bn)(tokenOut.balance)
                .div(4)
                .decimalPlaces(tokenOut.decimals)
                .toString();
        });
    });
    describe("joinExactTokensInForBptOut", () => {
        let amountsIn;
        afterEach(async () => {
            const evmExecution = query.joinExactTokensInForBptOut(evmHelpers, sdkPool.id, sdkPool.tokens, sdkPool.tokens.map((t) => amountsIn[t.symbol]));
            const sdkExecution = new Promise((resolve) => resolve(sdkPool.joinExactTokensInForBptOut(amountsIn)));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("simple values", () => {
            amountsIn = {
                DAI: "100000",
                WETH: "500",
            };
        });
        it("extreme values", () => {
            amountsIn = {
                DAI: "1",
                WETH: "10000",
            };
        });
    });
    describe("joinTokenInForExactBptOut", () => {
        let tokenIn;
        let bptOut;
        afterEach(async () => {
            const evmExecution = query.joinTokenInForExactBptOut(evmHelpers, sdkPool.id, sdkPool.tokens, tokenIn.symbol, bptOut);
            const sdkExecution = new Promise((resolve) => resolve(sdkPool.joinTokenInForExactBptOut(tokenIn.symbol, bptOut)));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("simple values", () => {
            tokenIn = sdkPool.tokens[0];
            bptOut = "10";
        });
        it("extreme values", () => {
            tokenIn = sdkPool.tokens[1];
            bptOut = "1000000000";
        });
    });
    describe("exitExactBptInForTokenOut", () => {
        let tokenOut;
        let bptIn;
        afterEach(async () => {
            const evmExecution = query.exitExactBptInForTokenOut(evmHelpers, sdkPool.id, sdkPool.tokens, tokenOut.symbol, bptIn);
            const sdkExecution = new Promise((resolve) => resolve(sdkPool.exitExactBptInForTokenOut(tokenOut.symbol, bptIn)));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("simple values", () => {
            tokenOut = sdkPool.tokens[0];
            bptIn = "100";
        });
        it("extreme values", () => {
            tokenOut = sdkPool.tokens[1];
            bptIn = "10000000";
        });
    });
    describe("exitExactBptInForTokensOut", () => {
        let bptIn;
        afterEach(async () => {
            const evmExecution = query.exitExactBptInForTokensOut(evmHelpers, sdkPool.id, sdkPool.tokens, bptIn);
            const sdkExecution = new Promise((resolve) => resolve(sdkPool.exitExactBptInForTokensOut(bptIn)));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("simple values", () => {
            bptIn = "1000";
        });
        it("extreme values", () => {
            bptIn = "99999999";
        });
    });
    describe("exitBptInForExactTokensOut", () => {
        let amountsOut;
        afterEach(async () => {
            const evmExecution = query.exitBptInForExactTokensOut(evmHelpers, sdkPool.id, sdkPool.tokens, sdkPool.tokens.map((t) => amountsOut[t.symbol]));
            const sdkExecution = new Promise((resolve) => resolve(sdkPool.exitBptInForExactTokensOut(amountsOut)));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("simple values", () => {
            amountsOut = {
                DAI: "100000",
                WETH: "100",
            };
        });
        it("extreme values", () => {
            amountsOut = {
                DAI: "100000000",
                WETH: "100000000",
            };
        });
    });
});
