import { updateLanguages } from "./tabs/languageTab.js";
import { updateWords } from "./tabs/wordTab.js";
import { updateFamilies } from "./tabs/familyTab.js";
import { supabase } from "./SupabaseManager.js";
import { updateBtns } from "./ui/AccordionView.js";
import "./saveManager.js";
import { displayPublishBtn, hidePublishBtn } from "./publish.js";
import { notify } from "./notify.js";
import {
	hydrateStore,
} from "./state.js";
//#region DOM Setup
// Tabs buttons
const wordFamilyBtn = document.getElementById("wordFamilyBtn");
const wordBtn = document.getElementById("wordBtn");
const languagesBtn = document.getElementById("languagesBtn");

// Tabs
const wordFamilyTab = document.getElementById("wordFamilyTab");
const wordTab = document.getElementById("wordTab");
const languageTab = document.getElementById("languageTab");
const allTabs = document.querySelectorAll(".tab-panel");
const bootstrapLoadingRoot = document.getElementById("bootstrapLoadingRoot");

function hideBootstrapLoading() {
	if (!bootstrapLoadingRoot) {
		return;
	}
	bootstrapLoadingRoot.classList.add("bootstrap-loading--hidden");
	bootstrapLoadingRoot.setAttribute("aria-busy", "false");
}

//#endregion

// Fetch bootstrap data via business endpoint and update state
async function fetchData() {
	const { data, error } = await supabase.functions.invoke("admin-bootstrap");
	if (error) {
		throw error;
	}

	const languages = data?.languages ?? [];
	const words = data?.words ?? [];
	const translations = data?.translations ?? [];
	const families = data?.families ?? [];
	const associations = data?.familyAssociations ?? [];
	const publishPending = data?.publishPending ?? data?.publish_pending ?? false;

	const snapshot = {
		languages: {},
		words: {},
		families: {},
	};

	languages.forEach((languageData) => {
		const languageId = languageData.language_id;
		snapshot.languages[languageId] = {
			displayName: languageData.display_name || languageData.name || languageId,
		};
	});

	words.forEach((wordData) => {
		const wordId = wordData.word_id;
		snapshot.words[wordId] = {
			displayName: wordData.display_name || wordData.word || wordId,
			translations: {},
		};
	});

	translations.forEach((translationData) => {
		const wordId = translationData.word_id;
		const languageId = translationData.language_id;
		if (!snapshot.words[wordId]) {
			snapshot.words[wordId] = { displayName: wordId, translations: {} };
		}
		snapshot.words[wordId].translations[languageId] = translationData.value;
	});

	families.forEach((familyData) => {
		const familyId = familyData.word_family_id;
		snapshot.families[familyId] = {
			displayName: familyData.display_name || familyData.name || familyId,
			wordsKeys: [],
		};
	});

	associations.forEach((associationData) => {
		const familyId = associationData.word_family_id;
		const wordId = associationData.word_id;
		if (!snapshot.families[familyId]) {
			snapshot.families[familyId] = {
				displayName: familyId,
				wordsKeys: [],
			};
		}
		if (!snapshot.families[familyId].wordsKeys.includes(wordId)) {
			snapshot.families[familyId].wordsKeys.push(wordId);
		}
	});

	hydrateStore(snapshot);
	return publishPending;
}

let publishPending = false;
let bootstrapOk = false;
try {
	publishPending = await fetchData();
	bootstrapOk = true;
	hideBootstrapLoading();
} catch (err) {
	hideBootstrapLoading();
	const detail = err?.message ?? String(err);
	notify.error(
		`Impossible de charger les donnees.${detail ? ` (${detail})` : ""}`,
	);

	const banner = document.createElement("div");
	banner.className = "bootstrap-error-banner";
	banner.setAttribute("role", "alert");
	const p = document.createElement("p");
	p.className = "bootstrap-error-banner__text";
	p.textContent =
		"Les donnees n'ont pas pu etre chargees. Verifiez la connexion ou rechargez la page.";
	banner.appendChild(p);
	const reloadBtn = document.createElement("button");
	reloadBtn.type = "button";
	reloadBtn.className = "bootstrap-error-banner__reload";
	reloadBtn.textContent = "Recharger la page";
	reloadBtn.addEventListener("click", () => {
		globalThis.location.reload();
	});
	banner.appendChild(reloadBtn);

	const anchor = document.querySelector("h1");
	if (anchor?.insertAdjacentElement) {
		anchor.insertAdjacentElement("afterend", banner);
	} else if (document.body) {
		document.body.prepend(banner);
	}

	for (const id of [
		"wordFamilyBtn",
		"wordBtn",
		"languagesBtn",
		"saveBtn",
		"publishBtn",
		"confirmPublishBtn",
		"cancelPublishBtn",
	]) {
		const el = document.getElementById(id);
		if (el) {
			el.disabled = true;
		}
	}
	hidePublishBtn();
}

if (bootstrapOk) {
	if (publishPending) {
		displayPublishBtn();
	} else {
		hidePublishBtn();
	}
}

const allBtns = document.querySelectorAll(".tab__button");

const activateBtn = (btn) => {
	for (const button of allBtns) {
		if (button !== btn) {
			button.classList.remove("tab__button--active");
		}
	}
	btn.classList.add("tab__button--active");
};

// Main buttons
wordFamilyBtn.addEventListener("click", () => {
	activateBtn(wordFamilyBtn);
	openTab(wordFamilyTab);
	updateFamilies();
});

wordBtn.addEventListener("click", () => {
	activateBtn(wordBtn);
	openTab(wordTab);
	updateWords();
});
languagesBtn.addEventListener("click", () => {
	activateBtn(languagesBtn);
	openTab(languageTab);
	updateLanguages();
});

function openTab(currentTab) {
	currentTab.classList.add("tab-panel--open");
	allTabs.forEach((tab) => {
		if (tab !== currentTab) {
			tab.classList.remove("tab-panel--open");
		}
	});
}

if (bootstrapOk) {
	updateBtns();
	wordFamilyBtn.click();
}
