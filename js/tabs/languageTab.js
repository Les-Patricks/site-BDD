import {
	languageKeys,
	addLanguage,
	replaceLanguage,
	removeLanguage,
	languageModifTime,
} from "../state.js";
import { createLanguageItem } from "../dom.js";

import { bindTabAddSystem } from "../ui/tabAddSystem.js";

const languageContent = document.getElementById("languageTabPanelContent");
const addLanguageBtn = document.getElementById("addLanguageBtn");
const addLanguageLabel = document.getElementById("addLanguageLabel");
const addLanguageInput = document.getElementById("addLanguageInput");
const submitLanguageBtn = document.getElementById("addLanguageSubmitBtn");

export const submitAddingLanguage = function () {
	const value = addLanguageInput.value.trim().toLowerCase();
	if (value) {
		addLanguage(value, () => {
			renderLanguage(value, Date.now());
		});
	}
};

const renderLanguage = function (language, modificationDate) {
	let currentName = language;
	createLanguageItem(
		languageContent,
		currentName,
		new Date(modificationDate).toLocaleDateString(),
		() => {
			removeLanguage(currentName);
		},
		(newName, done) => {
			replaceLanguage(currentName, newName, () => {
				currentName = newName;
				done();
			});
		},
	);
};

export const updateLanguages = function () {
	languageContent.textContent = "";
	languageKeys.forEach((language) => {
		renderLanguage(language, languageModifTime[language]);
	});
};

bindTabAddSystem(
	addLanguageBtn,
	addLanguageLabel,
	addLanguageInput,
	submitLanguageBtn,
	submitAddingLanguage,
);
