export type Settings = {
	recent: Array<string>;
	lang: string;
	show_splash: boolean;
	ui_scale: number;
	performance_mode: boolean;
	projector_screen: any;
	debug: boolean;

	showAnnotations: boolean;
	showFadeOptions: boolean;
	showVolumeOptions: boolean;
	allowSkipLive: boolean;
};

export const settingsDefault = {
	recent: [],
	lang: "en",
	show_splash: true,
	ui_scale: 1,
	performance_mode: false,
	projector_screen: {},
	debug: false,

	showAnnotations: true,
	showFadeOptions: true,
	showVolumeOptions: true,
	allowSkipLive: true,
};
