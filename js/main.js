import { updateBtns } from "./dom.js";
import { updateLanguages } from "./tabs/languageTab.js";
import { updateWords } from "./tabs/wordTab.js";
import "./tabs/familyTab.js";
import { updateFamilies } from "./tabs/familyTab.js";
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
