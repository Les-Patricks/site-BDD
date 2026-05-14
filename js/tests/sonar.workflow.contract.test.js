import { beforeAll, describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

/** Contrat CI : un seul job Sonar (tests + scan) ; nom du check PR ~ SonarCloud */
describe("Sonar workflow merge gate contract", () => {
	let yml;

	beforeAll(async () => {
		yml = await readFile(
			path.resolve(process.cwd(), ".github/workflows/sonar.yml"),
			"utf8",
		);
	});

	it("workflow declenche sur main et sur pull_request", () => {
		expect(yml).toContain("name: SonarCloud Analysis");
		expect(yml).toMatch(/pull_request:/);
		expect(yml).toMatch(/branches:\s*\r?\n\s*-\s*main/s);
	});

	it("job sonarcloud affiche le check SonarCloud (branch protection)", () => {
		expect(yml).toMatch(/^\s*sonarcloud:\s*$/m);
		expect(yml).toMatch(/sonarcloud:\r?\n\s+name:\s+SonarCloud\b/m);
	});

	it("npm run test avant SonarCloud Scan", () => {
		const runTest = yml.indexOf("npm run test");
		const scan = yml.indexOf("SonarCloud Scan");
		const action = yml.indexOf("SonarSource/sonarcloud-github-action");
		expect(runTest, "etape tests").toBeGreaterThan(-1);
		expect(scan, "etape SonarCloud Scan").toBeGreaterThan(-1);
		expect(action, "action sonarcloud-github-action").toBeGreaterThan(-1);
		expect(scan).toBeGreaterThan(runTest);
		expect(action).toBeGreaterThan(runTest);
	});
});
