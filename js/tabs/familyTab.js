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
import { notify } from "../notify.js";
import { bindTabAddSystem } from "../ui/tabAddSystem.js";
import { getRowSearchLabel, refreshTabSearch } from "../ui/tabSearch.js";
import { createWordElement } from "./wordTab.js";

const addFamilyBtn = document.getElementById("addFamilyBtn");
const addFamilyLabel = document.getElementById("addFamilyLabel");
const addFamilyInput = document.getElementById("addFamilyInput");
const submitFamilyBtn = document.getElementById("addFamilySubmitBtn");
const familyContent = document.getElementById("familyTabPanelContent");
const familyOrderBtn = document.querySelector("#wordFamilyTab .tab-panel-order");

let nextFamilySortDirection = "desc";

const sortFamilyRowsByDirection = (direction) => {
	const rows = Array.from(familyContent.children);
	rows
		.sort((leftRow, rightRow) => {
			const leftLabel = getRowSearchLabel(leftRow);
			const rightLabel = getRowSearchLabel(rightRow);
			const baseOrder = leftLabel.localeCompare(rightLabel, "fr", {
				sensitivity: "base",
			});
			return direction === "asc" ? baseOrder : -baseOrder;
		})
		.forEach((row) => {
			familyContent.appendChild(row);
		});
};

const applyDefaultFamilySort = () => {
	sortFamilyRowsByDirection("asc");
	nextFamilySortDirection = "desc";
};

const toggleFamilySort = () => {
	sortFamilyRowsByDirection(nextFamilySortDirection);
	nextFamilySortDirection = nextFamilySortDirection === "asc" ? "desc" : "asc";
};

export const submitAddingFamily = function () {
	const value = addFamilyInput.value.trim().toLowerCase();
	if (value) {
		const familyId = addFamily(value);
		if (familyId) {
			renderFamily(familyId, Date.now(), []);
			notify.success("Famille ajoutee.", { durationMs: 2500 });
		} else {
			notify.warning("Une famille avec ce nom existe deja.");
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
			notify.success("Famille supprimee.", { durationMs: 2500 });
			queueMicrotask(() => {
				refreshTabSearch("wordFamilyTab");
			});
		},
		(newName, done) => {
			if (modifyFamily(currentFamilyId, newName)) {
				notify.success("Famille renommee.", { durationMs: 2500 });
				done();
				refreshTabSearch("wordFamilyTab");
			} else {
				notify.warning("Ce nom est deja utilise par une autre famille.");
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
				notify.success("Mot associe a la famille.", { durationMs: 2500 });
				done();
			} else {
				notify.warning(
					"Impossible d'ajouter ce mot : nom deja utilise ou invalide.",
				);
				done();
			}
		},
	);
	const content = familyElement.querySelector(".accordion__content");
	wordsToRender.forEach((wordId) => {
		createWordElement(wordId, content);
	});
	refreshTabSearch("wordFamilyTab");
};

export const updateFamilies = function () {
	familyContent.textContent = "";
	Object.keys(getAllFamilies()).forEach((familyId) => {
		const family = getFamily(familyId);
		renderFamily(familyId, Date.now(), family.wordsKeys);
	});
	applyDefaultFamilySort();
};

if (familyOrderBtn) {
	familyOrderBtn.addEventListener("click", () => {
		toggleFamilySort();
	});
}
