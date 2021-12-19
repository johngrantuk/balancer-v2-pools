import BigNumber from "../big-number";
export declare const ZERO: BigNumber;
export declare const ONE: BigNumber;
export declare const MAX_POW_RELATIVE_ERROR: BigNumber;
export declare const MIN_POW_BASE_FREE_EXPONENT: BigNumber;
export declare const add: (a: BigNumber, b: BigNumber) => BigNumber;
export declare const sub: (a: BigNumber, b: BigNumber) => BigNumber;
export declare const mulDown: (a: BigNumber, b: BigNumber) => BigNumber;
export declare const mulUp: (a: BigNumber, b: BigNumber) => BigNumber;
export declare const divDown: (a: BigNumber, b: BigNumber) => BigNumber;
export declare const divUp: (a: BigNumber, b: BigNumber) => BigNumber;
export declare const powDown: (x: BigNumber, y: BigNumber) => BigNumber;
export declare const powUp: (x: BigNumber, y: BigNumber) => BigNumber;
export declare const complement: (x: BigNumber) => BigNumber;