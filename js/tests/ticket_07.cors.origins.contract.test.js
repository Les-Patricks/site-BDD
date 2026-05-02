import { beforeAll, describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

describe("Ticket 07 - CORS origins contract", () => {
	let adminBootstrap;
	let adminSave;
	let publishToFirebase;
	let sharedCorsOrigins;
	const devHostingOrigin = "https://bluffers-backoffice--dev-kni2oqbp.web.app";

	beforeAll(async () => {
		const root = process.cwd();
		adminBootstrap = await readFile(
			path.resolve(root, "supabase/functions/admin-bootstrap/index.ts"),
			"utf8",
		);
		adminSave = await readFile(
			path.resolve(root, "supabase/functions/admin-save/index.ts"),
			"utf8",
		);
		publishToFirebase = await readFile(
			path.resolve(root, "supabase/functions/publish-to-firebase/index.ts"),
			"utf8",
		);
		sharedCorsOrigins = await readFile(
			path.resolve(root, "supabase/functions/_shared/corsOrigins.ts"),
			"utf8",
		);
	});

	it("T-07-CORS-1: shared list keeps production and dev hosting origins", () => {
		expect(sharedCorsOrigins).toContain(
			'export const DEFAULT_ALLOWED_ORIGIN = "https://bluffers-backoffice.web.app";',
		);
		expect(sharedCorsOrigins).toMatch(/export const ALLOWED_ORIGINS = \[/);
		const allowedOriginsSection = sharedCorsOrigins.split(
			"export const ALLOWED_ORIGINS = [",
		)[1];
		expect(allowedOriginsSection).toBeDefined();
		const listUntilClose = allowedOriginsSection.split("];")[0];
		expect(listUntilClose).toContain("DEFAULT_ALLOWED_ORIGIN");
		expect(listUntilClose).toContain(devHostingOrigin);
	});

	it("T-07-CORS-2: admin-bootstrap and admin-save import shared CORS helpers", () => {
		expect(adminBootstrap).toContain("../_shared/corsOrigins.ts");
		expect(adminSave).toContain("../_shared/corsOrigins.ts");
	});

	it("T-07-CORS-3: publish-to-firebase import shared CORS helpers", () => {
		expect(publishToFirebase).toContain("../_shared/corsOrigins.ts");
	});
});
