#!/usr/bin/env bun
/**
 * Custom migration runner using bun:sqlite.
 * Replaces drizzle-kit migrate for environments where better-sqlite3
 * native addon doesn't work (Bun on Linux).
 */
import { Database } from "bun:sqlite";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dbPath = process.env.DATABASE_URL || "/data/prod.db";
const migrationsDir = process.env.MIGRATIONS_DIR || "./drizzle";

const db = new Database(dbPath);

// Ensure migrations tracking table exists
db.run(`
	CREATE TABLE IF NOT EXISTS _drizzle_migrations (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		hash TEXT NOT NULL UNIQUE,
		created_at INTEGER DEFAULT (unixepoch())
	)
`);

// Get list of already applied migrations
const applied = new Set(
	db.query("SELECT hash FROM _drizzle_migrations").all().map((r: any) => r.hash),
);

// Read and sort migration files
const files = readdirSync(migrationsDir)
	.filter((f) => f.endsWith(".sql"))
	.sort();

console.log(`📦 Database: ${dbPath}`);
console.log(`📁 Migrations dir: ${migrationsDir}`);
console.log(`🔍 Found ${files.length} migration file(s), ${applied.size} already applied`);

let appliedCount = 0;

for (const file of files) {
	const hash = file.replace(".sql", "");

	if (applied.has(hash)) {
		console.log(`  ✓ ${file} (already applied)`);
		continue;
	}

	const sql = readFileSync(join(migrationsDir, file), "utf-8");

	// Split on Drizzle's statement-breakpoint comments
	const statements = sql
		.split(/-->\s*statement-breakpoint\s*/)
		.map((s) => s.trim())
		.filter((s) => s.length > 0 && !s.startsWith("-->"));

	console.log(`  🚀 Applying ${file} (${statements.length} statement(s))...`);

	// Run in transaction
	const tx = db.transaction(() => {
		for (const stmt of statements) {
			db.run(stmt);
		}
	});
	tx();

	// Record migration
	db.run("INSERT INTO _drizzle_migrations (hash) VALUES (?)", [hash]);

	appliedCount++;
	console.log(`  ✅ ${file} applied`);
}

if (appliedCount === 0) {
	console.log("🎉 No new migrations to apply");
} else {
	console.log(`🎉 Applied ${appliedCount} migration(s)`);
}

db.close();
