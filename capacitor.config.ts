import type { CapacitorConfig } from "@capacitor/cli";

// The backend URL is injected at build time via CAPACITOR_SERVER_URL.
// For local dev, it defaults to the local Vite server.
// For production APK builds, set this to your deployed backend URL
// (e.g. https://burningx.yourdomain.com).
const serverUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
	appId: "dev.burningx.app",
	appName: "Burning X",
	webDir: "dist",
	// When serverUrl is set, Capacitor loads the app from that remote URL
	// instead of bundled local assets. This lets the full-stack TanStack Start
	// app (with SSR and server functions) work inside the native wrapper.
	server: serverUrl
		? {
				url: serverUrl,
				cleartext: false,
			}
		: undefined,
	android: {
		buildOptions: {
			keystorePath: undefined,
			keystoreAlias: undefined,
		},
	},
};

export default config;
