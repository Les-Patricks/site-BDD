import { updateLanguages } from "./tabs/languageTab.js";
import { updateWords } from "./tabs/wordTab.js";
import { updateFamilies } from "./tabs/familyTab.js";
import { fetchFromTable } from "./SupabaseManager.js";
import { updateBtns } from "./ui/AccordionView.js";
import "./saveManager.js";
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

//#endregion

// Fetch data from Supabase and update the state
async function fetchData() {
	const [languages, words, translations, families, associations] = await Promise.all([
		fetchFromTable("language"),
		fetchFromTable("words"),
		fetchFromTable("word_translation"),
		fetchFromTable("word_family"),
		fetchFromTable("word_family_association"),
	]);

	const snapshot = {
		languages: {},
		words: {},
		families: {},
	};

	languages.forEach((languageData) => {
		const languageId = languageData.language_id;
		snapshot.languages[languageId] = {
			displayName: languageData.display_name || languageId,
		};
	});

	words.forEach((wordData) => {
		const wordId = wordData.word_id;
		snapshot.words[wordId] = {
			displayName: wordData.display_name || wordId,
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
			displayName: familyData.display_name || familyId,
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
}

await fetchData();

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

updateBtns();
wordFamilyBtn.click();
