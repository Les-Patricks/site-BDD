import {
	languageKeys,
	addLanguage,
	replaceLanguage,
	removeLanguage,
} from "../state.js";
import { createDOMElement, createTextElement, createEditBtn } from "../dom.js";

import { bindTabAddSystem } from "../ui/tabAddSystem.js";

import { displaySaveBtn } from "../ui/saveBtn.js";

const languageContent = document.getElementById("languageTabPanelContent");
const addLanguageBtn = document.getElementById("addLanguageBtn");
const addLanguageLabel = document.getElementById("addLanguageLabel");
const addLanguageInput = document.getElementById("addLanguageInput");
const submitLanguageBtn = document.getElementById("addLanguageSubmitBtn");

export const submitAddingLanguage = function () {
	const value = addLanguageInput.value.trim().toLowerCase();
	if (value) {
		addLanguage(value, () => {
			renderLanguage(value);
			displaySaveBtn();
		});
	}
};

const renderLanguage = function (language) {
	const div = createDOMElement(languageContent, 0, "div", "", "");
	const languageElement = createTextElement(div, language);
	createEditBtn(
		div,
		1,
		language,
		() => {
			languageElement.classList.toggle("word--hidden");
		},
		() => {
			removeLanguage(language);
			div.remove();
		},
		(value) => {
			replaceLanguage(language, value, () => {
				language = value;
				languageElement.innerHTML = value;
			});
			displaySaveBtn();
		},
	);
};

export const updateLanguages = function () {
	languageContent.innerHTML = "";
	languageKeys.forEach(renderLanguage);
};

bindTabAddSystem(
	addLanguageBtn,
	addLanguageLabel,
	addLanguageInput,
	submitLanguageBtn,
	submitAddingLanguage,
);
