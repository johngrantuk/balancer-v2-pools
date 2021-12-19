"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const hardhat_1 = require("hardhat");
const sdkStableMath = require("../../src/pools/stable/math");
const big_number_1 = require("../../src/utils/big-number");
const test_1 = require("../../src/utils/test");
describe("StableMath", () => {
    let deployer;
    let evmStableMath;
    const adjustAmp = (amp) => (0, big_number_1.bn)(amp).times(sdkStableMath.AMP_PRECISION);
    before(async () => {
        [deployer] = await hardhat_1.ethers.getSigners();
        evmStableMath = await (0, test_1.deployContract)({
            name: "StableMath",
            from: deployer,
        });
    });
    describe("_calculateInvariant", () => {
        let amplificationParameter;
        let balances;
        afterEach(async () => {
            // Randomize the `roundUp` parameter
            const roundUp = !!Math.round(Math.random());
            const evmExecution = evmStableMath._calculateInvariant((0, test_1.toEvmBn)(adjustAmp(amplificationParameter)), (0, big_number_1.scaleAll)(balances, 18).map(test_1.toEvmBn), roundUp);
            const sdkExecution = new Promise((resolve) => resolve(sdkStableMath._calculateInvariant(adjustAmp(amplificationParameter), (0, big_number_1.scaleAll)(balances, 18), roundUp)));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("two tokens", () => {
            amplificationParameter = "100";
            balances = ["1000", "1200"];
        });
        it("three tokens", () => {
            amplificationParameter = "50";
            balances = ["1000", "1000", "2000"];
        });
        it("empty invariant", () => {
            amplificationParameter = "99";
            balances = [];
        });
    });
    describe("_calcOutGivenIn", () => {
        let amplificationParameter;
        let balances;
        let tokenIndexIn;
        let tokenIndexOut;
        let tokenAmountIn;
        afterEach(async () => {
            const evmExecution = evmStableMath._calcOutGivenIn((0, test_1.toEvmBn)(adjustAmp(amplificationParameter)), (0, big_number_1.scaleAll)(balances, 18).map(test_1.toEvmBn), tokenIndexIn, tokenIndexOut, (0, test_1.toEvmBn)((0, big_number_1.scale)(tokenAmountIn, 18)));
            const sdkExecution = new Promise((resolve) => resolve(sdkStableMath._calcOutGivenIn(adjustAmp(amplificationParameter), (0, big_number_1.scaleAll)(balances, 18), tokenIndexIn, tokenIndexOut, (0, big_number_1.scale)(tokenAmountIn, 18))));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("two tokens", () => {
            amplificationParameter = "760";
            balances = ["1000", "1200"];
            tokenIndexIn = 0;
            tokenIndexOut = 1;
            tokenAmountIn = "100";
        });
        it("three tokens", () => {
            amplificationParameter = "200";
            balances = ["1000", "1000", "1000"];
            tokenIndexIn = 1;
            tokenIndexOut = 2;
            tokenAmountIn = "485";
        });
    });
    describe("_calcInGivenOut", () => {
        let amplificationParameter;
        let balances;
        let tokenIndexIn;
        let tokenIndexOut;
        let tokenAmountOut;
        afterEach(async () => {
            const evmExecution = evmStableMath._calcOutGivenIn((0, test_1.toEvmBn)(adjustAmp(amplificationParameter)), (0, big_number_1.scaleAll)(balances, 18).map(test_1.toEvmBn), tokenIndexIn, tokenIndexOut, (0, test_1.toEvmBn)((0, big_number_1.scale)(tokenAmountOut, 18)));
            const sdkExecution = new Promise((resolve) => resolve(sdkStableMath._calcOutGivenIn(adjustAmp(amplificationParameter), (0, big_number_1.scaleAll)(balances, 18), tokenIndexIn, tokenIndexOut, (0, big_number_1.scale)(tokenAmountOut, 18))));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("two tokens", () => {
            amplificationParameter = "1000";
            balances = ["1000", "1200"];
            tokenIndexIn = 1;
            tokenIndexOut = 0;
            tokenAmountOut = "100";
        });
        it("three tokens", () => {
            amplificationParameter = "500";
            balances = ["10000", "15000", "20000"];
            tokenIndexIn = 0;
            tokenIndexOut = 2;
            tokenAmountOut = "500";
        });
    });
    describe("_calcBptOutGivenExactTokensIn", () => {
        let amp;
        let balances;
        let amountsIn;
        let bptTotalSupply;
        let swapFee;
        afterEach(async () => {
            const evmExecution = evmStableMath._calcBptOutGivenExactTokensIn((0, test_1.toEvmBn)(adjustAmp(amp)), (0, big_number_1.scaleAll)(balances, 18).map(test_1.toEvmBn), (0, big_number_1.scaleAll)(amountsIn, 18).map(test_1.toEvmBn), (0, test_1.toEvmBn)((0, big_number_1.scale)(bptTotalSupply, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(swapFee, 18)));
            const sdkExecution = new Promise((resolve) => resolve(sdkStableMath._calcBptOutGivenExactTokensIn(adjustAmp(amp), (0, big_number_1.scaleAll)(balances, 18), (0, big_number_1.scaleAll)(amountsIn, 18), (0, big_number_1.scale)(bptTotalSupply, 18), (0, big_number_1.scale)(swapFee, 18))));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("simple values", () => {
            amp = "99";
            balances = ["100", "200", "300"];
            amountsIn = ["50", "100", "100"];
            bptTotalSupply = "1000";
            swapFee = "0.01";
        });
    });
    describe("_calcTokenInGivenExactBptOut", () => {
        let amp;
        let balances;
        let tokenIndex;
        let bptAmountOut;
        let bptTotalSupply;
        let swapFee;
        afterEach(async () => {
            const evmExecution = evmStableMath._calcTokenInGivenExactBptOut((0, test_1.toEvmBn)(adjustAmp(amp)), (0, big_number_1.scaleAll)(balances, 18).map(test_1.toEvmBn), tokenIndex, (0, test_1.toEvmBn)((0, big_number_1.scale)(bptAmountOut, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(bptTotalSupply, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(swapFee, 18)));
            const sdkExecution = new Promise((resolve) => resolve(sdkStableMath._calcTokenInGivenExactBptOut(adjustAmp(amp), (0, big_number_1.scaleAll)(balances, 18), tokenIndex, (0, big_number_1.scale)(bptAmountOut, 18), (0, big_number_1.scale)(bptTotalSupply, 18), (0, big_number_1.scale)(swapFee, 18))));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("simple values", () => {
            amp = "100";
            balances = ["100", "200", "300"];
            tokenIndex = 1;
            bptAmountOut = "10";
            bptTotalSupply = "1000";
            swapFee = "0.05";
        });
    });
    describe("_calcBptInGivenExactTokensOut", () => {
        let amp;
        let balances;
        let amountsOut;
        let bptTotalSupply;
        let swapFee;
        afterEach(async () => {
            const evmExecution = evmStableMath._calcBptInGivenExactTokensOut((0, test_1.toEvmBn)(adjustAmp(amp)), (0, big_number_1.scaleAll)(balances, 18).map(test_1.toEvmBn), (0, big_number_1.scaleAll)(amountsOut, 18).map(test_1.toEvmBn), (0, test_1.toEvmBn)((0, big_number_1.scale)(bptTotalSupply, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(swapFee, 18)));
            const sdkExecution = new Promise((resolve) => resolve(sdkStableMath._calcBptInGivenExactTokensOut(adjustAmp(amp), (0, big_number_1.scaleAll)(balances, 18), (0, big_number_1.scaleAll)(amountsOut, 18), (0, big_number_1.scale)(bptTotalSupply, 18), (0, big_number_1.scale)(swapFee, 18))));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("simple values", () => {
            amp = "23";
            balances = ["10", "50", "60"];
            amountsOut = ["50", "100", "100"];
            bptTotalSupply = "100";
            swapFee = "0.1";
        });
    });
    describe("_calcTokenOutGivenExactBptIn", () => {
        let amp;
        let balances;
        let tokenIndex;
        let bptAmountIn;
        let bptTotalSupply;
        let swapFee;
        afterEach(async () => {
            const evmExecution = evmStableMath._calcTokenOutGivenExactBptIn((0, test_1.toEvmBn)(adjustAmp(amp)), (0, big_number_1.scaleAll)(balances, 18).map(test_1.toEvmBn), tokenIndex, (0, test_1.toEvmBn)((0, big_number_1.scale)(bptAmountIn, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(bptTotalSupply, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(swapFee, 18)));
            const sdkExecution = new Promise((resolve) => resolve(sdkStableMath._calcTokenOutGivenExactBptIn(adjustAmp(amp), (0, big_number_1.scaleAll)(balances, 18), tokenIndex, (0, big_number_1.scale)(bptAmountIn, 18), (0, big_number_1.scale)(bptTotalSupply, 18), (0, big_number_1.scale)(swapFee, 18))));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("simple values", () => {
            amp = "100";
            balances = ["10", "11", "12", "13", "14"];
            tokenIndex = 3;
            bptAmountIn = "10";
            bptTotalSupply = "100";
            swapFee = "0.1";
        });
    });
    describe("_calcTokensOutGivenExactBptIn", () => {
        let balances;
        let bptAmountIn;
        let bptTotalSupply;
        afterEach(async () => {
            const evmExecution = evmStableMath._calcTokensOutGivenExactBptIn((0, big_number_1.scaleAll)(balances, 18).map(test_1.toEvmBn), (0, test_1.toEvmBn)((0, big_number_1.scale)(bptAmountIn, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(bptTotalSupply, 18)));
            const sdkExecution = new Promise((resolve) => resolve(sdkStableMath._calcTokensOutGivenExactBptIn((0, big_number_1.scaleAll)(balances, 18), (0, big_number_1.scale)(bptAmountIn, 18), (0, big_number_1.scale)(bptTotalSupply, 18))));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("simple values", () => {
            balances = ["100", "1000", "5000"];
            bptAmountIn = "27";
            bptTotalSupply = "200";
        });
    });
    describe("_calcDueTokenProtocolSwapFeeAmount", () => {
        let amplificationParameter;
        let balances;
        let lastInvariant;
        let tokenIndex;
        let protocolSwapFeePercentage;
        afterEach(async () => {
            const evmExecution = evmStableMath._calcDueTokenProtocolSwapFeeAmount((0, test_1.toEvmBn)(adjustAmp(amplificationParameter)), (0, big_number_1.scaleAll)(balances, 18).map(test_1.toEvmBn), (0, test_1.toEvmBn)((0, big_number_1.scale)(lastInvariant, 18)), tokenIndex, (0, test_1.toEvmBn)((0, big_number_1.scale)(protocolSwapFeePercentage, 18)));
            const sdkExecution = new Promise((resolve) => resolve(sdkStableMath._calcDueTokenProtocolSwapFeeAmount(adjustAmp(amplificationParameter), (0, big_number_1.scaleAll)(balances, 18), (0, big_number_1.scale)(lastInvariant, 18), tokenIndex, (0, big_number_1.scale)(protocolSwapFeePercentage, 18))));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("two tokens", () => {
            amplificationParameter = "95";
            balances = ["100", "150"];
            lastInvariant = "100";
            tokenIndex = 0;
            protocolSwapFeePercentage = "0.1";
        });
        it("three tokens", () => {
            amplificationParameter = "100";
            balances = ["1000", "1500", "2000"];
            lastInvariant = "1000";
            tokenIndex = 2;
            protocolSwapFeePercentage = "0.2";
        });
    });
});
