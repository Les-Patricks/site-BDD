import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../ui/autocomplete.js", () => ({
	addWordToAutocomplete: vi.fn(),
	removeWordFromAutocomplete: vi.fn(),
}));

vi.mock("../ui/saveBtn.js", () => ({
	displaySaveBtn: vi.fn(),
}));

const {
	invokeMock,
	publishDatabaseMock,
} = vi.hoisted(() => ({
	// Hoisted mocks are required because vi.mock factories are evaluated before imports.
	invokeMock: vi.fn(async () => ({ error: null })),
	publishDatabaseMock: vi.fn(async () => {}),
}));

vi.mock("../SupabaseManager.js", () => ({
	supabase: {
		functions: {
			invoke: invokeMock,
		},
	},
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
	it("delegates persistence to admin-save with business payload", async () => {
		const languageId = addLanguage("Francais");
		const wordId = addWord("chat");
		addTranslation(wordId, languageId, "chat");
		const familyId = addFamily("Animaux");
		addWordToFamily(wordId, familyId);

		await save();

		expect(invokeMock).toHaveBeenCalledWith(
			"admin-save",
			expect.objectContaining({
				body: expect.objectContaining({
					languages: expect.arrayContaining([
						expect.objectContaining({
							language_id: languageId,
							name: "Francais",
						}),
					]),
					words: expect.arrayContaining([
						expect.objectContaining({
							word: wordId,
							traductions: expect.objectContaining({ [languageId]: "chat" }),
						}),
					]),
					families: expect.arrayContaining([
						expect.objectContaining({
							word_family_id: familyId,
							words: [wordId],
						}),
					]),
					toDelete: expect.any(Object),
				}),
			}),
		);
	});

	it("sends deleted entities through toDelete payload", async () => {
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

		await save();

		expect(invokeMock).toHaveBeenCalledWith(
			"admin-save",
			expect.objectContaining({
				body: expect.objectContaining({
					toDelete: expect.objectContaining({
						languages: expect.arrayContaining(["language_existing"]),
						words: expect.arrayContaining(["word_existing"]),
						families: expect.arrayContaining(["family_existing"]),
					}),
				}),
			}),
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

		expect(invokeMock).toHaveBeenLastCalledWith(
			"admin-save",
			expect.objectContaining({
				body: expect.objectContaining({
					words: expect.arrayContaining([
						expect.objectContaining({
							word: wordId,
							traductions: expect.objectContaining({ [languageId]: "chaton" }),
						}),
					]),
				}),
			}),
		);

		removeTranslation(wordId, languageId);
		await save();

		expect(invokeMock).toHaveBeenLastCalledWith(
			"admin-save",
			expect.objectContaining({
				body: expect.objectContaining({
					toDelete: expect.objectContaining({
						traductions: expect.arrayContaining([wordId]),
					}),
				}),
			}),
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

		expect(invokeMock).toHaveBeenLastCalledWith(
			"admin-save",
			expect.objectContaining({
				body: expect.objectContaining({
					toDelete: expect.objectContaining({
						traductions: expect.arrayContaining([wordId]),
					}),
				}),
			}),
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

		expect(invokeMock).toHaveBeenLastCalledWith(
			"admin-save",
			expect.objectContaining({
				body: expect.objectContaining({
					toDelete: expect.objectContaining({
						traductions: expect.arrayContaining([wordId]),
					}),
				}),
			}),
		);
	});

	it("propagates admin-save errors", async () => {
		addLanguage("Francais");
		invokeMock.mockResolvedValueOnce({ error: new Error("save failed") });
		await expect(save()).rejects.toThrow("save failed");
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
