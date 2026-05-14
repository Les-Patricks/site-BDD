import { beforeEach, describe, expect, it, vi } from "vitest";
import * as stateModule from "../state.js";

// UI side effects are mocked to keep these tests focused on state semantics only.
vi.mock("../ui/autocomplete.js", () => ({
	addWordToAutocomplete: vi.fn(),
	removeWordFromAutocomplete: vi.fn(),
}));

vi.mock("../ui/saveBtn.js", () => ({
	displaySaveBtn: vi.fn(),
}));

import {
	store,
	storeChanges,
	clearStoreChanges,
	addWord,
	changeWord,
	deleteWord,
	addLanguage,
	modifyLanguage,
	deleteLanguage,
	addTranslation,
	removeTranslation,
	addFamily,
	modifyFamily,
	removeFamily,
	addWordToFamily,
	removeWordFromFamily,
	getAllLanguages,
	getAllWords,
	getAllFamilies,
	getLanguage,
	getWord,
	getFamily,
	getTranslationsForWord,
	getWordsInFamily,
	save,
	publish,
} from "../state.js";

const resetStore = () => {
	store.languages = {};
	store.words = {};
	store.families = {};
	clearStoreChanges();
	storeChanges.created.translations.clear();
	storeChanges.modified.translations.clear();
	storeChanges.deleted.translations.clear();
};

beforeEach(() => {
	resetStore();
});

const getSingleIdByDisplayName = (scope, displayName) => {
	const ids = stateModule.getIdsByDisplayName(scope, displayName);
	expect(ids.length).toBe(1);
	return ids[0];
};

describe("Unified store contract", () => {
	it("exposes expected store API", () => {
		expect(addWord).toBeTypeOf("function");
		expect(changeWord).toBeTypeOf("function");
		expect(deleteWord).toBeTypeOf("function");
		expect(addLanguage).toBeTypeOf("function");
		expect(modifyLanguage).toBeTypeOf("function");
		expect(deleteLanguage).toBeTypeOf("function");
		expect(addTranslation).toBeTypeOf("function");
		expect(removeTranslation).toBeTypeOf("function");
		expect(addFamily).toBeTypeOf("function");
		expect(modifyFamily).toBeTypeOf("function");
		expect(removeFamily).toBeTypeOf("function");
		expect(addWordToFamily).toBeTypeOf("function");
		expect(removeWordFromFamily).toBeTypeOf("function");
		expect(save).toBeTypeOf("function");
		expect(publish).toBeTypeOf("function");
	});

	it("matches expected function arity from contract", () => {
		expect(addWord.length).toBe(1);
		expect(changeWord.length).toBe(2);
		expect(deleteWord.length).toBe(1);
		expect(addLanguage.length).toBe(1);
		expect(modifyLanguage.length).toBe(2);
		expect(deleteLanguage.length).toBe(1);
		expect(addTranslation.length).toBe(3);
		expect(removeTranslation.length).toBe(2);
		expect(addFamily.length).toBe(1);
		expect(modifyFamily.length).toBe(2);
		expect(removeFamily.length).toBe(1);
		expect(addWordToFamily.length).toBe(2);
		expect(removeWordFromFamily.length).toBe(2);
	});

	it("exposes helper getIdsByDisplayName for UI/test lookup needs", () => {
		expect(stateModule.getIdsByDisplayName).toBeTypeOf("function");
	});

	it("stores languages under displayName", () => {
		addLanguage("Francais");
		const languageId = getSingleIdByDisplayName("languages", "Francais");

		expect(getAllLanguages()).toHaveProperty(languageId);
		expect(getLanguage(languageId)).toEqual({ displayName: "Francais" });
	});

	it("rejects duplicate language displayName", () => {
		const firstLanguageId = addLanguage("Francais");
		const secondLanguageId = addLanguage("Francais");

		expect(firstLanguageId).toBeTruthy();
		expect(secondLanguageId).toBeNull();
		expect(stateModule.getIdsByDisplayName("languages", "Francais")).toHaveLength(1);
	});

	it("rejects duplicate word displayName", () => {
		const firstWordId = addWord("chat");
		const secondWordId = addWord("chat");

		expect(firstWordId).toBeTruthy();
		expect(secondWordId).toBeNull();
		expect(stateModule.getIdsByDisplayName("words", "chat")).toHaveLength(1);
	});

	it("creates a word and updates displayName via changeWord", () => {
		addWord("chat");
		const wordId = getSingleIdByDisplayName("words", "chat");
		changeWord(wordId, "chat domestique");

		expect(getWord(wordId)).toEqual({
			displayName: "chat domestique",
			translations: {},
		});
	});

	it("removes a deleted word from all families", () => {
		addWord("chat");
		addFamily("Animaux");
		const wordId = getSingleIdByDisplayName("words", "chat");
		const familyId = getSingleIdByDisplayName("families", "Animaux");
		addWordToFamily(wordId, familyId);

		deleteWord(wordId);

		expect(getWord(wordId)).toBeUndefined();
		expect(getFamily(familyId).wordsKeys).not.toContain(wordId);
	});
});

describe("Mini-spec edge cases", () => {
	it("returns all matching ids when displayName is duplicated", () => {
		store.words = {
			word_1: { displayName: "chat", translations: {} },
			word_2: { displayName: "chat", translations: {} },
		};

		const ids = stateModule.getIdsByDisplayName("words", "chat");
		expect(Array.isArray(ids)).toBe(true);
		expect(ids.length).toBe(2);
	});

	it("rejects duplicate family displayName", () => {
		const firstFamilyId = addFamily("Animaux");
		const secondFamilyId = addFamily("Animaux");

		expect(firstFamilyId).toBeTruthy();
		expect(secondFamilyId).toBeNull();
		expect(stateModule.getIdsByDisplayName("families", "Animaux")).toHaveLength(1);
	});

	it("does not duplicate word ids in a family", () => {
		addWord("chat");
		addFamily("Animaux");
		const wordId = getSingleIdByDisplayName("words", "chat");
		const familyId = getSingleIdByDisplayName("families", "Animaux");

		addWordToFamily(wordId, familyId);
		addWordToFamily(wordId, familyId);

		const wordsKeys = getFamily(familyId).wordsKeys;
		expect(wordsKeys.filter((id) => id === wordId)).toHaveLength(1);
	});

	it("deleting a language removes only that language translations", () => {
		addLanguage("Francais");
		const frenchId = getSingleIdByDisplayName("languages", "Francais");
		addLanguage("English");
		const englishId = getSingleIdByDisplayName("languages", "English");
		addWord("cat");
		const wordId = getSingleIdByDisplayName("words", "cat");
		addTranslation(wordId, frenchId, "chat");
		addTranslation(wordId, englishId, "cat");

		deleteLanguage(frenchId);

		expect(getTranslationsForWord(wordId)).toEqual({ [englishId]: "cat" });
		expect(getAllLanguages()).not.toHaveProperty(frenchId);
	});

	it("keeps empty-string translation until explicit removeTranslation", () => {
		addLanguage("Francais");
		addWord("chat");
		const languageId = getSingleIdByDisplayName("languages", "Francais");
		const wordId = getSingleIdByDisplayName("words", "chat");

		addTranslation(wordId, languageId, "");
		expect(getTranslationsForWord(wordId)).toHaveProperty(languageId, "");

		removeTranslation(wordId, languageId);
		expect(getTranslationsForWord(wordId)).not.toHaveProperty(languageId);
	});

	it("ignores translation updates when language or word is missing", () => {
		addLanguage("Francais");
		const languageId = getSingleIdByDisplayName("languages", "Francais");

		addTranslation("missing_word", languageId, "chat");
		expect(getAllWords()).toEqual({});

		addWord("chat");
		const wordId = getSingleIdByDisplayName("words", "chat");
		addTranslation(wordId, "missing_language", "chat");
		expect(getTranslationsForWord(wordId)).toEqual({});
	});

	it("getWordsInFamily returns related word objects, not raw ids", () => {
		addWord("chat");
		addFamily("Animaux");
		const wordId = getSingleIdByDisplayName("words", "chat");
		const familyId = getSingleIdByDisplayName("families", "Animaux");
		addWordToFamily(wordId, familyId);

		expect(getWordsInFamily(familyId)).toEqual([
			{ id: wordId, displayName: "chat", translations: {} },
		]);
	});

	it("ignores operations on missing entities without corrupting state", () => {
		expect(() => modifyLanguage("missing", "whatever")).not.toThrow();
		expect(() => changeWord("missing", "y")).not.toThrow();
		expect(() => removeWordFromFamily("missing_word", "missing_family")).not.toThrow();
		expect(getAllLanguages()).toEqual({});
		expect(getAllWords()).toEqual({});
		expect(getAllFamilies()).toEqual({});
	});
});
