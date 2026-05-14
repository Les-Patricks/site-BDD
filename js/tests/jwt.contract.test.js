import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

async function readPackageJson() {
	const p = path.resolve(process.cwd(), "package.json");
	return JSON.parse(await readFile(p, "utf8"));
}

describe("JWT verification (deploy + contract)", () => {
	it("aucun script deploy:* ne desactive verify-jwt", async () => {
		const pkg = await readPackageJson();
		for (const [name, script] of Object.entries(pkg.scripts ?? {})) {
			if (!name.startsWith("deploy:")) continue;
			if (typeof script !== "string" || !script.includes("supabase functions deploy")) {
				continue;
			}
			expect(script, `${name} ne doit pas contenir --no-verify-jwt`).not.toMatch(
				/--no-verify-jwt/,
			);
		}
	});

	it("le front appelle les fonctions via functions.invoke (JWT session implicite)", async () => {
		const main = await readFile(path.resolve(process.cwd(), "js/main.js"), "utf8");
		const state = await readFile(path.resolve(process.cwd(), "js/state.js"), "utf8");
		const dt = await readFile(
			path.resolve(process.cwd(), "js/databaseTransfer.js"),
			"utf8",
		);
		expect(main).toContain('functions.invoke("admin-bootstrap")');
		expect(state).toContain('functions.invoke("admin-save"');
		expect(dt).toContain('functions.invoke("publish-to-firebase")');
	});
});

/** Fonctions metier exposees en Edge ; verification JWT cote plateforme. */
const JWT_CRITICAL_FUNCTIONS = [
	"publish-to-firebase",
	"admin-save",
	"admin-bootstrap",
];

const runRemoteJwtGate = process.env.RUN_JWT_GATE_TEST === "1";
const describeJwtRemote = runRemoteJwtGate ? describe : describe.skip;

describeJwtRemote("Optional remote JWT gate (RUN_JWT_GATE_TEST=1)", () => {
	it.each(JWT_CRITICAL_FUNCTIONS)(
		"refuse un POST sans Authorization sur %s (401 si JWT actif cote plateforme)",
		async (fnName) => {
			const supabaseUrl =
				process.env.SUPABASE_URL ?? "https://kywafnfxmugjwhykwiae.supabase.co";
			const anon =
				process.env.SUPABASE_ANON_KEY ??
				"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5d2FmbmZ4bXVnandoeWt3aWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MjU0NDUsImV4cCI6MjA4ODEwMTQ0NX0.jjDuqAzsoiAdLXFVxM9xjBesnXfNa-8K9SGCNzDjHNQ";

			const res = await fetch(`${supabaseUrl}/functions/v1/${fnName}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					apikey: anon,
				},
				body: "{}",
			});

			expect(
				res.status,
				"Si 200: redeployer les fonctions sans --no-verify-jwt pour activer la verification JWT.",
			).toBe(401);
		},
	);
});
