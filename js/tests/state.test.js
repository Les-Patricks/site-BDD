import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../ui/autocomplete.js", () => ({
	addWordToAutocomplete: vi.fn(),
	removeWordFromAutocomplete: vi.fn(),
}));

vi.mock("../ui/saveBtn.js", () => ({
	displaySaveBtn: vi.fn(),
}));

import { addWordToAutocomplete } from "../ui/autocomplete.js";
import {
	addFamily,
	addLanguage,
	addTranslation,
	addWord,
	addWordToFamily,
	changeWord,
	clearStoreChanges,
	deleteLanguage,
	deleteWord,
	getAllFamilies,
	getAllLanguages,
	getAllWords,
	getTranslationsForWord,
	getWord,
	hydrateStore,
	modifyFamily,
	modifyLanguage,
	removeWordFromFamily,
	removeTranslation,
	store,
	storeChanges,
} from "../state.js";

const resetStore = () => {
	store.languages = {};
	store.words = {};
	store.families = {};
	clearStoreChanges();
};

beforeEach(() => {
	resetStore();
	vi.clearAllMocks();
});

describe("state unified api", () => {
	it("creates entities and links word to family", () => {
		const languageId = addLanguage("Francais");
		const wordId = addWord("chat");
		const familyId = addFamily("Animaux");
		addTranslation(wordId, languageId, "chat");
		addWordToFamily(wordId, familyId);

		expect(getAllLanguages()).toHaveProperty(languageId);
		expect(getAllWords()).toHaveProperty(wordId);
		expect(getAllFamilies()).toHaveProperty(familyId);
		expect(getTranslationsForWord(wordId)).toEqual({ [languageId]: "chat" });
	});

	it("rejects duplicate display names for language/word/family", () => {
		expect(addLanguage("Francais")).toBeTruthy();
		expect(addLanguage("Francais")).toBeNull();

		expect(addWord("chat")).toBeTruthy();
		expect(addWord("chat")).toBeNull();

		expect(addFamily("Animaux")).toBeTruthy();
		expect(addFamily("Animaux")).toBeNull();
	});

	it("keeps changeWord constrained by uniqueness", () => {
		const firstWordId = addWord("chat");
		const secondWordId = addWord("chien");

		expect(changeWord(secondWordId, "chat")).toBe(false);
		expect(changeWord(secondWordId, "canide")).toBe(true);
		expect(getWord(secondWordId).displayName).toBe("canide");
		expect(getWord(firstWordId).displayName).toBe("chat");
	});

	it("removes translation explicitly and cascades language deletion", () => {
		const frId = addLanguage("Francais");
		const enId = addLanguage("English");
		const wordId = addWord("chat");

		addTranslation(wordId, frId, "chat");
		addTranslation(wordId, enId, "cat");
		removeTranslation(wordId, frId);
		expect(getTranslationsForWord(wordId)).toEqual({ [enId]: "cat" });

		deleteLanguage(enId);
		expect(getTranslationsForWord(wordId)).toEqual({});
	});

	it("rejects language rename when target displayName already exists", () => {
		const frId = addLanguage("Francais");
		const enId = addLanguage("English");

		expect(modifyLanguage(enId, "Francais")).toBe(false);
		expect(store.languages[frId].displayName).toBe("Francais");
		expect(store.languages[enId].displayName).toBe("English");
	});

	it("rejects family rename when target displayName already exists", () => {
		const firstFamilyId = addFamily("Animaux");
		const secondFamilyId = addFamily("Cuisine");

		expect(modifyFamily(secondFamilyId, "Animaux")).toBe(false);
		expect(store.families[firstFamilyId].displayName).toBe("Animaux");
		expect(store.families[secondFamilyId].displayName).toBe("Cuisine");
	});

	it("cleans family links when deleting a word", () => {
		const wordId = addWord("chat");
		const familyId = addFamily("Animaux");
		addWordToFamily(wordId, familyId);

		deleteWord(wordId);
		expect(store.families[familyId].wordsKeys).toEqual([]);
	});

	it("removes a word from a family without touching others", () => {
		const wordA = addWord("chat");
		const wordB = addWord("chien");
		const familyId = addFamily("Animaux");
		addWordToFamily(wordA, familyId);
		addWordToFamily(wordB, familyId);

		removeWordFromFamily(wordA, familyId);
		expect(store.families[familyId].wordsKeys).toEqual([wordB]);
	});

	it("hydrates without dirty tracking and clears pending changes", () => {
		addLanguage("temp");
		expect(storeChanges.created.languages.size).toBe(1);

		hydrateStore({
			languages: { language_fixed: { displayName: "Francais" } },
			words: {},
			families: {},
		});

		expect(getAllLanguages()).toEqual({
			language_fixed: { displayName: "Francais" },
		});
		expect(storeChanges.created.languages.size).toBe(0);
		expect(storeChanges.modified.languages.size).toBe(0);
		expect(storeChanges.deleted.languages.size).toBe(0);
	});

	it("hydrateStore registers snapshot words for autocomplete", () => {
		hydrateStore({
			languages: {},
			words: {
				w1: { displayName: "chat", translations: {} },
				w2: { displayName: "chien", translations: {} },
			},
			families: {},
		});

		expect(addWordToAutocomplete).toHaveBeenCalledWith("chat");
		expect(addWordToAutocomplete).toHaveBeenCalledWith("chien");
		expect(addWordToAutocomplete).toHaveBeenCalledTimes(2);
	});
});
