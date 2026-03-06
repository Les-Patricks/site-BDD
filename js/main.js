import { updateBtns } from "./dom.js";
import { updateLanguages } from "./tabs/languageTab.js";
import { updateWords } from "./tabs/wordTab.js";
import "./tabs/familyTab.js";
import { renderFamily, updateFamilies } from "./tabs/familyTab.js";
import {
	addInTable,
	addLanguageInTable,
	addLanguagesInTable,
	addWordsInDataBase,
	addWordsInFamilyInTable,
	deleteFromTable,
	fetchFromTable,
} from "./SupabaseManager.js";
import {
	addFamily,
	addLanguage,
	addWord,
	addWordToFamily,
	families,
	familyKeys,
	familyToDelete,
	languageKeys,
	languageToDelete,
	traductions,
	traductionToDelete,
	updateTraduction,
	wordKeys,
	wordToDelete,
} from "./state.js";
//#region DOM Setup
// Tabs buttons
const wordFamilyBtn = document.getElementById("wordFamilyBtn");
const wordBtn = document.getElementById("wordBtn");

// Tabs
const wordFamilyTab = document.getElementById("wordFamilyTab");
const wordTab = document.getElementById("wordTab");
const languageTab = document.getElementById("languageTab");
const allTabs = document.querySelectorAll(".tab-panel");

//#endregion

const saveBtn = document.getElementById("saveBtn");

saveBtn.addEventListener("click", async () => {
	const words = Object.entries(traductions).map(([word, traductions]) => {
		return {
			word,
			traductions,
		};
	});
	await addLanguagesInTable(
		Array.from(languageKeys).map((language) => [language, language]),
	);
	await addWordsInDataBase(words);
	for (const [familyKey, words] of Object.entries(families)) {
		await addInTable(
			"word_family",
			{ word_family_id: familyKey },
			"word_family_id",
		);
		await addWordsInFamilyInTable(words, familyKey);
	}
	for (const traduction of traductionToDelete) {
		await deleteFromTable("word_translation", {
			where: "eq",
			col: "word_id",
			value: traduction,
		});
	}
	traductionToDelete.length = 0;
	for (const word of wordToDelete) {
		await deleteFromTable("words", {
			where: "eq",
			col: "word_id",
			value: word,
		});
	}

	wordToDelete.length = 0;
	for (const language of languageToDelete) {
		await deleteFromTable("word_translation", {
			where: "eq",
			col: "language_id",
			value: language,
		});
		await deleteFromTable("language", {
			where: "eq",
			col: "language_id",
			value: language,
		});
	}
	languageToDelete.length = 0;
	for (const family of familyToDelete) {
		await deleteFromTable("word_family", {
			where: "eq",
			col: "word_family_id",
			value: family,
		});
	}
	familyToDelete.length = 0;
});

// Fetch data from Supabase and update the state
async function fetchData() {
	await fetchFromTable("language").then((data) => {
		data.forEach((languageData) => {
			const language = languageData.language_id;
			addLanguage(language, () => {});
		});
	});
	await fetchFromTable("words").then((data) => {
		data.forEach((wordData) => {
			const word = wordData.word_id;
			addWord(word, () => {});
		});
	});
	await fetchFromTable("word_translation").then((data) => {
		data.forEach((traductionData) => {
			const word = traductionData.word_id;
			const language = traductionData.language_id;
			const value = traductionData.value;
			updateTraduction(word, language, value);
			console.log("fetch traduction", word, language, value);
		});
	});
	await fetchFromTable("word_family").then((data) => {
		data.forEach((familyData) => {
			const family = familyData.word_family_id;
			addFamily(family, () => {});
		});
	});
	await fetchFromTable("word_family_association").then((data) => {
		data.forEach((associationData) => {
			const word = associationData.word_id;
			const family = associationData.word_family_id;
			addWordToFamily(word, family, () => {});
		});
	});
}

//#region Tab Navigation
// Main buttons
wordFamilyBtn.addEventListener("click", () => {
	openTab(wordFamilyTab);
	updateFamilies();
});

wordBtn.addEventListener("click", () => {
	openTab(wordTab);
	updateWords();
});
languagesBtn.addEventListener("click", () => {
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
//#endregion

updateBtns();

// fetch("../tests/bdd.json")
// 	.then((response) => response.json())
// 	.then((data) => {
// 		// Create a dictionnary from word list
// 		const words = {};

// 		// Create a set of languages
// 		const languages = new Set();
// 		for (let i = 0; i < data.words.length; i++) {
// 			const element = data.words[i];
// 			const languageDict = {};
// 			const wordKey = createListObject(wordContainer, element.key);
// 			element.ecritures.forEach((ecriture) => {
// 				languages.add(ecriture.lang);
// 				languageDict[ecriture.lang] = ecriture.text;
// 				createWordObject(wordKey, ecriture.text);
// 			});
// 			// console.log(languageDict);
// 			words[element.key] = languageDict;
// 		}
// 		const languageObjects = {};
// 		Array.from(languages).forEach((language) => {
// 			languageObjects[language] = createListObject(languageContainer, language);
// 		});
// 		data.families.forEach((family) => {
// 			const familyList = createListObject(familyContainer, family.key);
// 			family.wordKeys.forEach((element) => {
// 				// Convert array in dictionnary
// 				const wordList = createListObject(familyList, element);
// 				languages.forEach((language) => {
// 					const trad = words[element][language];
// 					if (trad) {
// 						createWordObject(wordList, trad);
// 						createWordObject(languageObjects[language], trad);
// 					}
// 				});
// 			});
// 		});

// 		updateBtns();

// 		const reset = function () {
// 			addWordInput.value = "";
// 			clickWord();
// 		};

// 		const validate = function (e) {
// 			const value = addWordInput.value.trim();
// 			if (value) {
// 				console.log("Mot ajouté :", value);
// 				words[value] = {};
// 				createListObject(wordContainer, value, 0);
// 				reset();
// 			}
// 		};

// 		addWordInput.addEventListener("keydown", (e) => {
// 			if (e.key === "Enter") {
// 				validate();
// 			} else if (e.key === "Escape") {
// 				reset();
// 			}
// 		});
// 		submitBtn.addEventListener("click", validate);

// 		const clickWord = function () {
// 			addWordBtn.classList.toggle("clicked");
// 			addWordLabel.classList.toggle("clicked");
// 			addWordInput.classList.toggle("clicked");
// 			submitBtn.classList.toggle("clicked");
// 		};
// 		addWordBtn.addEventListener("click", (e) => {
// 			e.stopPropagation();
// 			clickWord();
// 			addWordInput.focus();
// 			addWordInput.select();
// 		});
// 		console.log(wordObjects);
// 	});
//#endregion

fetchData();
