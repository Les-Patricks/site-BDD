import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../ui/autocomplete.js", () => ({
	addWordToAutocomplete: vi.fn(),
	removeWordFromAutocomplete: vi.fn(),
}));

vi.mock("../ui/saveBtn.js", () => ({
	displaySaveBtn: vi.fn(),
}));

const {
	addInTableMock,
	deleteFromTableMock,
	publishDatabaseMock,
} = vi.hoisted(() => ({
	// Hoisted mocks are required because vi.mock factories are evaluated before imports.
	addInTableMock: vi.fn(async () => {}),
	deleteFromTableMock: vi.fn(async () => {}),
	publishDatabaseMock: vi.fn(async () => {}),
}));

vi.mock("../SupabaseManager.js", () => ({
	addInTable: addInTableMock,
	deleteFromTable: deleteFromTableMock,
}));

vi.mock("../databaseTransfer.js", () => ({
	publishDatabase: publishDatabaseMock,
}));

import {
	addFamily,
	addLanguage,
	addTranslation,
	addWord,
	addWordToFamily,
	clearStoreChanges,
	deleteLanguage,
	deleteWord,
	hydrateStore,
	publish,
	removeFamily,
	removeTranslation,
	save,
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

describe("state persistence integration", () => {
	it("persists current store shape across all Supabase tables", async () => {
		const languageId = addLanguage("Francais");
		const wordId = addWord("chat");
		addTranslation(wordId, languageId, "chat");
		const familyId = addFamily("Animaux");
		addWordToFamily(wordId, familyId);

		await save(); // Integration-oriented assertion: the state module drives all table writes.

		expect(addInTableMock).toHaveBeenCalledWith(
			"language",
			expect.objectContaining({
				language_id: languageId,
				display_name: "Francais",
			}),
			"language_id",
		);
		expect(addInTableMock).toHaveBeenCalledWith(
			"words",
			expect.objectContaining({ word_id: wordId, display_name: "chat" }),
			"word_id",
		);
		expect(addInTableMock).toHaveBeenCalledWith(
			"word_translation",
			expect.objectContaining({
				word_id: wordId,
				language_id: languageId,
				value: "chat",
			}),
			"word_id, language_id",
		);
		expect(addInTableMock).toHaveBeenCalledWith(
			"word_family",
			expect.objectContaining({ word_family_id: familyId, display_name: "Animaux" }),
			"word_family_id",
		);
		expect(addInTableMock).toHaveBeenCalledWith(
			"word_family_association",
			{
				word_id: wordId,
				word_family_id: familyId,
			},
			"word_id, word_family_id",
		);
	});

	it("applies deletions for removed language/word/family entities", async () => {
		hydrateStore({
			languages: { language_existing: { displayName: "FR" } },
			words: {
				word_existing: {
					displayName: "chat",
					translations: { language_existing: "chat" },
				},
			},
			families: {
				family_existing: {
					displayName: "Animaux",
					wordsKeys: ["word_existing"],
				},
			},
		});

		deleteLanguage("language_existing");
		deleteWord("word_existing");
		removeFamily("family_existing");

		await save(); // Deletions are verified through expected table-level delete calls.

		expect(deleteFromTableMock).toHaveBeenCalledWith(
			"language",
			expect.objectContaining({ col: "language_id", value: "language_existing" }),
		);
		expect(deleteFromTableMock).toHaveBeenCalledWith(
			"words",
			expect.objectContaining({ col: "word_id", value: "word_existing" }),
		);
		expect(deleteFromTableMock).toHaveBeenCalledWith(
			"word_family",
			expect.objectContaining({ col: "word_family_id", value: "family_existing" }),
		);
	});

	it("clears change tracking after successful save", async () => {
		addLanguage("Francais");
		addWord("chat");

		await save();

		expect(storeChanges.created.languages.size).toBe(0);
		expect(storeChanges.created.words.size).toBe(0);
		expect(storeChanges.created.families.size).toBe(0);
		expect(storeChanges.modified.words.size).toBe(0);
		expect(storeChanges.deleted.words.size).toBe(0);
		expect(storeChanges.modified.translations.size).toBe(0);
		expect(storeChanges.deleted.translations.size).toBe(0);
	});

	it("persists translation changes through translation delta sets", async () => {
		const languageId = addLanguage("Francais");
		const wordId = addWord("chat");
		addTranslation(wordId, languageId, "chat");
		await save();

		addTranslation(wordId, languageId, "chaton");
		await save();

		expect(addInTableMock).toHaveBeenCalledWith(
			"word_translation",
			expect.objectContaining({
				word_id: wordId,
				language_id: languageId,
				value: "chaton",
			}),
			"word_id, language_id",
		);

		removeTranslation(wordId, languageId);
		await save();

		expect(deleteFromTableMock).toHaveBeenCalledWith(
			"word_translation",
			expect.objectContaining({ col: "word_id", value: wordId }),
			expect.objectContaining({ col: "language_id", value: languageId }),
		);
	});

	it("tracks language deletion translations in deleted translation set", async () => {
		const frenchId = addLanguage("Francais");
		const englishId = addLanguage("English");
		const wordId = addWord("chat");
		addTranslation(wordId, frenchId, "chat");
		addTranslation(wordId, englishId, "cat");
		await save();

		deleteLanguage(frenchId);
		expect(storeChanges.deleted.translations.has(`${wordId}:${frenchId}`)).toBe(true);

		await save();

		expect(deleteFromTableMock).toHaveBeenCalledWith(
			"word_translation",
			expect.objectContaining({ col: "word_id", value: wordId }),
			expect.objectContaining({ col: "language_id", value: frenchId }),
		);
	});

	it("tracks word deletion translations in deleted translation set", async () => {
		const languageId = addLanguage("Francais");
		const wordId = addWord("chat");
		addTranslation(wordId, languageId, "chat");
		await save();

		deleteWord(wordId);
		expect(storeChanges.deleted.translations.has(`${wordId}:${languageId}`)).toBe(true);

		await save();

		expect(deleteFromTableMock).toHaveBeenCalledWith(
			"word_translation",
			expect.objectContaining({ col: "word_id", value: wordId }),
			expect.objectContaining({ col: "language_id", value: languageId }),
		);
	});

	it("delegates publish() to databaseTransfer", async () => {
		await publish();
		expect(publishDatabaseMock).toHaveBeenCalledTimes(1);
	});

	it("propagates publish errors from databaseTransfer", async () => {
		publishDatabaseMock.mockRejectedValueOnce(new Error("publish failed"));
		await expect(publish()).rejects.toThrow("publish failed");
	});
});
