/**
Turn Wi-Fi on.
*/
export declare function on(): Promise<void>;

/**
Turn Wi-Fi off.
*/
export function off(): Promise<void>;
    
/**
Invert the Wi-Fi state.

@param force The state to force.
*/
export declare function toggle(force?: boolean): Promise<void>;

/**
Turns Wi-Fi off and on.
*/
export declare function restart(): Promise<void>;

/** 
Check whether the Wi-Fi is on.
*/
export declare function isOn(): Promise<boolean>;

/**
Get the Wi-Fi device name.
*/
export declare function device(): Promise<string>;
