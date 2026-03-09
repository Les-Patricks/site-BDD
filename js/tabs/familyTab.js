import { createAccordionElement } from "../components/accordion.js";
import { createDOMElement, createFamilyEditBtn } from "../dom.js";
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
	const familyElement = createAccordionElement(div, familyToRender);
	const accordion = familyElement.parentNode.parentNode;
	createFamilyEditBtn(
		accordion,
		1,
		familyToRender,
		() => {
			familyElement.classList.toggle("word--hidden");
		},
		() => {
			removeFamily(familyToRender);
			div.remove();
		},
		(value) => {
			familyToRender = value;
			familyElement.innerHTML = value;
		},
		(word) => {
			if (!wordKeys.has(word)) {
				addWord(word, () => {
					addWordToFamily(word, familyToRender, () => {
						createWordElement(word, familyElement);
					});
				});
			} else {
				addWordToFamily(word, familyToRender, () => {
					createWordElement(word, familyElement);
				});
			}
		},
	);
	wordsToRender.forEach((word) => {
		createWordElement(word, familyElement);
	});
};

export const updateFamilies = function () {
	familyContent.innerHTML = "";
	familyKeys.forEach((family) => {
		renderFamily(family, families[family]);
	});
};
