import { createAccordionElement } from "../components/accordion.js";
import { createDOMElement, createEditBtn } from "../dom.js";
import {
	addFamily,
	addWord,
	addWordToFamily,
	families,
	familyKeys,
	removeFamily,
	wordKeys,
} from "../state.js";
import { bindTabAddSystem } from "../ui/tabAddSystem.js";
import { createWordElement } from "./wordTab.js";
import { displaySaveBtn } from "../ui/saveBtn.js";

const addFamilyBtn = document.getElementById("addFamilyBtn");
const addFamilyLabel = document.getElementById("addFamilyLabel");
const addFamilyInput = document.getElementById("addFamilyInput");
const submitFamilyBtn = document.getElementById("addFamilySubmitBtn");
const familyContent = document.getElementById("familyTabPanelContent");

export const submitAddingFamily = function () {
	const value = addFamilyInput.value.trim().toLowerCase();
	if (value) {
		addFamily(value, () => {
			renderFamily(value, []);
			displaySaveBtn();
		});
	}
};
bindTabAddSystem(
	addFamilyBtn,
	addFamilyLabel,
	addFamilyInput,
	submitFamilyBtn,
	submitAddingFamily,
);
export const renderFamily = function (familyToRender, wordsToRender) {
	const div = createDOMElement(familyContent, 0, "div", "", "");
	const familyElement = createAccordionElement(
		div,
		familyToRender,
		wordsToRender.length,
		"2023/01/01",
	);
	const content = familyElement.querySelector(".accordion__content");

	// createEditBtn(
	// 	accordionToggle,
	// 	familyToRender,
	// 	() => {
	// 		removeFamily(familyToRender);
	// 		div.remove();
	// 	},
	// 	(value) => {
	// 		familyToRender = value;
	// 		accordionBtn.innerHTML = value;
	// 	},
	// );
	wordsToRender.forEach((word) => {
		createWordElement(word, content);
	});
};

export const updateFamilies = function () {
	familyContent.innerHTML = "";
	familyKeys.forEach((family) => {
		renderFamily(family, families[family]);
	});
};
