"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const hardhat_1 = require("hardhat");
const sdkLinearMath = require("../../src/pools/linear/math");
const big_number_1 = require("../../src/utils/big-number");
const test_1 = require("../../src/utils/test");
describe("LinearMath", () => {
    let deployer;
    let evmLinearMath;
    before(async () => {
        [deployer] = await hardhat_1.ethers.getSigners();
        evmLinearMath = await (0, test_1.deployContract)({
            name: "LinearMath",
            from: deployer,
        });
    });
    describe("_calcBptOutPerMainIn", () => {
        let mainIn;
        let mainBalance;
        let wrappedBalance;
        let bptSupply;
        let params;
        afterEach(async () => {
            const evmExecution = evmLinearMath._calcBptOutPerMainIn((0, test_1.toEvmBn)((0, big_number_1.scale)(mainIn, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(mainBalance, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(wrappedBalance, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(bptSupply, 18)), {
                fee: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.fee, 18)),
                lowerTarget: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.lowerTarget, 18)),
                upperTarget: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.upperTarget, 18)),
            });
            const sdkExecution = new Promise((resolve) => resolve(sdkLinearMath._calcBptOutPerMainIn((0, big_number_1.scale)(mainIn, 18), (0, big_number_1.scale)(mainBalance, 18), (0, big_number_1.scale)(wrappedBalance, 18), (0, big_number_1.scale)(bptSupply, 18), {
                fee: (0, big_number_1.scale)(params.fee, 18),
                lowerTarget: (0, big_number_1.scale)(params.lowerTarget, 18),
                upperTarget: (0, big_number_1.scale)(params.upperTarget, 18),
            })));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("simple values", () => {
            mainIn = "1";
            mainBalance = "200";
            wrappedBalance = "30";
            bptSupply = "100";
            params = {
                fee: "0.01",
                lowerTarget: "1000",
                upperTarget: "2000",
            };
        });
        it("complex values", () => {
            mainIn = "100";
            mainBalance = "10";
            wrappedBalance = "1000";
            bptSupply = "10";
            params = {
                fee: "0.01",
                lowerTarget: "1000",
                upperTarget: "2000",
            };
        });
    });
    describe("_calcBptInPerMainOut", () => {
        let mainOut;
        let mainBalance;
        let wrappedBalance;
        let bptSupply;
        let params;
        afterEach(async () => {
            const evmExecution = evmLinearMath._calcBptInPerMainOut((0, test_1.toEvmBn)((0, big_number_1.scale)(mainOut, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(mainBalance, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(wrappedBalance, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(bptSupply, 18)), {
                fee: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.fee, 18)),
                lowerTarget: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.lowerTarget, 18)),
                upperTarget: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.upperTarget, 18)),
            });
            const sdkExecution = new Promise((resolve) => resolve(sdkLinearMath._calcBptInPerMainOut((0, big_number_1.scale)(mainOut, 18), (0, big_number_1.scale)(mainBalance, 18), (0, big_number_1.scale)(wrappedBalance, 18), (0, big_number_1.scale)(bptSupply, 18), {
                fee: (0, big_number_1.scale)(params.fee, 18),
                lowerTarget: (0, big_number_1.scale)(params.lowerTarget, 18),
                upperTarget: (0, big_number_1.scale)(params.upperTarget, 18),
            })));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("simple values", () => {
            mainOut = "50";
            mainBalance = "100";
            wrappedBalance = "0";
            bptSupply = "110";
            params = {
                fee: "0.01",
                lowerTarget: "1000",
                upperTarget: "2000",
            };
        });
    });
    describe("_calcWrappedOutPerMainIn", () => {
        let mainIn;
        let mainBalance;
        let params;
        afterEach(async () => {
            const evmExecution = evmLinearMath._calcWrappedOutPerMainIn((0, test_1.toEvmBn)((0, big_number_1.scale)(mainIn, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(mainBalance, 18)), {
                fee: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.fee, 18)),
                lowerTarget: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.lowerTarget, 18)),
                upperTarget: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.upperTarget, 18)),
            });
            const sdkExecution = new Promise((resolve) => resolve(sdkLinearMath._calcWrappedOutPerMainIn((0, big_number_1.scale)(mainIn, 18), (0, big_number_1.scale)(mainBalance, 18), {
                fee: (0, big_number_1.scale)(params.fee, 18),
                lowerTarget: (0, big_number_1.scale)(params.lowerTarget, 18),
                upperTarget: (0, big_number_1.scale)(params.upperTarget, 18),
            })));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("simple values", () => {
            mainIn = "50";
            mainBalance = "500";
            params = {
                fee: "0.01",
                lowerTarget: "1000",
                upperTarget: "2000",
            };
        });
    });
    describe("_calcWrappedInPerMainOut", () => {
        let mainOut;
        let mainBalance;
        let params;
        afterEach(async () => {
            const evmExecution = evmLinearMath._calcWrappedInPerMainOut((0, test_1.toEvmBn)((0, big_number_1.scale)(mainOut, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(mainBalance, 18)), {
                fee: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.fee, 18)),
                lowerTarget: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.lowerTarget, 18)),
                upperTarget: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.upperTarget, 18)),
            });
            const sdkExecution = new Promise((resolve) => resolve(sdkLinearMath._calcWrappedInPerMainOut((0, big_number_1.scale)(mainOut, 18), (0, big_number_1.scale)(mainBalance, 18), {
                fee: (0, big_number_1.scale)(params.fee, 18),
                lowerTarget: (0, big_number_1.scale)(params.lowerTarget, 18),
                upperTarget: (0, big_number_1.scale)(params.upperTarget, 18),
            })));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("simple values", () => {
            mainOut = "100";
            mainBalance = "600";
            params = {
                fee: "0.01",
                lowerTarget: "1000",
                upperTarget: "2000",
            };
        });
    });
    describe("_calcMainInPerBptOut", () => {
        let bptOut;
        let mainBalance;
        let wrappedBalance;
        let bptSupply;
        let params;
        afterEach(async () => {
            const evmExecution = evmLinearMath._calcMainInPerBptOut((0, test_1.toEvmBn)((0, big_number_1.scale)(bptOut, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(mainBalance, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(wrappedBalance, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(bptSupply, 18)), {
                fee: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.fee, 18)),
                lowerTarget: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.lowerTarget, 18)),
                upperTarget: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.upperTarget, 18)),
            });
            const sdkExecution = new Promise((resolve) => resolve(sdkLinearMath._calcMainInPerBptOut((0, big_number_1.scale)(bptOut, 18), (0, big_number_1.scale)(mainBalance, 18), (0, big_number_1.scale)(wrappedBalance, 18), (0, big_number_1.scale)(bptSupply, 18), {
                fee: (0, big_number_1.scale)(params.fee, 18),
                lowerTarget: (0, big_number_1.scale)(params.lowerTarget, 18),
                upperTarget: (0, big_number_1.scale)(params.upperTarget, 18),
            })));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("simple values", () => {
            bptOut = "100";
            mainBalance = "500";
            wrappedBalance = "200";
            bptSupply = "1000";
            params = {
                fee: "0.01",
                lowerTarget: "1000",
                upperTarget: "2000",
            };
        });
    });
    describe("_calcMainOutPerBptIn", () => {
        let bptIn;
        let mainBalance;
        let wrappedBalance;
        let bptSupply;
        let params;
        afterEach(async () => {
            const evmExecution = evmLinearMath._calcMainOutPerBptIn((0, test_1.toEvmBn)((0, big_number_1.scale)(bptIn, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(mainBalance, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(wrappedBalance, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(bptSupply, 18)), {
                fee: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.fee, 18)),
                lowerTarget: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.lowerTarget, 18)),
                upperTarget: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.upperTarget, 18)),
            });
            const sdkExecution = new Promise((resolve) => resolve(sdkLinearMath._calcMainOutPerBptIn((0, big_number_1.scale)(bptIn, 18), (0, big_number_1.scale)(mainBalance, 18), (0, big_number_1.scale)(wrappedBalance, 18), (0, big_number_1.scale)(bptSupply, 18), {
                fee: (0, big_number_1.scale)(params.fee, 18),
                lowerTarget: (0, big_number_1.scale)(params.lowerTarget, 18),
                upperTarget: (0, big_number_1.scale)(params.upperTarget, 18),
            })));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("simple values", () => {
            bptIn = "100";
            mainBalance = "500";
            wrappedBalance = "300";
            bptSupply = "1000";
            params = {
                fee: "0.01",
                lowerTarget: "1000",
                upperTarget: "2000",
            };
        });
    });
    describe("_calcMainOutPerWrappedIn", () => {
        let wrappedIn;
        let mainBalance;
        let params;
        afterEach(async () => {
            const evmExecution = evmLinearMath._calcMainOutPerWrappedIn((0, test_1.toEvmBn)((0, big_number_1.scale)(wrappedIn, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(mainBalance, 18)), {
                fee: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.fee, 18)),
                lowerTarget: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.lowerTarget, 18)),
                upperTarget: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.upperTarget, 18)),
            });
            const sdkExecution = new Promise((resolve) => resolve(sdkLinearMath._calcMainOutPerWrappedIn((0, big_number_1.scale)(wrappedIn, 18), (0, big_number_1.scale)(mainBalance, 18), {
                fee: (0, big_number_1.scale)(params.fee, 18),
                lowerTarget: (0, big_number_1.scale)(params.lowerTarget, 18),
                upperTarget: (0, big_number_1.scale)(params.upperTarget, 18),
            })));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("simple values", () => {
            wrappedIn = "100";
            mainBalance = "500";
            params = {
                fee: "0.01",
                lowerTarget: "1000",
                upperTarget: "2000",
            };
        });
    });
    describe("_calcMainInPerWrappedOut", () => {
        let wrappedOut;
        let mainBalance;
        let params;
        afterEach(async () => {
            const evmExecution = evmLinearMath._calcMainInPerWrappedOut((0, test_1.toEvmBn)((0, big_number_1.scale)(wrappedOut, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(mainBalance, 18)), {
                fee: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.fee, 18)),
                lowerTarget: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.lowerTarget, 18)),
                upperTarget: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.upperTarget, 18)),
            });
            const sdkExecution = new Promise((resolve) => resolve(sdkLinearMath._calcMainInPerWrappedOut((0, big_number_1.scale)(wrappedOut, 18), (0, big_number_1.scale)(mainBalance, 18), {
                fee: (0, big_number_1.scale)(params.fee, 18),
                lowerTarget: (0, big_number_1.scale)(params.lowerTarget, 18),
                upperTarget: (0, big_number_1.scale)(params.upperTarget, 18),
            })));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("simple values", () => {
            wrappedOut = "100";
            mainBalance = "500";
            params = {
                fee: "0.01",
                lowerTarget: "1000",
                upperTarget: "2000",
            };
        });
    });
    describe("_calcBptOutPerWrappedIn", () => {
        let wrappedIn;
        let mainBalance;
        let wrappedBalance;
        let bptSupply;
        let params;
        afterEach(async () => {
            const evmExecution = evmLinearMath._calcBptOutPerWrappedIn((0, test_1.toEvmBn)((0, big_number_1.scale)(wrappedIn, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(mainBalance, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(wrappedBalance, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(bptSupply, 18)), {
                fee: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.fee, 18)),
                lowerTarget: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.lowerTarget, 18)),
                upperTarget: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.upperTarget, 18)),
            });
            const sdkExecution = new Promise((resolve) => resolve(sdkLinearMath._calcBptOutPerWrappedIn((0, big_number_1.scale)(wrappedIn, 18), (0, big_number_1.scale)(mainBalance, 18), (0, big_number_1.scale)(wrappedBalance, 18), (0, big_number_1.scale)(bptSupply, 18), {
                fee: (0, big_number_1.scale)(params.fee, 18),
                lowerTarget: (0, big_number_1.scale)(params.lowerTarget, 18),
                upperTarget: (0, big_number_1.scale)(params.upperTarget, 18),
            })));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("simple values", () => {
            wrappedIn = "500";
            mainBalance = "100";
            wrappedBalance = "0";
            bptSupply = "150";
            params = {
                fee: "0.01",
                lowerTarget: "1000",
                upperTarget: "2000",
            };
        });
    });
    describe("_calcBptInPerWrappedOut", () => {
        let wrappedOut;
        let mainBalance;
        let wrappedBalance;
        let bptSupply;
        let params;
        afterEach(async () => {
            const evmExecution = evmLinearMath._calcBptInPerWrappedOut((0, test_1.toEvmBn)((0, big_number_1.scale)(wrappedOut, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(mainBalance, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(wrappedBalance, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(bptSupply, 18)), {
                fee: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.fee, 18)),
                lowerTarget: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.lowerTarget, 18)),
                upperTarget: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.upperTarget, 18)),
            });
            const sdkExecution = new Promise((resolve) => resolve(sdkLinearMath._calcBptInPerWrappedOut((0, big_number_1.scale)(wrappedOut, 18), (0, big_number_1.scale)(mainBalance, 18), (0, big_number_1.scale)(wrappedBalance, 18), (0, big_number_1.scale)(bptSupply, 18), {
                fee: (0, big_number_1.scale)(params.fee, 18),
                lowerTarget: (0, big_number_1.scale)(params.lowerTarget, 18),
                upperTarget: (0, big_number_1.scale)(params.upperTarget, 18),
            })));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("simple values", () => {
            wrappedOut = "10";
            mainBalance = "100";
            wrappedBalance = "100";
            bptSupply = "150";
            params = {
                fee: "0.01",
                lowerTarget: "1000",
                upperTarget: "2000",
            };
        });
    });
    describe("_calcWrappedInPerBptOut", () => {
        let bptOut;
        let mainBalance;
        let wrappedBalance;
        let bptSupply;
        let params;
        afterEach(async () => {
            const evmExecution = evmLinearMath._calcWrappedInPerBptOut((0, test_1.toEvmBn)((0, big_number_1.scale)(bptOut, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(mainBalance, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(wrappedBalance, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(bptSupply, 18)), {
                fee: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.fee, 18)),
                lowerTarget: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.lowerTarget, 18)),
                upperTarget: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.upperTarget, 18)),
            });
            const sdkExecution = new Promise((resolve) => resolve(sdkLinearMath._calcWrappedInPerBptOut((0, big_number_1.scale)(bptOut, 18), (0, big_number_1.scale)(mainBalance, 18), (0, big_number_1.scale)(wrappedBalance, 18), (0, big_number_1.scale)(bptSupply, 18), {
                fee: (0, big_number_1.scale)(params.fee, 18),
                lowerTarget: (0, big_number_1.scale)(params.lowerTarget, 18),
                upperTarget: (0, big_number_1.scale)(params.upperTarget, 18),
            })));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("simple values", () => {
            bptOut = "100";
            mainBalance = "150";
            wrappedBalance = "100";
            bptSupply = "250";
            params = {
                fee: "0.01",
                lowerTarget: "1000",
                upperTarget: "2000",
            };
        });
    });
    describe("_calcWrappedOutPerBptIn", () => {
        let bptIn;
        let mainBalance;
        let wrappedBalance;
        let bptSupply;
        let params;
        afterEach(async () => {
            const evmExecution = evmLinearMath._calcWrappedOutPerBptIn((0, test_1.toEvmBn)((0, big_number_1.scale)(bptIn, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(mainBalance, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(wrappedBalance, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(bptSupply, 18)), {
                fee: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.fee, 18)),
                lowerTarget: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.lowerTarget, 18)),
                upperTarget: (0, test_1.toEvmBn)((0, big_number_1.scale)(params.upperTarget, 18)),
            });
            const sdkExecution = new Promise((resolve) => resolve(sdkLinearMath._calcWrappedOutPerBptIn((0, big_number_1.scale)(bptIn, 18), (0, big_number_1.scale)(mainBalance, 18), (0, big_number_1.scale)(wrappedBalance, 18), (0, big_number_1.scale)(bptSupply, 18), {
                fee: (0, big_number_1.scale)(params.fee, 18),
                lowerTarget: (0, big_number_1.scale)(params.lowerTarget, 18),
                upperTarget: (0, big_number_1.scale)(params.upperTarget, 18),
            })));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("simple values", () => {
            bptIn = "100";
            mainBalance = "150";
            wrappedBalance = "100";
            bptSupply = "250";
            params = {
                fee: "0.01",
                lowerTarget: "1000",
                upperTarget: "2000",
            };
        });
    });
    describe("_calcTokensOutGivenExactBptIn", () => {
        let balances;
        let bptAmountIn;
        let bptTotalSupply;
        let bptIndex;
        afterEach(async () => {
            const evmExecution = evmLinearMath._calcTokensOutGivenExactBptIn((0, big_number_1.scaleAll)(balances, 18).map(test_1.toEvmBn), (0, test_1.toEvmBn)((0, big_number_1.scale)(bptAmountIn, 18)), (0, test_1.toEvmBn)((0, big_number_1.scale)(bptTotalSupply, 18)), bptIndex);
            const sdkExecution = new Promise((resolve) => resolve(sdkLinearMath._calcTokensOutGivenExactBptIn((0, big_number_1.scaleAll)(balances, 18), (0, big_number_1.scale)(bptAmountIn, 18), (0, big_number_1.scale)(bptTotalSupply, 18), bptIndex)));
            (0, chai_1.expect)(await (0, test_1.isSameResult)(sdkExecution, evmExecution)).to.be.true;
        });
        it("simple values", () => {
            balances = ["100", "200", "300"];
            bptAmountIn = "10";
            bptTotalSupply = "80";
            bptIndex = 1;
        });
    });
});
