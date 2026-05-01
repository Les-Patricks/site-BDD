import { createAccordionElement } from "../components/accordion.js";
import { createDOMElement } from "../dom.js";
import {
	addFamily,
	addWord,
	addWordToFamily,
	getAllFamilies,
	getFamily,
	getIdsByDisplayName,
	getWord,
	modifyFamily,
	removeFamily,
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
		const familyId = addFamily(value);
		if (familyId) {
			renderFamily(familyId, Date.now(), []);
		}
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
	familyId,
	modificationDate,
	wordsToRender,
) {
	let currentFamilyId = familyId;
	const family = getFamily(currentFamilyId);
	if (!family) {
		return;
	}
	const div = createDOMElement(familyContent, 0, "div", "", "");
	const familyElement = createAccordionElement(
		div,
		family.displayName,
		wordsToRender.length,
		new Date(modificationDate).toLocaleDateString(),
		() => {
			removeFamily(currentFamilyId);
		},
		(newName, done) => {
			if (modifyFamily(currentFamilyId, newName)) {
				done();
			}
		},
		(value, done) => {
			let wordId = getIdsByDisplayName("words", value)[0];
			if (!wordId) {
				wordId = addWord(value);
			}
			if (getWord(wordId)) {
				addWordToFamily(wordId, currentFamilyId);
				createWordElement(wordId, content);
				done();
			} else {
				done();
			}
		},
	);
	const content = familyElement.querySelector(".accordion__content");
	wordsToRender.forEach((wordId) => {
		createWordElement(wordId, content);
	});
};

export const updateFamilies = function () {
	familyContent.textContent = "";
	Object.keys(getAllFamilies()).forEach((familyId) => {
		const family = getFamily(familyId);
		renderFamily(familyId, Date.now(), family.wordsKeys);
	});
};
