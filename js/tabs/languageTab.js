import {
	addLanguage,
	deleteLanguage,
	getAllLanguages,
	modifyLanguage,
} from "../state.js";
import { notify } from "../notify.js";
import { createLanguageItem } from "../dom.js";

import { bindTabAddSystem } from "../ui/tabAddSystem.js";

const languageContent = document.getElementById("languageTabPanelContent");
const addLanguageBtn = document.getElementById("addLanguageBtn");
const addLanguageLabel = document.getElementById("addLanguageLabel");
const addLanguageInput = document.getElementById("addLanguageInput");
const submitLanguageBtn = document.getElementById("addLanguageSubmitBtn");
const languageOrderBtn = document.querySelector("#languageTab .tab-panel-order");

let nextLanguageSortDirection = "desc";

const sortLanguageRowsByDirection = (direction) => {
	const rows = Array.from(languageContent.children).filter((child) =>
		child.classList.contains("language-item"),
	);
	rows
		.sort((leftRow, rightRow) => {
			const leftLabel =
				leftRow?.querySelector(":scope > .language-item__name")?.textContent?.trim() ??
				"";
			const rightLabel =
				rightRow
					?.querySelector(":scope > .language-item__name")
					?.textContent?.trim() ?? "";
			const baseOrder = leftLabel.localeCompare(rightLabel, "fr", {
				sensitivity: "base",
			});
			return direction === "asc" ? baseOrder : -baseOrder;
		})
		.forEach((row) => {
			languageContent.appendChild(row);
		});
};

const applyDefaultLanguageSort = () => {
	sortLanguageRowsByDirection("asc");
	nextLanguageSortDirection = "desc";
};

const toggleLanguageSort = () => {
	sortLanguageRowsByDirection(nextLanguageSortDirection);
	nextLanguageSortDirection =
		nextLanguageSortDirection === "asc" ? "desc" : "asc";
};

export const submitAddingLanguage = function () {
	const value = addLanguageInput.value.trim().toLowerCase();
	if (value) {
		const languageId = addLanguage(value);
		if (languageId) {
			renderLanguage(languageId);
			notify.success("Langue ajoutee.", { durationMs: 2500 });
		} else {
			notify.warning("Une langue avec ce nom existe deja.");
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
			notify.success("Langue supprimee.", { durationMs: 2500 });
		},
		(newName, done) => {
			if (modifyLanguage(languageId, newName)) {
				notify.success("Langue renommee.", { durationMs: 2500 });
				done();
			} else {
				notify.warning("Ce nom est deja utilise par une autre langue.");
			}
		},
	);
};

export const updateLanguages = function () {
	languageContent.textContent = "";
	Object.keys(getAllLanguages()).forEach((languageId) => {
		renderLanguage(languageId);
	});
	applyDefaultLanguageSort();
};

bindTabAddSystem(
	addLanguageBtn,
	addLanguageLabel,
	addLanguageInput,
	submitLanguageBtn,
	submitAddingLanguage,
);

if (languageOrderBtn) {
	languageOrderBtn.addEventListener("click", () => {
		toggleLanguageSort();
	});
}
