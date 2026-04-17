import react from "@vitejs/plugin-react";
import "dotenv/config";
import path from "node:path";
import { defineConfig, splitVendorChunkPlugin } from "vite";
import injectHTML from "vite-plugin-html-inject";
import tsConfigPaths from "vite-tsconfig-paths";

type Extension = {
	name: string;
	version: string;
	config: Record<string, unknown>;
};

enum ExtensionName {
	FIREBASE_AUTH = "firebase-auth",
	STACK_AUTH = "stack-auth"
}

const listExtensions = (): Extension[] => {
	if (process.env.DATABUTTON_EXTENSIONS) {
		try {
			return JSON.parse(process.env.DATABUTTON_EXTENSIONS) as Extension[];
		} catch (err: unknown) {
			console.error("Error parsing DATABUTTON_EXTENSIONS", err);
			console.error(process.env.DATABUTTON_EXTENSIONS);
			return [];
		}
	}

	return [];
};

const extensions = listExtensions();

const getExtensionConfig = (name: string): Record<string, unknown> | undefined => {
	const extension = extensions.find((it) => it.name === name);

	if (!extension) {
		console.warn(`Extension ${name} not found`);
		return undefined;
	}

	return extension.config;
};

/**
 * Validates that Firebase config has all required keys.
 * Returns true only if apiKey, projectId, and appId are present and non-empty.
 * Implements "Atomic Config or Nothing" principle - config must be complete or not used.
 */
const isFirebaseConfigComplete = (
	config: Record<string, unknown> | undefined,
): boolean => {
	if (!config) return false;

	const requiredKeys = ["apiKey", "projectId", "appId"];

	return requiredKeys.every((key) => {
		const value = config[key];
		return typeof value === "string" && value.trim().length > 0;
	});
};

const buildVariables = () => {
	const appId = process.env.DATABUTTON_PROJECT_ID;

	const defines: Record<string, string> = {
		__APP_ID__: JSON.stringify(appId),
		__API_PATH__: JSON.stringify(""),
		__API_HOST__: JSON.stringify(""),
		__API_PREFIX_PATH__: JSON.stringify(""),
		__API_URL__: JSON.stringify("http://localhost:8000"),
		__WS_API_URL__: JSON.stringify("ws://localhost:8000"),
		__APP_BASE_PATH__: JSON.stringify("/"),
		__APP_TITLE__: JSON.stringify("Databutton"),
		__APP_FAVICON_LIGHT__: JSON.stringify("/favicon-light.svg"),
		__APP_FAVICON_DARK__: JSON.stringify("/favicon-dark.svg"),
		__APP_DEPLOY_USERNAME__: JSON.stringify(""),
		__APP_DEPLOY_APPNAME__: JSON.stringify(""),
		__APP_DEPLOY_CUSTOM_DOMAIN__: JSON.stringify(""),
		__STACK_AUTH_CONFIG__: JSON.stringify(
			JSON.stringify(getExtensionConfig(ExtensionName.STACK_AUTH)),
		),
	};

	// Only inject Firebase config if it's complete with all required keys
	// Implements "Atomic Config or Nothing" to prevent auth/invalid-api-key errors
	const firebaseConfig = getExtensionConfig(ExtensionName.FIREBASE_AUTH);
	if (isFirebaseConfigComplete(firebaseConfig)) {
		defines.__FIREBASE_CONFIG__ = JSON.stringify(JSON.stringify(firebaseConfig));
		console.log("Firebase config validated and injected successfully");
	} else {
		console.warn(
			"Firebase config is incomplete (missing apiKey, projectId, or appId). " +
				"Skipping injection to prevent auth errors in Preview.",
		);
	}

	return defines;
};

// https://vite.dev/config/
export default defineConfig({
	define: buildVariables(),
	plugins: [react(), splitVendorChunkPlugin(), tsConfigPaths(), injectHTML()],
	server: {
		proxy: {
			"/routes": {
				target: "http://127.0.0.1:8000",
				changeOrigin: true,
			},
		},
	},
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
