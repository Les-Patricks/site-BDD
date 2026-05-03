import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

const readSource = (relativePath) =>
	readFile(path.resolve(process.cwd(), relativePath), "utf8");

/**
 * Ticket 10.1 : preuve statique que les onglets branchent notify sur succes / echec (ajout, renommage, suppression).
 * Le comportement metier addWord/addFamily/addLanguage est deja couvert par `state.test.js`.
 */
describe("Ticket 10.1 — onglets + notify (contrat source)", () => {
	it("wordTab : notify success et warning sur ajout mot", async () => {
		const src = await readSource("js/tabs/wordTab.js");
		expect(src).toContain('notify.success("Mot ajoute."');
		expect(src).toContain('notify.warning("Un mot avec ce nom existe deja."');
	});

	it("familyTab : notify sur ajout famille et ajout mot dans famille", async () => {
		const src = await readSource("js/tabs/familyTab.js");
		expect(src).toContain('notify.success("Famille ajoutee."');
		expect(src).toContain('notify.warning("Une famille avec ce nom existe deja."');
		expect(src).toContain('notify.success("Mot associe a la famille."');
		expect(src).toContain("Impossible d'ajouter ce mot");
	});

	it("languageTab : notify success et warning sur ajout langue", async () => {
		const src = await readSource("js/tabs/languageTab.js");
		expect(src).toContain('notify.success("Langue ajoutee."');
		expect(src).toContain('notify.warning("Une langue avec ce nom existe deja."');
	});

	it("wordTab : notify sur suppression / renommage mot et traductions", async () => {
		const src = await readSource("js/tabs/wordTab.js");
		expect(src).toContain('notify.success("Mot supprime."');
		expect(src).toContain('notify.success("Mot renomme."');
		expect(src).toContain(
			'notify.warning("Ce nom est deja utilise par un autre mot."',
		);
		expect(src).toContain('notify.success("Traduction supprimee."');
		expect(src).toContain('notify.success("Traduction enregistree."');
	});

	it("familyTab : notify sur suppression / renommage famille", async () => {
		const src = await readSource("js/tabs/familyTab.js");
		expect(src).toContain('notify.success("Famille supprimee."');
		expect(src).toContain('notify.success("Famille renommee."');
		expect(src).toContain(
			'notify.warning("Ce nom est deja utilise par une autre famille."',
		);
	});

	it("languageTab : notify sur suppression / renommage langue", async () => {
		const src = await readSource("js/tabs/languageTab.js");
		expect(src).toContain('notify.success("Langue supprimee."');
		expect(src).toContain('notify.success("Langue renommee."');
		expect(src).toContain(
			'notify.warning("Ce nom est deja utilise par une autre langue."',
		);
	});

	it("succes suppression / renommage / traduction : durationMs 2500 (ticket 10)", async () => {
		const word = await readSource("js/tabs/wordTab.js");
		expect(word).toContain(
			'notify.success("Mot supprime.", { durationMs: 2500 })',
		);
		expect(word).toContain(
			'notify.success("Mot renomme.", { durationMs: 2500 })',
		);
		expect(word).toContain(
			'notify.success("Traduction supprimee.", { durationMs: 2500 })',
		);
		expect(word).toContain(
			'notify.success("Traduction enregistree.", { durationMs: 2500 })',
		);

		const family = await readSource("js/tabs/familyTab.js");
		expect(family).toContain(
			'notify.success("Famille supprimee.", { durationMs: 2500 })',
		);
		expect(family).toContain(
			'notify.success("Famille renommee.", { durationMs: 2500 })',
		);

		const language = await readSource("js/tabs/languageTab.js");
		expect(language).toContain(
			'notify.success("Langue supprimee.", { durationMs: 2500 })',
		);
		expect(language).toContain(
			'notify.success("Langue renommee.", { durationMs: 2500 })',
		);
	});
});
