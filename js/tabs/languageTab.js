import {
	languageKeys,
	addLanguage,
	replaceLanguage,
	removeLanguage,
} from "../state.js";
import { createLanguageItem } from "../dom.js";

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
	let currentName = language;
	createLanguageItem(
		languageContent,
		currentName,
		(newName) => {
			replaceLanguage(currentName, newName, () => {
				currentName = newName;
				displaySaveBtn();
			});
		},
		"02/02/2023",
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
