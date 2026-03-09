import { autocompleteWords } from "../state.js";

export const addWordToAutocomplete = function (word) {
	if (!autocompleteWords.includes(word)) {
		autocompleteWords.push(word);
	}
};

export const removeWordFromAutocomplete = function (word) {
	const index = autocompleteWords.indexOf(word);
	if (index > -1) {
		autocompleteWords.splice(index, 1);
	}
};
