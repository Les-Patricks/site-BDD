import { beforeAll, describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

/** Contrat CI : merge -> Hosting live (main) + canal dev (branche dev) */
describe("Firebase Hosting merge workflow contract", () => {
	let yml;

	beforeAll(async () => {
		yml = await readFile(
			path.resolve(
				process.cwd(),
				".github/workflows/firebase-hosting-merge.yml",
			),
			"utf8",
		);
	});

	it("push declenche sur main et dev", () => {
		expect(yml).toContain("name: Deploy to Firebase Hosting on merge");
		expect(yml).toMatch(/push:/);
		expect(yml).toMatch(/-\s*main\b/);
		expect(yml).toMatch(/-\s*dev\b/);
	});

	it("job live sur main avec channelId live, job dev sur dev avec channelId dev", () => {
		const parts = yml.split(/^\s*deploy_dev:\s*$/m);
		expect(parts.length, "blocs deploy_live puis deploy_dev").toBe(2);
		const [liveSection, devSection] = parts;
		expect(liveSection).toMatch(/deploy_live:/);
		expect(liveSection).toContain("github.ref == 'refs/heads/main'");
		expect(liveSection).toContain("channelId: live");
		expect(devSection).toContain("github.ref == 'refs/heads/dev'");
		expect(devSection).toContain("channelId: dev");
	});

	it("config Supabase et action-hosting-deploy repetes par job", () => {
		expect((yml.match(/write-supabase-config\.mjs/g) || []).length).toBe(2);
		expect((yml.match(/FirebaseExtended\/action-hosting-deploy@v0/g) || []).length).toBe(
			2,
		);
	});
});
