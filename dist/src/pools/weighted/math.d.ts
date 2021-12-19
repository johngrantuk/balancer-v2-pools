import BigNumber from "../../utils/big-number";
export declare const _calculateInvariant: (normalizedWeights: BigNumber[], balances: BigNumber[]) => BigNumber;
export declare const _calcOutGivenIn: (balanceIn: BigNumber, weightIn: BigNumber, balanceOut: BigNumber, weightOut: BigNumber, amountIn: BigNumber, options?: {
    swapFeePercentage: BigNumber;
    tokenInDecimals: number;
}) => BigNumber;
export declare const _calcInGivenOut: (balanceIn: BigNumber, weightIn: BigNumber, balanceOut: BigNumber, weightOut: BigNumber, amountOut: BigNumber, options?: {
    swapFeePercentage: BigNumber;
    tokenInDecimals: number;
}) => BigNumber;
export declare const _calcBptOutGivenExactTokensIn: (balances: BigNumber[], normalizedWeights: BigNumber[], amountsIn: BigNumber[], bptTotalSupply: BigNumber, swapFee: BigNumber) => BigNumber;
export declare const _calcTokenInGivenExactBptOut: (balance: BigNumber, normalizedWeight: BigNumber, bptAmountOut: BigNumber, bptTotalSupply: BigNumber, swapFee: BigNumber) => BigNumber;
export declare const _calcBptInGivenExactTokensOut: (balances: BigNumber[], normalizedWeights: BigNumber[], amountsOut: BigNumber[], bptTotalSupply: BigNumber, swapFee: BigNumber) => BigNumber;
export declare const _calcTokenOutGivenExactBptIn: (balance: BigNumber, normalizedWeight: BigNumber, bptAmountIn: BigNumber, bptTotalSupply: BigNumber, swapFee: BigNumber) => BigNumber;
export declare const _calcTokensOutGivenExactBptIn: (balances: BigNumber[], bptAmountIn: BigNumber, bptTotalSupply: BigNumber) => BigNumber[];
export declare const _calcDueTokenProtocolSwapFeeAmount: (balance: BigNumber, normalizedWeight: BigNumber, previousInvariant: BigNumber, currentInvariant: BigNumber, protocolSwapFeePercentage: BigNumber) => BigNumber;
export declare const _calcBptOutGivenExactTokenIn: (balance: BigNumber, normalizedWeight: BigNumber, amountIn: BigNumber, bptTotalSupply: BigNumber, swapFee: BigNumber) => BigNumber;
export declare function _calcBptInGivenExactTokenOut(balance: BigNumber, normalizedWeight: BigNumber, amountOut: BigNumber, bptTotalSupply: BigNumber, swapFee: BigNumber): BigNumber;
