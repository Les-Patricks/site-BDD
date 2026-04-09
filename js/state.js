import {
	addWordToAutocomplete,
	removeWordFromAutocomplete,
} from "./ui/autocomplete.js";
import { displaySaveBtn } from "./ui/saveBtn.js";

const triggerSaveBtnIfNeeded = function (triggerSave = true) {
	if (triggerSave) {
		displaySaveBtn();
	}
};

export const wordKeys = new Set();
export const wordModifTime = {};
export const familyKeys = new Set();
export const familyModifTime = {};
export const languageKeys = new Set();
export const languageModifTime = {};
export const traductions = {};
export const families = {};

export const autocompleteWords = [];
//Things to delete
export const wordToDelete = new Set();
export const languageToDelete = new Set();
export const familyToDelete = new Set();
export const traductionToDelete = new Set();

// Adds a new word to the wordKeys and return if it was added or not
export const addWord = function (
	wordContent,
	successEvent,
	triggerSave = true,
) {
	const added = !wordKeys.has(wordContent);
	if (added) {
		wordKeys.add(wordContent);
		wordModifTime[wordContent] = Date.now();
		traductions[wordContent] = {};
		languageKeys.forEach((language) => {
			traductions[wordContent][language] = "null";
		});
		addWordToAutocomplete(wordContent);
		successEvent();
		triggerSaveBtnIfNeeded(triggerSave);
	} else {
		alert("The key already exist");
	}
};

export const addLanguage = function (
	languageContent,
	successEvent,
	triggerSave = true,
) {
	const added = !languageKeys.has(languageContent);
	languageKeys.add(languageContent);
	languageModifTime[languageContent] = Date.now();

	if (added) {
		wordKeys.forEach((word) => {
			if (traductions[word]) {
				traductions[word][languageContent] = "null";
			} else {
				traductions[word] = {};
			}
		});
		successEvent();
		triggerSaveBtnIfNeeded(triggerSave);
	} else {
		alert("The key already exist");
	}
};

export const removeWord = function (word, triggerSave = true) {
	wordKeys.delete(word);
	wordModifTime[word] = Date.now();
	removeWordFromAutocomplete(word);
	wordToDelete.add(word);
	// Suppression de du mot dans la famille
	for (const family in families) {
		const index = families[family].indexOf(word);
		if (index !== -1) {
			families[family].splice(index, 1);
		}
	}
	traductionToDelete.add(word);
	if (traductions[word]) {
		delete traductions[word];
		triggerSaveBtnIfNeeded(triggerSave);
	}
};

export const replaceWord = function (
	wordToReplace,
	wordToReplaceBy,
	successEvent,
	triggerSave = true,
) {
	if (wordKeys.has(wordToReplace) && !wordKeys.has(wordToReplaceBy)) {
		addWord(
			wordToReplaceBy,
			() => {
				transferTraductions(wordToReplace, wordToReplaceBy);
				removeWord(wordToReplace, false);
				successEvent();
				triggerSaveBtnIfNeeded(triggerSave);
			},
			false,
		);
	} else {
		alert(
			"The word to replace does not exist or the replacement word already exists",
		);
	}
};

export const replaceLanguage = function (
	languageToReplace,
	languageToReplaceBy,
	successEvent,
	triggerSave = true,
) {
	if (
		languageToReplace !== languageToReplaceBy &&
		languageKeys.has(languageToReplace) &&
		!languageKeys.has(languageToReplaceBy)
	) {
		languageKeys.delete(languageToReplace);
		wordKeys.forEach((word) => {
			traductions[word][languageToReplaceBy] =
				traductions[word][languageToReplace];
			delete traductions[word][languageToReplace];
		});

		languageKeys.add(languageToReplaceBy);
		languageModifTime[languageToReplaceBy] = Date.now();

		successEvent();
		triggerSaveBtnIfNeeded(triggerSave);
	}
};

export const removeLanguage = function (oldLanguage, triggerSave = true) {
	if (languageKeys.has(oldLanguage)) {
		languageKeys.delete(oldLanguage);
		languageToDelete.add(oldLanguage);
		for (const word of wordKeys) {
			removeTraduction(word, oldLanguage, false);
		}
		for (const traduction in traductions) {
			delete traductions[traduction][oldLanguage];
		}
		languageModifTime[oldLanguage] = Date.now();
		triggerSaveBtnIfNeeded(triggerSave);
	}
};

export const updateTraduction = function (
	word,
	language,
	traduction,
	successEvent = () => {},
	triggerSave = true,
) {
	if (traductions[word]) {
		traductions[word][language] = traduction;
		wordModifTime[word] = Date.now();
		successEvent();
		triggerSaveBtnIfNeeded(triggerSave);
	}
};

export const removeTraduction = function (word, language, triggerSave = true) {
	if (traductions[word]) {
		traductions[word][language] = "null";
		triggerSaveBtnIfNeeded(triggerSave);
	}
};

const transferTraductions = function (fromWord, toWord) {
	Object.keys(traductions[fromWord]).forEach((language) => {
		traductions[toWord][language] = traductions[fromWord][language];
	});
};

export const addFamily = function (
	familyContent,
	successEvent,
	triggerSave = true,
) {
	const added = !familyKeys.has(familyContent);
	if (added) {
		familyKeys.add(familyContent);
		familyModifTime[familyContent] = Date.now();
		families[familyContent] = [];
		successEvent();
		triggerSaveBtnIfNeeded(triggerSave);
	} else {
		alert("The key already exist");
	}
};

export const removeFamily = function (family, triggerSave = true) {
	familyKeys.delete(family);
	familyToDelete.add(family);
	if (families[family]) {
		delete families[family];
		triggerSaveBtnIfNeeded(triggerSave);
	}
};

export const replaceFamily = function (
	familyToReplace,
	familyToReplaceBy,
	successEvent,
	triggerSave = true,
) {
	if (familyKeys.has(familyToReplace) && !familyKeys.has(familyToReplaceBy)) {
		const familyWords = families[familyToReplace];
		removeFamily(familyToReplace, false);
		addFamily(
			familyToReplaceBy,
			() => {
				families[familyToReplaceBy] = familyWords;
				successEvent();
				triggerSaveBtnIfNeeded(triggerSave);
			},
			false,
		);
	} else {
		alert(
			"The family to replace does not exist or the replacement family already exists",
		);
	}
};

export const addWordToFamily = function (
	word,
	family,
	successEvent,
	triggerSave = true,
) {
	if (families[family]) {
		if (families[family].includes(word)) {
			alert("The word is already in the family");
		} else {
			families[family].push(word);
			successEvent();
			triggerSaveBtnIfNeeded(triggerSave);
		}
	} else {
		alert("The family doesn't exist");
	}
};
