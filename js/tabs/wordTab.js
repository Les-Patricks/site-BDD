import {
	wordKeys,
	updateTraduction,
	addWord,
	traductions,
	languageKeys,
} from "../state.js";
import { createTraductionItem } from "../dom.js";
import { createAccordionElement } from "../components/accordion.js";
import { bindTabAddSystem } from "../ui/tabAddSystem.js";
import { displaySaveBtn } from "../ui/saveBtn.js";

const wordContent = document.getElementById("wordTabPanelContent");
const addWordBtn = document.getElementById("addWordButton");
const addWordLabel = document.getElementById("addWordLabel");
const addWordInput = document.getElementById("addWordInput");
const submitWordBtn = document.getElementById("addWordSubmitBtn");

export const createWordElement = function (wordToRender, container, date = "") {
	const listObject = createAccordionElement(container, wordToRender, "", date);
	const accordionContent = listObject.querySelector(".accordion__content");
	languageKeys.forEach((language) => {
		createTraductionItem(
			accordionContent,
			language,
			traductions[wordToRender][language],
			(newValue) => {
				updateTraduction(wordToRender, language, newValue, () => {
					displaySaveBtn();
				});
			},
		);
	});
};

export const renderWord = function (wordToRender) {
	createWordElement(wordToRender, wordContent, "2023/01/01");
};

export const updateWords = function () {
	wordContent.innerHTML = "";
	wordKeys.forEach(renderWord);
};

export const submitAddingWord = function () {
	const value = addWordInput.value.trim().toLowerCase();
	if (value) {
		addWord(value, () => {
			renderWord(value);
			displaySaveBtn();
		});
	}
};

bindTabAddSystem(
	addWordBtn,
	addWordLabel,
	addWordInput,
	submitWordBtn,
	submitAddingWord,
);
