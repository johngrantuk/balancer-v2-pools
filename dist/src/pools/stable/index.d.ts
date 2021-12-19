import { Provider } from "@ethersproject/abstract-provider";
import BasePool, { IBasePoolParams, IBasePoolToken } from "../base";
export interface IStablePoolToken extends IBasePoolToken {
}
export interface IStablePoolParams extends IBasePoolParams {
    tokens: IStablePoolToken[];
    amplificationParameter: string;
}
export default class StablePool extends BasePool {
    private _tokens;
    private _amplificationParameter;
    get tokens(): IStablePoolToken[];
    get amplificationParameter(): string;
    constructor(params: IStablePoolParams);
    static initFromOnchain(provider: Provider, poolId: string, network?: string, query?: boolean): Promise<StablePool>;
    static initFromSubgraph(poolId: string, network?: string, query?: boolean, blockNumber?: number): Promise<StablePool>;
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
