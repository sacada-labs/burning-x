#!/usr/bin/env bun
import puppeteer from "puppeteer";
import { spawn } from "node:child_process";
import { setTimeout } from "node:timers/promises";

const PORT = 3458;
const BASE_URL = `http://localhost:${PORT}`;
const OUTPUT_DIR = "fastlane/metadata/android/en-US/images/phoneScreenshots";

async function waitForServer(url) {
	for (let i = 0; i < 60; i++) {
		try {
			const res = await fetch(url);
			if (res.ok) return;
		} catch {}
		await setTimeout(1000);
	}
	throw new Error("Server timeout");
}

async function main() {
	console.log("Building app...");
	const build = spawn("bun", ["run", "build"], { stdio: "pipe" });
	let buildOutput = "";
	build.stdout.on("data", (d) => { buildOutput += d; });
	build.stderr.on("data", (d) => { buildOutput += d; });
	await new Promise((resolve, reject) => {
		build.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`Build failed: ${code}`))));
	});

	console.log("Starting production server...");
	const server = spawn("bun", [".output/server/index.mjs"], {
		stdio: "pipe",
		env: {
			...process.env,
			PORT: String(PORT),
			BETTER_AUTH_SECRET: "screenshot-secret-not-for-production",
			BETTER_AUTH_URL: BASE_URL,
			DATABASE_URL: ":memory:",
		},
	});
	let serverOutput = "";
	server.stdout.on("data", (d) => { serverOutput += d; });
	server.stderr.on("data", (d) => { serverOutput += d; });

	try {
		await waitForServer(BASE_URL);
		console.log("Server ready, taking screenshots...");

		const browser = await puppeteer.launch({
			headless: "new",
			defaultViewport: { width: 390, height: 844, deviceScaleFactor: 2 },
		});

		const page = await browser.newPage();

		// Screenshot 1: Auth page (public)
		console.log("Screenshot: auth page");
		await page.goto(`${BASE_URL}/auth`, { waitUntil: "domcontentloaded", timeout: 15000 });
		await setTimeout(1000);
		await page.screenshot({ path: `${OUTPUT_DIR}/1-auth.png` });

		// Screenshot 2: About page (public)
		console.log("Screenshot: about page");
		await page.goto(`${BASE_URL}/about`, { waitUntil: "domcontentloaded", timeout: 15000 });
		await setTimeout(1000);
		await page.screenshot({ path: `${OUTPUT_DIR}/2-about.png` });

		// Screenshot 3: Landing page (redirects to auth, shows the app shell)
		console.log("Screenshot: landing");
		await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded", timeout: 15000 });
		await setTimeout(1000);
		await page.screenshot({ path: `${OUTPUT_DIR}/3-landing.png` });

		await browser.close();
		console.log("Done! Screenshots saved to", OUTPUT_DIR);
	} catch (err) {
		console.error("Server output:", serverOutput);
		throw err;
	} finally {
		server.kill("SIGTERM");
		await setTimeout(1000);
		if (!server.killed) server.kill("SIGKILL");
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
