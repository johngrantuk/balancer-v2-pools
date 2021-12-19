import { Provider } from "@ethersproject/abstract-provider";
import BasePool, { IBasePoolParams, IBasePoolToken } from "../base";
export interface IWeightedPoolToken extends IBasePoolToken {
    weight: string;
}
export interface IWeightedPoolParams extends IBasePoolParams {
    tokens: IWeightedPoolToken[];
}
export default class WeightedPool extends BasePool {
    private MIN_TOKENS;
    private MAX_TOKENS;
    private MIN_WEIGHT;
    private _tokens;
    get tokens(): IWeightedPoolToken[];
    constructor(params: IWeightedPoolParams);
    static initFromOnchain(provider: Provider, poolId: string, network?: string, query?: boolean): Promise<WeightedPool>;
    static initFromSubgraph(poolId: string, network?: string, query?: boolean, blockNumber?: number): Promise<WeightedPool>;
    getInvariant(): string;
    swapGivenIn(tokenInSymbol: string, tokenOutSymbol: string, amountIn: string): string;
    swapGivenOut(tokenInSymbol: string, tokenOutSymbol: string, amountOut: string): string;
    joinExactTokensInForBptOut(amountsIn: {
        [symbol: string]: string;
    }): string;
    joinTokenInForExactBptOut(tokenInSymbol: string, bptOut: string): string;
    exitExactBptInForTokenOut(tokenOutSymbol: string, bptIn: string): string;
    exitExactBptInForTokensOut(bptIn: string): string[];
    exitBptInForExactTokensOut(amountsOut: {
        [symbol: string]: string;
    }): string;
}
