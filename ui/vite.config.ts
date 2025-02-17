import react from "@vitejs/plugin-react";
import "dotenv/config";
import path from "node:path";
import { defineConfig, splitVendorChunkPlugin } from "vite";
import injectHTML from "vite-plugin-html-inject";
import tsConfigPaths from "vite-tsconfig-paths";

const loadExtensions = (): { name: string; config: string }[] => {
	const extensions = process.env.DATABUTTON_EXTENSIONS;

	try {
		return JSON.parse(extensions);
	} catch (error) {
		console.info("No extensions found");
		return [];
	}
};

const getFirebasExtensionConfig = () => {
	const extensions = loadExtensions();

	const extension = extensions.find((it) => it.name === "firebase-auth");

	return extension ? extension.config : "";
};

const buildVariables = () => {
	const appId = process.env.DATABUTTON_PROJECT_ID;

	const defines: Record<string, string> = {
		__APP_ID__: JSON.stringify(appId),
		__API_PATH__: JSON.stringify("http://localhost:8000"),
		__API_URL__: JSON.stringify("http://localhost:8000"),
		__WS_API_URL__: JSON.stringify("ws://localhost:8000"),
		__APP_BASE_PATH__: JSON.stringify("/"),
		__APP_TITLE__: JSON.stringify("Databutton"),
		__FIREBASE_CONFIG__: getFirebasExtensionConfig(),
	};

	return defines;
};

// https://vite.dev/config/
export default defineConfig({
	define: buildVariables(),
	plugins: [react(), splitVendorChunkPlugin(), tsConfigPaths(), injectHTML()],
	resolve: {
		alias: {
			resolve: {
				alias: {
					"@": path.resolve(__dirname, "./src"),
				},
			},
		},
	},
});
