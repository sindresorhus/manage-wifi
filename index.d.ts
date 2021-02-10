declare const wifi: {
	/**
	Turn Wi-Fi on.
	*/
	on(): Promise<void>;

	/**
	Turn Wi-Fi off.
	*/
	off(): Promise<void>;

	/**
	Invert the Wi-Fi state.

	@param force - The state to force.
	*/
	toggle(force?: boolean): Promise<void>;

	/**
	Turns Wi-Fi off and on.
	*/
	restart(): Promise<void>;

	/**
	Check whether the Wi-Fi is on.
	*/
	isOn(): Promise<boolean>;

	/**
	Get the Wi-Fi device name.
	*/
	device(): Promise<string>;
};

export default wifi;
