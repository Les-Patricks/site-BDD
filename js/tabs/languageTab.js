import {
	addLanguage,
	deleteLanguage,
	getAllLanguages,
	modifyLanguage,
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
		const languageId = addLanguage(value);
		if (languageId) {
			renderLanguage(languageId);
		}
	}
};

const renderLanguage = function (languageId, modificationDate = Date.now()) {
	const language = getAllLanguages()[languageId];
	if (!language) {
		return;
	}
	createLanguageItem(
		languageContent,
		language.displayName,
		new Date(modificationDate).toLocaleDateString(),
		() => {
			deleteLanguage(languageId);
		},
		(newName, done) => {
			if (modifyLanguage(languageId, newName)) {
				done();
			}
		},
	);
};

export const updateLanguages = function () {
	languageContent.textContent = "";
	Object.keys(getAllLanguages()).forEach((languageId) => {
		renderLanguage(languageId);
	});
};

bindTabAddSystem(
	addLanguageBtn,
	addLanguageLabel,
	addLanguageInput,
	submitLanguageBtn,
	submitAddingLanguage,
);
