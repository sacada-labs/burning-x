import type { CapacitorConfig } from "@capacitor/cli";

// The backend URL can be overridden at build time via CAPACITOR_SERVER_URL.
// For CI builds (GitHub Actions, F-Droid), set the env var to your deployed URL.
// Falls back to the production server so the APK works out of the box.
const serverUrl =
	process.env.CAPACITOR_SERVER_URL || "https://burning-x.direction-priority.win";

const config: CapacitorConfig = {
	appId: "dev.burningx.app",
	appName: "Burning X",
	webDir: "dist",
	// When serverUrl is set, Capacitor loads the app from that remote URL
	// instead of bundled local assets. This lets the full-stack TanStack Start
	// app (with SSR and server functions) work inside the native wrapper.
	server: {
		url: serverUrl,
		cleartext: false,
	},
	android: {
		buildOptions: {
			keystorePath: undefined,
			keystoreAlias: undefined,
		},
	},
};

export default config;
