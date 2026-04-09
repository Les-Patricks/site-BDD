import {
	wordKeys,
	updateTraduction,
	addWord,
	removeWord,
	replaceWord,
	traductions,
	languageKeys,
	removeTraduction,
	wordModifTime,
} from "../state.js";
import { createTraductionItem } from "../dom.js";
import { createAccordionElement } from "../components/accordion.js";
import { bindTabAddSystem } from "../ui/tabAddSystem.js";

const wordContent = document.getElementById("wordTabPanelContent");
const addWordBtn = document.getElementById("addWordButton");
const addWordLabel = document.getElementById("addWordLabel");
const addWordInput = document.getElementById("addWordInput");
const submitWordBtn = document.getElementById("addWordSubmitBtn");

export const createWordElement = function (wordToRender, container, date = "") {
	let currentWordName = wordToRender;
	const listObject = createAccordionElement(
		container,
		currentWordName,
		"",
		date,
		() => {
			removeWord(currentWordName);
		},
		(newName, done) => {
			replaceWord(currentWordName, newName, () => {
				currentWordName = newName;
				done();
			});
		},
		null, // Un mot n'a pas l'option "Ajouter un mot" à l'intérieur
	);
	const accordionContent = listObject.querySelector(".accordion__content");
	languageKeys.forEach((language) => {
		createTraductionItem(
			accordionContent,
			language,
			traductions[currentWordName][language],
			() => {
				removeTraduction(currentWordName, language);
			},
			(newValue, done) => {
				updateTraduction(currentWordName, language, newValue, () => {
					done();
				});
			},
		);
	});
};

export const renderWord = function (wordToRender, date) {
	createWordElement(wordToRender, wordContent, date);
};

export const updateWords = function () {
	wordContent.textContent = "";
	wordKeys.forEach((word) => {
		const date = new Date(wordModifTime[word]);
		renderWord(word, date.toLocaleDateString());
	});
};

export const submitAddingWord = function () {
	const value = addWordInput.value.trim().toLowerCase();
	if (value) {
		addWord(value, () => {
			const date = new Date(wordModifTime[value]);
			renderWord(value, date.toLocaleDateString());
		});
	}
};

bindTabAddSystem(
	addWordBtn,
	addWordLabel,
	addWordInput,
	submitWordBtn,
	submitAddingWord,
);
