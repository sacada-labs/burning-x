#!/usr/bin/env bun
/**
 * Take mobile screenshots for F-Droid store listing.
 * Uses the already-running dev server at localhost:3000.
 * Sets x-screenshot-mode header to bypass auth and show logged-in UI.
 * Viewport: iPhone 14 (390x844 @ 2x DPR) for crisp mobile screenshots.
 */
import puppeteer from "puppeteer";
import { setTimeout } from "node:timers/promises";

const BASE_URL = "http://localhost:3000";
const OUTPUT_DIR = "fastlane/metadata/android/en-US/images/phoneScreenshots";

const shots = [
	{ path: "/auth", name: "1-auth", desc: "Sign in" },
	{ path: "/about", name: "2-about", desc: "About" },
	{ path: "/", name: "3-dashboard", desc: "Dashboard" },
	{ path: "/plans", name: "4-plans", desc: "Training Plans" },
	{ path: "/plans/1", name: "5-plan-detail", desc: "Plan Detail" },
	{ path: "/schedule", name: "6-schedule", desc: "Schedule" },
	{ path: "/history", name: "7-history", desc: "History" },
	{ path: "/settings", name: "8-settings", desc: "Settings" },
];

async function main() {
	console.log("📱 Taking mobile screenshots (logged-in mode)...");

	const browser = await puppeteer.launch({
		headless: "new",
		defaultViewport: { width: 390, height: 844, deviceScaleFactor: 2 },
	});

	const page = await browser.newPage();

	// Emulate mobile UA
	await page.setUserAgent(
		"Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
	);

	// Set screenshot bypass header on every request
	await page.setExtraHTTPHeaders({
		"x-screenshot-mode": "1",
	});

	for (const shot of shots) {
		console.log(`📷 ${shot.desc} (${shot.path})...`);
		try {
			await page.goto(`${BASE_URL}${shot.path}`, {
				waitUntil: "networkidle0",
				timeout: 10000,
			});
		} catch {
			// Some pages might error; still capture what we have
		}
		await setTimeout(800);
		await page.screenshot({
			path: `${OUTPUT_DIR}/${shot.name}.png`,
			fullPage: false,
		});
		console.log(`  ✅ Saved ${shot.name}.png`);
	}

	await browser.close();
	console.log(`🎉 Done! Screenshots in ${OUTPUT_DIR}`);
}

main().catch((err) => {
	console.error("❌", err.message);
	process.exit(1);
});
