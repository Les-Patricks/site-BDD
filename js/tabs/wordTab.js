import {
	wordKeys,
	updateTraduction,
	addWord,
	traductions,
	languageKeys,
	replaceWord,
	removeWord,
	removeTraduction,
} from "../state.js";
import { createEditBtn, createDOMElement, createTextElement } from "../dom.js";
import { createAccordionElement } from "../components/accordion.js";
import { bindTabAddSystem } from "../ui/tabAddSystem.js";
import { displaySaveBtn } from "../ui/saveBtn.js";

const wordContent = document.getElementById("wordTabPanelContent");
const addWordBtn = document.getElementById("addWordButton");
const addWordLabel = document.getElementById("addWordLabel");
const addWordInput = document.getElementById("addWordInput");
const submitWordBtn = document.getElementById("addWordSubmitBtn");

export const createWordElement = function (wordToRender, container) {
	const listObject = createAccordionElement(container, wordToRender, 0);
	const accordion = listObject.parentNode.parentNode;
	const accordionBtn = accordion.querySelector(".accordion__button");
	createEditBtn(
		accordion,
		1,
		wordToRender,
		() => {
			accordionBtn.classList.toggle("accordion__button--hidden");
		},
		() => {
			removeWord(wordToRender);
			accordion.remove();
		},
		(submitValue) => {
			replaceWord(wordToRender, submitValue, () => {
				wordToRender = submitValue;
				accordionBtn.innerHTML = submitValue;
			});
			displaySaveBtn();
		},
	);
	languageKeys.forEach((language) => {
		const div = createDOMElement(listObject, 1, "div", "", "");
		const textElement = createTextElement(div, `${language} : `);
		const textValue = createTextElement(
			textElement,
			traductions[wordToRender][language],
		);
		createEditBtn(
			textElement,
			1,
			textValue.innerHTML,
			() => {
				textValue.classList.toggle("accordion__value--hidden");
			},
			() => {
				removeTraduction(wordToRender, language);
				textValue.innerHTML = traductions[wordToRender][language];
			},
			(submitValue) => {
				textValue.innerHTML = submitValue;
				updateTraduction(wordToRender, language, submitValue);
				displaySaveBtn();
			},
		);
	});
};

export const renderWord = function (wordToRender) {
	createWordElement(wordToRender, wordContent);
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
