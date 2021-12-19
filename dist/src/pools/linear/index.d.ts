import BasePool, { IBasePoolParams, IBasePoolToken } from "../base";
export interface ILinearPoolToken extends IBasePoolToken {
}
export interface ILinearPoolParams extends IBasePoolParams {
    mainToken: ILinearPoolToken;
    wrappedToken: ILinearPoolToken;
    lowerTarget: string;
    upperTarget: string;
}
export default class LinearPool extends BasePool {
    private MAX_TOKEN_BALANCE;
    private _mainToken;
    private _wrappedToken;
    private _bptToken;
    private _lowerTarget;
    private _upperTarget;
    get tokens(): ILinearPoolToken[];
    get lowerTarget(): string;
    get upperTarget(): string;
    constructor(params: ILinearPoolParams);
    swapGivenIn(tokenInSymbol: string, tokenOutSymbol: string, amountIn: string): string;
    swapGivenOut(tokenInSymbol: string, tokenOutSymbol: string, amountOut: string): string;
}
