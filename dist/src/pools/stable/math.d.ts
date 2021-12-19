import BigNumber from "../../utils/big-number";
export declare const MIN_AMP: BigNumber;
export declare const MAX_AMP: BigNumber;
export declare const AMP_PRECISION: BigNumber;
export declare const MAX_STABLE_TOKENS = 5;
export declare const _calculateInvariant: (amplificationParameter: BigNumber, balances: BigNumber[], roundUp: boolean) => BigNumber;
export declare const _calcOutGivenIn: (amplificationParameter: BigNumber, balances: BigNumber[], tokenIndexIn: number, tokenIndexOut: number, tokenAmountIn: BigNumber, options?: {
    swapFeePercentage: BigNumber;
    tokenInDecimals: number;
}) => BigNumber;
export declare const _calcInGivenOut: (amplificationParameter: BigNumber, balances: BigNumber[], tokenIndexIn: number, tokenIndexOut: number, tokenAmountOut: BigNumber, options?: {
    swapFeePercentage: BigNumber;
    tokenInDecimals: number;
}) => BigNumber;
export declare const _calcBptOutGivenExactTokensIn: (amp: BigNumber, balances: BigNumber[], amountsIn: BigNumber[], bptTotalSupply: BigNumber, swapFeePercentage: BigNumber) => BigNumber;
export declare const _calcTokenInGivenExactBptOut: (amp: BigNumber, balances: BigNumber[], tokenIndex: number, bptAmountOut: BigNumber, bptTotalSupply: BigNumber, swapFeePercentage: BigNumber) => BigNumber;
export declare const _calcBptInGivenExactTokensOut: (amp: BigNumber, balances: BigNumber[], amountsOut: BigNumber[], bptTotalSupply: BigNumber, swapFeePercentage: BigNumber) => BigNumber;
export declare const _calcTokenOutGivenExactBptIn: (amp: BigNumber, balances: BigNumber[], tokenIndex: number, bptAmountIn: BigNumber, bptTotalSupply: BigNumber, swapFeePercentage: BigNumber) => BigNumber;
export declare const _calcTokensOutGivenExactBptIn: (balances: BigNumber[], bptAmountIn: BigNumber, bptTotalSupply: BigNumber) => BigNumber[];
export declare const _calcDueTokenProtocolSwapFeeAmount: (amplificationParameter: BigNumber, balances: BigNumber[], lastInvariant: BigNumber, tokenIndex: number, protocolSwapFeePercentage: BigNumber) => BigNumber;
