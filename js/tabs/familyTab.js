import { createAccordionElement } from "../components/accordion.js";
import { createDOMElement } from "../dom.js";
import {
	addFamily,
	addWord,
	addWordToFamily,
	families,
	familyKeys,
	familyModifTime,
	removeFamily,
	replaceFamily,
	wordKeys,
} from "../state.js";
import { bindTabAddSystem } from "../ui/tabAddSystem.js";
import { createWordElement } from "./wordTab.js";

const addFamilyBtn = document.getElementById("addFamilyBtn");
const addFamilyLabel = document.getElementById("addFamilyLabel");
const addFamilyInput = document.getElementById("addFamilyInput");
const submitFamilyBtn = document.getElementById("addFamilySubmitBtn");
const familyContent = document.getElementById("familyTabPanelContent");

export const submitAddingFamily = function () {
	const value = addFamilyInput.value.trim().toLowerCase();
	if (value) {
		addFamily(value, () => {
			renderFamily(value, Date.now(), []);
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
export const renderFamily = function (
	familyToRender,
	modificationDate,
	wordsToRender,
) {
	let currentFamilyName = familyToRender;
	const div = createDOMElement(familyContent, 0, "div", "", "");
	const familyElement = createAccordionElement(
		div,
		currentFamilyName,
		wordsToRender.length,
		new Date(modificationDate).toLocaleDateString(),
		() => {
			removeFamily(currentFamilyName);
		},
		(newName, done) => {
			replaceFamily(currentFamilyName, newName, () => {
				currentFamilyName = newName;
				done();
			});
		},
		(value, done) => {
			const addAndRender = () => {
				addWordToFamily(value, currentFamilyName, () => {
					createWordElement(value, content);
					done();
				});
			};
			if (wordKeys.has(value)) {
				addAndRender();
			} else {
				addWord(value, addAndRender);
			}
		},
	);
	const content = familyElement.querySelector(".accordion__content");
	wordsToRender.forEach((word) => {
		createWordElement(word, content);
	});
};

export const updateFamilies = function () {
	familyContent.textContent = "";
	familyKeys.forEach((family) => {
		renderFamily(family, familyModifTime[family], families[family]);
	});
};
