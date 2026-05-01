import {
	addWord,
	addTranslation,
	changeWord,
	deleteWord,
	getAllLanguages,
	getAllWords,
	getLanguage,
	getWord,
	removeTranslation,
} from "../state.js";
import { createTraductionItem } from "../dom.js";
import { createAccordionElement } from "../components/accordion.js";
import { bindTabAddSystem } from "../ui/tabAddSystem.js";

const wordContent = document.getElementById("wordTabPanelContent");
const addWordBtn = document.getElementById("addWordButton");
const addWordLabel = document.getElementById("addWordLabel");
const addWordInput = document.getElementById("addWordInput");
const submitWordBtn = document.getElementById("addWordSubmitBtn");

export const createWordElement = function (wordId, container, date = "") {
	let currentWordId = wordId;
	let currentWord = getWord(currentWordId);
	if (!currentWord) {
		return;
	}
	const listObject = createAccordionElement(
		container,
		currentWord.displayName,
		"",
		date,
		() => {
			deleteWord(currentWordId);
		},
		(newName, done) => {
			if (changeWord(currentWordId, newName)) {
				done();
			}
		},
		null,
	);
	const accordionContent = listObject.querySelector(".accordion__content");
	Object.keys(getAllLanguages()).forEach((languageId) => {
		currentWord = getWord(currentWordId);
		const language = getLanguage(languageId);
		createTraductionItem(
			accordionContent,
			language?.displayName || languageId,
			currentWord?.translations?.[languageId] ?? "",
			() => {
				removeTranslation(currentWordId, languageId);
			},
			(newValue, done) => {
				addTranslation(currentWordId, languageId, newValue);
				done();
			},
		);
	});
};

export const renderWord = function (wordId, date = "") {
	createWordElement(wordId, wordContent, date);
};

export const updateWords = function () {
	wordContent.textContent = "";
	Object.keys(getAllWords()).forEach((wordId) => {
		renderWord(wordId);
	});
};

export const submitAddingWord = function () {
	const value = addWordInput.value.trim().toLowerCase();
	if (value) {
		const wordId = addWord(value);
		if (wordId) {
			renderWord(wordId);
		}
	}
};

bindTabAddSystem(
	addWordBtn,
	addWordLabel,
	addWordInput,
	submitWordBtn,
	submitAddingWord,
);
