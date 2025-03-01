import { mount } from "svelte";
import App from "./Projector.svelte";

const app = mount(App, {
	target: document.body,
});

export default app;
