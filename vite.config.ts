import { defineConfig } from "vite";
import { resolve } from "path";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";
import * as path from "path";
import { processIcons } from "./src/pureUI/modules/pureIconPlugin";

const mobile = !!/android|ios/.exec(process.env.TAURI_ENV_PLATFORM);

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
	return {
		plugins: [
			svelte({
				preprocess: [
					sveltePreprocess({
						typescript: true,
					}),
				],
				compilerOptions: {
					runes: true,
					compatibility: {
						componentApi: 5
					}
				}
			}),

			{
				name: "pureIcons pull",
				buildStart(options) {
					if (command === "serve") return;

					processIcons();
				},
			},
		],

		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
		publicDir: "public",

		// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
		// prevent vite from obscuring rust errors
		clearScreen: false,
		// tauri expects a fixed port, fail if that port is not available
		server: {
			port: 1420,
			strictPort: true,
			host: mobile ? "0.0.0.0" : false,
			hmr: mobile
				? {
						protocol: "ws",
						port: 1421,
					}
				: undefined,
			watch: {
				// 3. tell vite to ignore watching `src-tauri`
				ignored: ["**/src-tauri/**"],
			},
		},
		// to make use of `TAURI_DEBUG` and other env variables
		// https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
		envPrefix: ["VITE_", "TAURI_"],
		build: {
			rollupOptions: {
				input: {
					main: resolve(__dirname, "index.html"),
					nested: resolve(__dirname, "projector.html"),
					settings: resolve(__dirname, "settings.html"),
				},
			},

			// Tauri supports es2021
			target:
				process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari13",
			// don't minify for debug builds
			minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
			// produce sourcemaps for debug builds
			sourcemap: !!process.env.TAURI_DEBUG,
		},
	};
});
