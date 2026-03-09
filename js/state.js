import {
	addWordToAutocomplete,
	removeWordFromAutocomplete,
} from "./ui/autocomplete.js";

export const wordKeys = new Set();
export const familyKeys = new Set();
export const languageKeys = new Set();
export const traductions = {};
export const families = {};

export const autocompleteWords = [];
//Things to delete
export const wordToDelete = new Set();
export const languageToDelete = new Set();
export const familyToDelete = new Set();
export const traductionToDelete = new Set();

// Adds a new word to the wordKeys and return if it was added or not
export const addWord = function (wordContent, successEvent) {
	const added = !wordKeys.has(wordContent);
	if (added) {
		wordKeys.add(wordContent);
		traductions[wordContent] = {};
		languageKeys.forEach((language) => {
			traductions[wordContent][language] = "null";
		});
		addWordToAutocomplete(wordContent);
		successEvent();
	} else {
		alert("The key already exist");
	}
};

export const addLanguage = function (languageContent, successEvent) {
	const added = !languageKeys.has(languageContent);
	languageKeys.add(languageContent);

	if (added) {
		wordKeys.forEach((word) => {
			if (traductions[word]) {
				traductions[word][languageContent] = "null";
			} else {
				traductions[word] = {};
			}
		});
		successEvent();
	} else {
		alert("The key already exist");
	}
};

export const removeWord = function (word) {
	wordKeys.delete(word);
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
	}
};

export const replaceWord = function (
	wordToReplace,
	wordToReplaceBy,
	successEvent,
) {
	if (wordKeys.has(wordToReplace) && !wordKeys.has(wordToReplaceBy)) {
		addWord(wordToReplaceBy, () => {
			transferTraductions(wordToReplace, wordToReplaceBy);
			removeWord(wordToReplace);
			successEvent();
		});
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
		successEvent();
	}
};

export const removeLanguage = function (oldLanguage) {
	if (languageKeys.has(oldLanguage)) {
		languageKeys.delete(oldLanguage);
		languageToDelete.add(oldLanguage);
		for (const word of wordKeys) {
			removeTraduction(word, oldLanguage);
		}
		for (const traduction in traductions) {
			delete traductions[traduction][oldLanguage];
		}
	}
};

export const updateTraduction = function (word, language, traduction) {
	if (traductions[word]) {
		traductions[word][language] = traduction;
	}
};

export const removeTraduction = function (word, language) {
	if (traductions[word]) {
		traductions[word][language] = "null";
	}
};

const transferTraductions = function (fromWord, toWord) {
	Object.keys(traductions[fromWord]).forEach((language) => {
		traductions[toWord][language] = traductions[fromWord][language];
	});
};

export const addFamily = function (familyContent, successEvent) {
	const added = !familyKeys.has(familyContent);
	if (added) {
		familyKeys.add(familyContent);
		families[familyContent] = [];
		successEvent();
	} else {
		alert("The key already exist");
	}
};

export const removeFamily = function (family) {
	familyKeys.delete(family);
	familyToDelete.add(family);
	if (families[family]) {
		delete families[family];
	}
};

export const addWordToFamily = function (word, family, successEvent) {
	if (families[family]) {
		if (!families[family].includes(word)) {
			families[family].push(word);
			successEvent();
		} else {
			alert("The word is already in the family");
		}
	} else {
		alert("The family doesn't exist");
	}
};
