import { updateLanguages } from "./tabs/languageTab.js";
import { updateWords } from "./tabs/wordTab.js";
import { updateFamilies } from "./tabs/familyTab.js";
import { fetchFromTable } from "./SupabaseManager.js";
import { updateBtns } from "./ui/AccordionView.js";
import "./saveManager.js";
import {
	addFamily,
	addLanguage,
	addWord,
	addWordToFamily,
	updateTraduction,
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
	await fetchFromTable("language").then((data) => {
		data.forEach((languageData) => {
			const language = languageData.language_id;
			addLanguage(language, () => {}, false);
		});
	});
	await fetchFromTable("words").then((data) => {
		data.forEach((wordData) => {
			const word = wordData.word_id;
			addWord(word, () => {}, false);
		});
	});
	await fetchFromTable("word_translation").then((data) => {
		data.forEach((traductionData) => {
			const word = traductionData.word_id;
			const language = traductionData.language_id;
			const value = traductionData.value;
			updateTraduction(word, language, value, () => {}, false);
		});
	});
	await fetchFromTable("word_family").then((data) => {
		data.forEach((familyData) => {
			const family = familyData.word_family_id;
			addFamily(family, () => {}, false);
		});
	});
	await fetchFromTable("word_family_association").then((data) => {
		data.forEach((associationData) => {
			const word = associationData.word_id;
			const family = associationData.word_family_id;
			addWordToFamily(word, family, () => {}, false);
		});
	});
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
