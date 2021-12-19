"use strict";
// Ported from Solidity:
// https://github.com/balancer-labs/balancer-v2-monorepo/blob/88a14eb623f6a22ef3f1afc5a8c49ebfa7eeceed/pkg/pool-linear/contracts/LinearMath.sol
Object.defineProperty(exports, "__esModule", { value: true });
exports._calcTokensOutGivenExactBptIn = exports._calcWrappedOutPerBptIn = exports._calcWrappedInPerBptOut = exports._calcBptInPerWrappedOut = exports._calcBptOutPerWrappedIn = exports._calcMainInPerWrappedOut = exports._calcMainOutPerWrappedIn = exports._calcMainOutPerBptIn = exports._calcMainInPerBptOut = exports._calcWrappedInPerMainOut = exports._calcWrappedOutPerMainIn = exports._calcBptInPerMainOut = exports._calcBptOutPerMainIn = void 0;
const fp = require("../../utils/math/fixed-point");
const math = require("../../utils/math/math");
const _calcBptOutPerMainIn = (mainIn, mainBalance, wrappedBalance, bptSupply, params) => {
    // Amount out, so we round down overall.
    if (bptSupply.isZero()) {
        return _toNominal(mainIn, params);
    }
    const previousNominalMain = _toNominal(mainBalance, params);
    const afterNominalMain = _toNominal(fp.add(mainBalance, mainIn), params);
    const deltaNominalMain = fp.sub(afterNominalMain, previousNominalMain);
    const invariant = _calcInvariant(previousNominalMain, wrappedBalance);
    return math.divDown(math.mul(bptSupply, deltaNominalMain), invariant);
};
exports._calcBptOutPerMainIn = _calcBptOutPerMainIn;
const _calcBptInPerMainOut = (mainOut, mainBalance, wrappedBalance, bptSupply, params) => {
    // Amount in, so we round up overall.
    const previousNominalMain = _toNominal(mainBalance, params);
    const afterNominalMain = _toNominal(fp.sub(mainBalance, mainOut), params);
    const deltaNominalMain = fp.sub(previousNominalMain, afterNominalMain);
    const invariant = _calcInvariant(previousNominalMain, wrappedBalance);
    return math.divUp(math.mul(bptSupply, deltaNominalMain), invariant);
};
exports._calcBptInPerMainOut = _calcBptInPerMainOut;
const _calcWrappedOutPerMainIn = (mainIn, mainBalance, params) => {
    // Amount out, so we round down overall.
    const previousNominalMain = _toNominal(mainBalance, params);
    const afterNominalMain = _toNominal(fp.add(mainBalance, mainIn), params);
    return fp.sub(afterNominalMain, previousNominalMain);
};
exports._calcWrappedOutPerMainIn = _calcWrappedOutPerMainIn;
const _calcWrappedInPerMainOut = (mainOut, mainBalance, params) => {
    // Amount in, so we round up overall.
    const previousNominalMain = _toNominal(mainBalance, params);
    const afterNominalMain = _toNominal(fp.sub(mainBalance, mainOut), params);
    return fp.sub(previousNominalMain, afterNominalMain);
};
exports._calcWrappedInPerMainOut = _calcWrappedInPerMainOut;
const _calcMainInPerBptOut = (bptOut, mainBalance, wrappedBalance, bptSupply, params) => {
    // Amount in, so we round up overall.
    if (bptSupply.isZero()) {
        return _fromNominal(bptOut, params);
    }
    const previousNominalMain = _toNominal(mainBalance, params);
    const invariant = _calcInvariant(previousNominalMain, wrappedBalance);
    const deltaNominalMain = math.divUp(math.mul(invariant, bptOut), bptSupply);
    const afterNominalMain = fp.add(previousNominalMain, deltaNominalMain);
    const newMainBalance = _fromNominal(afterNominalMain, params);
    return fp.sub(newMainBalance, mainBalance);
};
exports._calcMainInPerBptOut = _calcMainInPerBptOut;
const _calcMainOutPerBptIn = (bptIn, mainBalance, wrappedBalance, bptSupply, params) => {
    // Amount out, so we round down overall.
    const previousNominalMain = _toNominal(mainBalance, params);
    const invariant = _calcInvariant(previousNominalMain, wrappedBalance);
    const deltaNominalMain = math.divDown(math.mul(invariant, bptIn), bptSupply);
    const afterNominalMain = fp.sub(previousNominalMain, deltaNominalMain);
    const newMainBalance = _fromNominal(afterNominalMain, params);
    return fp.sub(mainBalance, newMainBalance);
};
exports._calcMainOutPerBptIn = _calcMainOutPerBptIn;
const _calcMainOutPerWrappedIn = (wrappedIn, mainBalance, params) => {
    // Amount out, so we round down overall.
    const previousNominalMain = _toNominal(mainBalance, params);
    const afterNominalMain = fp.sub(previousNominalMain, wrappedIn);
    const newMainBalance = _fromNominal(afterNominalMain, params);
    return fp.sub(mainBalance, newMainBalance);
};
exports._calcMainOutPerWrappedIn = _calcMainOutPerWrappedIn;
const _calcMainInPerWrappedOut = (wrappedOut, mainBalance, params) => {
    // Amount in, so we round up overall.
    const previousNominalMain = _toNominal(mainBalance, params);
    const afterNominalMain = fp.add(previousNominalMain, wrappedOut);
    const newMainBalance = _fromNominal(afterNominalMain, params);
    return fp.sub(newMainBalance, mainBalance);
};
exports._calcMainInPerWrappedOut = _calcMainInPerWrappedOut;
const _calcBptOutPerWrappedIn = (wrappedIn, mainBalance, wrappedBalance, bptSupply, params) => {
    // Amount out, so we round down overall.
    if (bptSupply.isZero()) {
        return wrappedIn;
    }
    const nominalMain = _toNominal(mainBalance, params);
    const previousInvariant = _calcInvariant(nominalMain, wrappedBalance);
    const newWrappedBalance = fp.add(wrappedBalance, wrappedIn);
    const newInvariant = _calcInvariant(nominalMain, newWrappedBalance);
    const newBptBalance = math.divDown(math.mul(bptSupply, newInvariant), previousInvariant);
    return fp.sub(newBptBalance, bptSupply);
};
exports._calcBptOutPerWrappedIn = _calcBptOutPerWrappedIn;
const _calcBptInPerWrappedOut = (wrappedOut, mainBalance, wrappedBalance, bptSupply, params) => {
    // Amount in, so we round up overall.
    const nominalMain = _toNominal(mainBalance, params);
    const previousInvariant = _calcInvariant(nominalMain, wrappedBalance);
    const newWrappedBalance = fp.sub(wrappedBalance, wrappedOut);
    const newInvariant = _calcInvariant(nominalMain, newWrappedBalance);
    const newBptBalance = math.divDown(math.mul(bptSupply, newInvariant), previousInvariant);
    return fp.sub(bptSupply, newBptBalance);
};
exports._calcBptInPerWrappedOut = _calcBptInPerWrappedOut;
const _calcWrappedInPerBptOut = (bptOut, mainBalance, wrappedBalance, bptSupply, params) => {
    // Amount in, so we round up overall.
    if (bptSupply.isZero()) {
        return bptOut;
    }
    const nominalMain = _toNominal(mainBalance, params);
    const previousInvariant = _calcInvariant(nominalMain, wrappedBalance);
    const newBptBalance = fp.add(bptSupply, bptOut);
    const newWrappedBalance = fp.sub(math.divUp(math.mul(newBptBalance, previousInvariant), bptSupply), nominalMain);
    return fp.sub(newWrappedBalance, wrappedBalance);
};
exports._calcWrappedInPerBptOut = _calcWrappedInPerBptOut;
const _calcWrappedOutPerBptIn = (bptIn, mainBalance, wrappedBalance, bptSupply, params) => {
    // Amount out, so we round down overall.
    const nominalMain = _toNominal(mainBalance, params);
    const previousInvariant = _calcInvariant(nominalMain, wrappedBalance);
    const newBptBalance = fp.sub(bptSupply, bptIn);
    const newWrappedBalance = fp.sub(math.divUp(math.mul(newBptBalance, previousInvariant), bptSupply), nominalMain);
    return fp.sub(wrappedBalance, newWrappedBalance);
};
exports._calcWrappedOutPerBptIn = _calcWrappedOutPerBptIn;
const _calcInvariant = (nominalMainBalance, wrappedBalance) => {
    return fp.add(nominalMainBalance, wrappedBalance);
};
const _toNominal = (real, params) => {
    // Fees are always rounded down: either direction would work but we need to be consistent, and rounding down
    // uses less gas.
    if (real.lt(params.lowerTarget)) {
        const fees = fp.mulDown(math.sub(params.lowerTarget, real), params.fee);
        return fp.sub(real, fees);
    }
    else if (real.lte(params.upperTarget)) {
        return real;
    }
    else {
        const fees = fp.mulDown(math.sub(real, params.upperTarget), params.fee);
        return fp.sub(real, fees);
    }
};
const _fromNominal = (nominal, params) => {
    // Since real = nominal + fees, rounding down fees is equivalent to rounding down real.
    if (nominal.lt(params.lowerTarget)) {
        return fp.divDown(fp.add(nominal, fp.mulDown(params.fee, params.lowerTarget)), fp.add(fp.ONE, params.fee));
    }
    else if (nominal.lte(params.upperTarget)) {
        return nominal;
    }
    else {
        return fp.divDown(fp.sub(nominal, fp.mulDown(params.fee, params.upperTarget)), fp.sub(fp.ONE, params.fee));
    }
};
const _calcTokensOutGivenExactBptIn = (balances, bptAmountIn, bptTotalSupply, bptIndex) => {
    /**********************************************************************************************
    // exactBPTInForTokensOut                                                                    //
    // (per token)                                                                               //
    // aO = tokenAmountOut             /        bptIn         \                                  //
    // b = tokenBalance      a0 = b * | ---------------------  |                                 //
    // bptIn = bptAmountIn             \     bptTotalSupply    /                                 //
    // bpt = bptTotalSupply                                                                      //
    **********************************************************************************************/
    // Since we're computing an amount out, we round down overall. This means rounding down on both the
    // multiplication and division.
    const bptRatio = fp.divDown(bptAmountIn, bptTotalSupply);
    const amountsOut = [];
    for (let i = 0; i < balances.length; i++) {
        // BPT is skipped as those tokens are not the LPs, but rather the preminted and undistributed amount.
        if (i !== bptIndex) {
            amountsOut.push(fp.mulDown(balances[i], bptRatio));
        }
        else {
            amountsOut.push(fp.ZERO);
        }
    }
    return amountsOut;
};
exports._calcTokensOutGivenExactBptIn = _calcTokensOutGivenExactBptIn;
