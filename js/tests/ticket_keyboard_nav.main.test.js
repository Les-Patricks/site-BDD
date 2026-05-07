/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../SupabaseManager.js", () => ({
	supabase: {
		functions: {
			invoke: vi.fn().mockResolvedValue({
				data: {
					languages: [],
					words: [],
					translations: [],
					families: [],
					familyAssociations: [],
					publishPending: false,
				},
				error: null,
			}),
		},
		auth: {
			getSession: vi.fn().mockResolvedValue({
				data: { session: { user: { id: "u1" } } },
				error: null,
			}),
		},
	},
}));

vi.mock("../notify.js", () => ({
	notify: { error: vi.fn(), success: vi.fn(), warning: vi.fn(), show: vi.fn() },
}));

vi.mock("../publish.js", () => ({
	displayPublishBtn: vi.fn(),
	hidePublishBtn: vi.fn(),
}));

vi.mock("../saveManager.js", () => ({}));
vi.mock("../tabs/familyTab.js", () => ({ updateFamilies: vi.fn() }));
vi.mock("../tabs/wordTab.js", () => ({ updateWords: vi.fn() }));
vi.mock("../tabs/languageTab.js", () => ({ updateLanguages: vi.fn() }));
vi.mock("../ui/AccordionView.js", () => ({ updateBtns: vi.fn() }));
vi.mock("../ui/tabSearch.js", () => ({
	initTabSearch: vi.fn(),
	refreshTabSearch: vi.fn(),
}));
vi.mock("../state.js", async () => {
	const actual = await vi.importActual("../state.js");
	return { ...actual, hydrateStore: vi.fn() };
});

function mountMainDom() {
	document.body.innerHTML = `
		<div id="bootstrapLoadingRoot" class="" aria-busy="true"></div>
		<h1>Bluffers BDD</h1>
		<div class="tab" role="tablist" aria-label="Navigation principale">
			<button class="tab__button" id="wordFamilyBtn" role="tab" aria-selected="false" aria-controls="wordFamilyTab" tabindex="0">Famille de mots</button>
			<button class="tab__button" id="wordBtn" role="tab" aria-selected="false" aria-controls="wordTab" tabindex="0">Mots</button>
			<button class="tab__button" id="languagesBtn" role="tab" aria-selected="false" aria-controls="languageTab" tabindex="0">Langues</button>
		</div>
		<div class="tab-panel" id="wordFamilyTab" role="tabpanel"></div>
		<div class="tab-panel" id="wordTab" role="tabpanel"></div>
		<div class="tab-panel" id="languageTab" role="tabpanel"></div>
		<button id="saveBtn"></button>
		<button id="publishBtn"></button>
		<button id="confirmPublishBtn"></button>
		<button id="cancelPublishBtn"></button>
	`;
}

describe("main.js — navigation clavier onglets", () => {
	beforeEach(() => {
		mountMainDom();
		vi.resetModules();
	});

	it("ArrowRight active l'onglet suivant et deplace le focus", async () => {
		await import("../main.js");

		const wordFamilyBtn = document.getElementById("wordFamilyBtn");
		const wordBtn = document.getElementById("wordBtn");
		const tablist = document.querySelector('[role="tablist"]');

		wordFamilyBtn.focus();
		tablist.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));

		expect(document.activeElement).toBe(wordBtn);
		expect(wordBtn.getAttribute("aria-selected")).toBe("true");
	});

	it("ArrowLeft active l'onglet precedent et deplace le focus", async () => {
		await import("../main.js");

		const wordFamilyBtn = document.getElementById("wordFamilyBtn");
		const wordBtn = document.getElementById("wordBtn");
		const tablist = document.querySelector('[role="tablist"]');

		wordBtn.focus();
		tablist.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true }));

		expect(document.activeElement).toBe(wordFamilyBtn);
		expect(wordFamilyBtn.getAttribute("aria-selected")).toBe("true");
	});

	it("Home active le premier onglet", async () => {
		await import("../main.js");

		const wordFamilyBtn = document.getElementById("wordFamilyBtn");
		const languagesBtn = document.getElementById("languagesBtn");
		const tablist = document.querySelector('[role="tablist"]');

		languagesBtn.focus();
		tablist.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true, cancelable: true }));

		expect(document.activeElement).toBe(wordFamilyBtn);
	});

	it("End active le dernier onglet", async () => {
		await import("../main.js");

		const wordFamilyBtn = document.getElementById("wordFamilyBtn");
		const languagesBtn = document.getElementById("languagesBtn");
		const tablist = document.querySelector('[role="tablist"]');

		wordFamilyBtn.focus();
		tablist.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true }));

		expect(document.activeElement).toBe(languagesBtn);
	});

	it("touche inconnue ne change pas l'onglet actif", async () => {
		await import("../main.js");

		const wordFamilyBtn = document.getElementById("wordFamilyBtn");
		const tablist = document.querySelector('[role="tablist"]');

		wordFamilyBtn.focus();
		tablist.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true, cancelable: true }));

		expect(wordFamilyBtn.getAttribute("aria-selected")).toBe("true");
	});

	it("cur === -1 quand aucun bouton d'onglet n'est focus — pas de crash", async () => {
		await import("../main.js");

		const tablist = document.querySelector('[role="tablist"]');
		document.getElementById("saveBtn").focus();

		expect(() => {
			tablist.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
		}).not.toThrow();
	});

	it("fetchData gere traductions et associations orphelines (branches defensives)", async () => {
		const { supabase } = await import("../SupabaseManager.js");
		supabase.functions.invoke.mockResolvedValueOnce({
			data: {
				languages: [],
				words: [],
				translations: [{ word_id: "orphan-word", language_id: "en", value: "hello" }],
				families: [],
				familyAssociations: [
					{ word_family_id: "orphan-family", word_id: "w1" },
					{ word_family_id: "orphan-family", word_id: "w1" },
				],
				publishPending: false,
			},
			error: null,
		});

		await import("../main.js");

		expect(document.getElementById("wordFamilyBtn").getAttribute("aria-selected")).toBe("true");
	});
});
