export type Settings = {
	lang: string;
	show_splash: boolean;
	ui_scale: number;
	performance_mode: boolean;
	projector_screen: any;
	debug: boolean;

	showAnnotations: boolean;
	showFadeOptions: boolean;
	showVolumeOptions: boolean;
	useSliders: boolean;
	allowSkipLive: boolean;
};

export const settingsDefault = {
	lang: "en",
	show_splash: true,
	ui_scale: 1,
	performance_mode: false,
	projector_screen: {},
	debug: false,

	showAnnotations: true,
	showFadeOptions: true,
	showVolumeOptions: true,
	useSliders: true,
	allowSkipLive: true,
};
