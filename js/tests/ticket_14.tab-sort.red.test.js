/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";

const invokeMock = vi.fn();

vi.mock("../SupabaseManager.js", () => ({
	supabase: { functions: { invoke: invokeMock } },
}));

let initTabSearch;
let resetTabSearchModuleStateForTests;

const accordionTemplates = `
	<datalist id="autocomplete-datalist"></datalist>
	<template id="accordion">
		<div class="accordion-item">
			<span class="row-content row">
				<span class="title-group left-group">
					<span class="expand-icon">></span>
					<span class="accordion__button"></span>
					<span class="edit-group hidden">
						<input type="text" class="edit-input" />
						<span class="validate-btn">✅</span>
					</span>
				</span>
				<span class="word-count"></span>
				<span class="creation-date right-group"></span>
			</span>
			<div class="accordion__panel">
				<div class="accordion__content"></div>
			</div>
		</div>
	</template>
	<template id="accordionAddForm">
		<span class="accordion__add-form hidden">
			<input
				type="text"
				class="accordion__input"
				list="autocomplete-datalist"
				placeholder="Ajouter un mot..."
			/>
			<span class="accordion__submit">✅</span>
		</span>
	</template>
	<div id="customContextMenuTemplate" class="hidden">
		<div class="custom-context-menu">
			<ul class="custom-context-menu__list"></ul>
		</div>
	</div>
	<template id="customContextItemTemplate">
		<li class="custom-context-menu__item">
			<button class="custom-context-menu__btn">Renommer</button>
		</li>
	</template>
	<template id="languageItemTemplate">
		<div class="language-item row">
			<span class="language-item__name"></span>
			<span class="edit-group hidden">
				<input type="text" class="edit-input" />
				<span class="validate-btn">✅</span>
			</span>
			<span class="creation-date"></span>
			<button type="button" class="accordion__add-btn hidden">+</button>
			<button type="button" class="accordion__edit-btn hidden">✏️</button>
		</div>
	</template>
`;

const baseDom = `
	${accordionTemplates}

	<div class="tab-panel" id="wordTab">
		<div class="tab-panel__search-header">
			<input class="tab-panel__search-bar" placeholder="Rechercher" />
			<button type="button" class="tab-panel__search-btn">🔍</button>
		</div>
		<div class="tab-panel__header">
			<button type="button" class="tab-panel-order">Trier par V</button>
		</div>
		<div class="tab-panel__content" id="wordTabPanelContent"></div>
	</div>

	<div class="tab-panel" id="wordFamilyTab">
		<div class="tab-panel__search-header">
			<input class="tab-panel__search-bar" placeholder="Rechercher" />
			<button type="button" class="tab-panel__search-btn">🔍</button>
		</div>
		<div class="tab-panel__header">
			<button type="button" class="tab-panel-order">Trier par V</button>
		</div>
		<div class="tab-panel__content" id="familyTabPanelContent"></div>
	</div>

	<div class="tab-panel" id="languageTab">
		<div class="tab-panel__header">
			<button type="button" class="tab-panel-order">Trier par V</button>
		</div>
		<div class="tab-panel__content" id="languageTabPanelContent"></div>
	</div>

	<!-- Required for module side-effects (bindTabAddSystem) -->
	<button type="button" id="addWordButton"></button>
	<label id="addWordLabel"></label>
	<input type="text" id="addWordInput" />
	<button type="button" id="addWordSubmitBtn"></button>

	<button type="button" id="addFamilyBtn"></button>
	<label id="addFamilyLabel"></label>
	<input type="text" id="addFamilyInput" />
	<button type="button" id="addFamilySubmitBtn"></button>
	<button type="button" id="addLanguageBtn"></button>
	<label id="addLanguageLabel"></label>
	<input type="text" id="addLanguageInput" />
	<button type="button" id="addLanguageSubmitBtn"></button>

	<!-- Required by state.js import chain (publish/save UI side-effects) -->
	<button type="button" id="saveBtn">Save</button>
	<button type="button" id="publishBtn">Publish</button>
	<div id="publishConfirmPopup"></div>
	<button type="button" id="confirmPublishBtn"></button>
	<button type="button" id="cancelPublishBtn"></button>
`;

const getAccordionButtonText = (accordionItem) => {
	const btn = accordionItem?.querySelector(
		":scope > .row-content .title-group .accordion__button",
	);
	return btn?.textContent?.trim() ?? "";
};

const getVisibleWordLabels = () => {
	const wordContent = document.getElementById("wordTabPanelContent");
	return Array.from(wordContent?.children ?? [])
		.filter((el) => el.classList?.contains("accordion-item"))
		.filter((el) => !el.classList?.contains("tab-search__item--hidden"))
		.map(getAccordionButtonText);
};

const getVisibleFamilyLabels = () => {
	const familyContent = document.getElementById("familyTabPanelContent");
	return Array.from(familyContent?.children ?? []).map((wrapper) =>
		getAccordionButtonText(wrapper),
	);
};

const getWordRowByLabel = (label) =>
	Array.from(document.querySelectorAll("#wordTabPanelContent .accordion-item")).find(
		(row) => getAccordionButtonText(row) === label,
	);

const getLanguageLabels = () =>
	Array.from(document.querySelectorAll("#languageTabPanelContent .language-item")).map(
		(row) => row.querySelector(".language-item__name")?.textContent?.trim(),
	);

describe("ticket 14 (red): tab-panel-order sorts lists", () => {
	beforeEach(async () => {
		vi.resetModules();
		vi.clearAllMocks();
		document.body.innerHTML = baseDom;

		const tabSearch = await import("../ui/tabSearch.js");
		initTabSearch = tabSearch.initTabSearch;
		resetTabSearchModuleStateForTests =
			tabSearch.resetTabSearchModuleStateForTests;
		resetTabSearchModuleStateForTests();

		const state = await import("../state.js");
		const wordTab = await import("../tabs/wordTab.js");
		const familyTab = await import("../tabs/familyTab.js");

		// Minimal seed: no languages so translation sub-items are not rendered.
		state.hydrateStore({
			languages: {},
			words: {
				w1: { displayName: "beta", translations: {} },
				w2: { displayName: "alpha", translations: {} },
				w3: { displayName: "gamma", translations: {} },
			},
			families: {
				f1: { displayName: "Family Zeta", wordsKeys: ["w1"] },
				f2: { displayName: "Family Alpha", wordsKeys: ["w2"] },
			},
		});

		wordTab.updateWords();
		familyTab.updateFamilies();

		initTabSearch();
	});

	it("CA-1401 + CA-1406: clicking Trier par V sorts A->Z then Z->A", async () => {
		const orderBtn = document.querySelector("#wordTab .tab-panel-order");
		expect(orderBtn).toBeTruthy();

		// Words are now sorted by default in ascending order at render time.
		expect(getVisibleWordLabels()).toEqual(["alpha", "beta", "gamma"]);

		orderBtn.click();
		// Tri ne doit pas declencher d'appel reseau (contrat CA-1405).
		expect(invokeMock).not.toHaveBeenCalled();
		expect(getVisibleWordLabels()).toEqual(["gamma", "beta", "alpha"]);

		orderBtn.click();
		expect(getVisibleWordLabels()).toEqual(["alpha", "beta", "gamma"]);
	});

	it("CA-1404: recherche puis tri => tri sur le sous-ensemble visible", async () => {
		const wordSearchInput = document.querySelector(
			"#wordTab .tab-panel__search-bar",
		);
		const orderBtn = document.querySelector("#wordTab .tab-panel-order");
		expect(wordSearchInput).toBeTruthy();
		expect(orderBtn).toBeTruthy();

		// Override store and re-render: [chien, chat, banane] insertion -> visible order
		// before sorting (filter 'ch') is expected to be wrong (chien then chat).
		const state = await import("../state.js");
		state.hydrateStore({
			languages: {},
			words: {
				w1: { displayName: "chat", translations: {} },
				w2: { displayName: "chien", translations: {} },
				w3: { displayName: "banane", translations: {} },
			},
			families: {},
		});

		const wordTab = await import("../tabs/wordTab.js");
		wordTab.updateWords();

		wordSearchInput.value = "ch";
		wordSearchInput.dispatchEvent(new Event("input", { bubbles: true }));

		expect(getVisibleWordLabels()).toEqual(["chat", "chien"]);

		orderBtn.click();
		expect(invokeMock).not.toHaveBeenCalled();
		expect(getVisibleWordLabels()).toEqual(["chien", "chat"]);
	});

	it("CA-1403: apres tri, ouverture accordion cible le bon item", () => {
		const orderBtn = document.querySelector("#wordTab .tab-panel-order");
		expect(orderBtn).toBeTruthy();

		const firstLabelAfterSort = getVisibleWordLabels()[0];
		expect(firstLabelAfterSort).toBe("alpha");

		const alphaRow = getWordRowByLabel("alpha");
		expect(alphaRow).toBeTruthy();
		const alphaPanel = alphaRow.querySelector(":scope > .accordion__panel");
		const alphaRowContent = alphaRow.querySelector(":scope > .row-content");

		alphaRowContent.click();
		expect(alphaPanel.classList.contains("accordion__panel--open")).toBe(true);

		const betaRow = getWordRowByLabel("beta");
		const betaPanel = betaRow.querySelector(":scope > .accordion__panel");
		expect(betaPanel.classList.contains("accordion__panel--open")).toBe(false);
	});

	it("CA-1402: tri d'un onglet ne doit pas affecter un autre onglet", async () => {
		const familyOrderBtn = document.querySelector(
			"#wordFamilyTab .tab-panel-order",
		);
		expect(familyOrderBtn).toBeTruthy();
		expect(getVisibleFamilyLabels()).toEqual(["Family Alpha", "Family Zeta"]);

		const before = getVisibleWordLabels();
		familyOrderBtn.click();
		const after = getVisibleWordLabels();

		// With no sorting wiring, order should remain unchanged.
		// After implementation, this should still hold: clicking family order
		// must not re-sort the word panel.
		expect(after).toEqual(before);
	});

	it("CA-1401 + CA-1406 (languages): tri A->Z puis Z->A", async () => {
		const state = await import("../state.js");
		const languageTab = await import("../tabs/languageTab.js");

		state.hydrateStore({
			languages: {
				l1: { displayName: "zoulou" },
				l2: { displayName: "alpha" },
				l3: { displayName: "beta" },
			},
			words: {},
			families: {},
		});
		languageTab.updateLanguages();

		const languageOrderBtn = document.querySelector(
			"#languageTab .tab-panel-order",
		);
		expect(languageOrderBtn).toBeTruthy();
		expect(getLanguageLabels()).toEqual(["alpha", "beta", "zoulou"]);

		languageOrderBtn.click();
		expect(invokeMock).not.toHaveBeenCalled();
		expect(getLanguageLabels()).toEqual(["zoulou", "beta", "alpha"]);

		languageOrderBtn.click();
		expect(getLanguageLabels()).toEqual(["alpha", "beta", "zoulou"]);
	});

	it("robustesse: tri langues ignore accents/casse avec locale fr", async () => {
		const state = await import("../state.js");
		const languageTab = await import("../tabs/languageTab.js");

		state.hydrateStore({
			languages: {
				l1: { displayName: "Éclair" },
				l2: { displayName: "avion" },
				l3: { displayName: "ecole" },
			},
			words: {},
			families: {},
		});
		languageTab.updateLanguages();

		const languageOrderBtn = document.querySelector(
			"#languageTab .tab-panel-order",
		);
		expect(languageOrderBtn).toBeTruthy();
		expect(getLanguageLabels()).toEqual(["avion", "Éclair", "ecole"]);

		languageOrderBtn.click();
		expect(getLanguageLabels()).toEqual(["ecole", "Éclair", "avion"]);
	});

	it("robustesse: absence du conteneur languageTabPanelContent ne crash pas import", async () => {
		document.getElementById("languageTabPanelContent")?.remove();
		vi.resetModules();
		await expect(import("../tabs/languageTab.js")).resolves.toBeDefined();
	});
});

