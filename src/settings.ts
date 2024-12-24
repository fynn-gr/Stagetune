import { mount } from "svelte";
import App from "./Settings.svelte";

const app = mount(App, {
	target: document.body,
});

export default app;
