import {
	addWordToAutocomplete,
	removeWordFromAutocomplete,
} from "./ui/autocomplete.js";
import { displaySaveBtn } from "./ui/saveBtn.js";
import { addInTable, deleteFromTable } from "./SupabaseManager.js";
import { publishDatabase } from "./databaseTransfer.js";

export const store = {
	languages: {},
	words: {},
	families: {},
};

export const autocompleteWords = [];

export const storeChanges = {
	created: {
		languages: new Set(),
		words: new Set(),
		families: new Set(),
		translations: new Set(),
	},
	modified: {
		languages: new Set(),
		words: new Set(),
		families: new Set(),
		translations: new Set(),
	},
	deleted: {
		languages: new Set(),
		words: new Set(),
		families: new Set(),
		translations: new Set(),
	},
};

let shouldTrackDirty = true;

const markDirty = function () {
	if (shouldTrackDirty) {
		displaySaveBtn();
	}
};

const generateEntityId = function (prefix) {
	// Use UUIDs in production to avoid collisions across fast consecutive writes.
	if (globalThis.crypto?.randomUUID) {
		return `${prefix}_${globalThis.crypto.randomUUID()}`;
	}
	// Fallback kept for environments where crypto.randomUUID is unavailable.
	return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const createLanguageId = function () {
	return generateEntityId("language");
};

const createWordId = function () {
	return generateEntityId("word");
};

const createFamilyId = function () {
	return generateEntityId("family");
};

export const clearStoreChanges = function () {
	storeChanges.created.languages.clear();
	storeChanges.created.words.clear();
	storeChanges.created.families.clear();
	storeChanges.created.translations.clear();
	storeChanges.modified.languages.clear();
	storeChanges.modified.words.clear();
	storeChanges.modified.families.clear();
	storeChanges.modified.translations.clear();
	storeChanges.deleted.languages.clear();
	storeChanges.deleted.words.clear();
	storeChanges.deleted.families.clear();
	storeChanges.deleted.translations.clear();
};

export const getAllLanguages = function () {
	return store.languages;
};

export const getAllWords = function () {
	return store.words;
};

export const getAllFamilies = function () {
	return store.families;
};

export const getLanguage = function (languageId) {
	return store.languages[languageId];
};

export const getWord = function (wordId) {
	return store.words[wordId];
};

export const getFamily = function (familyId) {
	return store.families[familyId];
};

export const getTranslationsForWord = function (wordId) {
	return store.words[wordId]?.translations || {};
};

export const getWordsInFamily = function (familyId) {
	const family = store.families[familyId];
	if (!family) {
		return [];
	}
	return family.wordsKeys
		.map((wordId) => {
			const word = store.words[wordId];
			if (!word) {
				// Filter stale references if a word was deleted but a family still references it.
				return null;
			}
			return {
				id: wordId,
				displayName: word.displayName,
				translations: { ...word.translations },
			};
		})
		.filter(Boolean);
};

export const addLanguage = function (displayName) {
	const existingIds = getIdsByDisplayName("languages", displayName);
	if (existingIds.length > 0) {
		return null;
	}
	const newLanguageId = createLanguageId();
	store.languages[newLanguageId] = { displayName };
	storeChanges.created.languages.add(newLanguageId);
	markDirty();
	return newLanguageId;
};

export const modifyLanguage = function (languageId, newDisplayName) {
	if (store.languages[languageId]) {
		const conflictIds = getIdsByDisplayName("languages", newDisplayName).filter(
			(id) => id !== languageId,
		);
		if (conflictIds.length > 0) {
			return false;
		}
		store.languages[languageId].displayName = newDisplayName;
		storeChanges.modified.languages.add(languageId);
		markDirty();
		return true;
	}
	return false;
};

export const deleteLanguage = function (languageId) {
	if (store.languages[languageId]) {
		delete store.languages[languageId];
		if (storeChanges.created.languages.has(languageId)) {
			storeChanges.created.languages.delete(languageId);
		} else {
			storeChanges.deleted.languages.add(languageId);
		}
		for (const wordId of Object.keys(store.words)) {
			const translationKey = `${wordId}:${languageId}`;
			if (store.words[wordId].translations[languageId] !== undefined) {
				if (storeChanges.created.translations.has(translationKey)) {
					storeChanges.created.translations.delete(translationKey);
					storeChanges.modified.translations.delete(translationKey);
				} else {
					storeChanges.deleted.translations.add(translationKey);
				}
			}
			delete store.words[wordId].translations[languageId];
			storeChanges.modified.words.add(wordId);
		}
		markDirty();
	}
};

export const addWord = function (displayName) {
	const existingIds = getIdsByDisplayName("words", displayName);
	if (existingIds.length > 0) {
		return null;
	}
	const newWordId = createWordId();
	store.words[newWordId] = { displayName, translations: {} };
	storeChanges.created.words.add(newWordId);
	addWordToAutocomplete(displayName);
	markDirty();
	return newWordId;
};

export const changeWord = function (wordId, newDisplayName) {
	if (store.words[wordId]) {
		const conflictIds = getIdsByDisplayName("words", newDisplayName).filter(
			(id) => id !== wordId,
		);
		if (conflictIds.length > 0) {
			return false;
		}
		removeWordFromAutocomplete(store.words[wordId].displayName);
		store.words[wordId].displayName = newDisplayName;
		storeChanges.modified.words.add(wordId);
		addWordToAutocomplete(newDisplayName);
		markDirty();
		return true;
	}
	return false;
};

export const deleteWord = function (wordId) {
	if (store.words[wordId]) {
		const deletedDisplayName = store.words[wordId].displayName;
		const existingTranslations = { ...store.words[wordId].translations };
		for (const languageId of Object.keys(existingTranslations)) {
			const translationKey = `${wordId}:${languageId}`;
			if (storeChanges.created.translations.has(translationKey)) {
				storeChanges.created.translations.delete(translationKey);
				storeChanges.modified.translations.delete(translationKey);
			} else {
				storeChanges.deleted.translations.add(translationKey);
			}
		}
		delete store.words[wordId];
		if (storeChanges.created.words.has(wordId)) {
			storeChanges.created.words.delete(wordId);
		} else {
			storeChanges.deleted.words.add(wordId);
		}
		for (const familyId of Object.keys(store.families)) {
			store.families[familyId].wordsKeys = store.families[familyId].wordsKeys.filter(
				(id) => id !== wordId,
			);
			storeChanges.modified.families.add(familyId);
		}
		removeWordFromAutocomplete(deletedDisplayName);
		markDirty();
	}
};

export const addTranslation = function (wordId, languageId, translation) {
	if (store.words[wordId] && store.languages[languageId]) {
		const translationKey = `${wordId}:${languageId}`;
		const hadTranslation = store.words[wordId].translations[languageId] !== undefined;
		store.words[wordId].translations[languageId] = translation;
		if (!hadTranslation) {
			storeChanges.created.translations.add(translationKey);
		} else {
			storeChanges.modified.translations.add(translationKey);
		}
		storeChanges.deleted.translations.delete(translationKey);
		storeChanges.modified.words.add(wordId);
		markDirty();
	}
};

export const removeTranslation = function (wordId, languageId) {
	if (store.words[wordId] && store.languages[languageId]) {
		const translationKey = `${wordId}:${languageId}`;
		delete store.words[wordId].translations[languageId];
		if (storeChanges.created.translations.has(translationKey)) {
			storeChanges.created.translations.delete(translationKey);
			storeChanges.modified.translations.delete(translationKey);
		} else {
			storeChanges.deleted.translations.add(translationKey);
		}
		storeChanges.modified.words.add(wordId);
		markDirty();
	}
};

export const addFamily = function (displayName) {
	const existingIds = getIdsByDisplayName("families", displayName);
	if (existingIds.length > 0) {
		return null;
	}
	const familyId = createFamilyId();
	store.families[familyId] = { displayName, wordsKeys: [] };
	storeChanges.created.families.add(familyId);
	markDirty();
	return familyId;
};

export const modifyFamily = function (familyId, newDisplayName) {
	if (store.families[familyId]) {
		const conflictIds = getIdsByDisplayName("families", newDisplayName).filter(
			(id) => id !== familyId,
		);
		if (conflictIds.length > 0) {
			return false;
		}
		store.families[familyId].displayName = newDisplayName;
		storeChanges.modified.families.add(familyId);
		markDirty();
		return true;
	}
	return false;
};

export const removeFamily = function (familyId) {
	if (store.families[familyId]) {
		delete store.families[familyId];
		if (storeChanges.created.families.has(familyId)) {
			storeChanges.created.families.delete(familyId);
		} else {
			storeChanges.deleted.families.add(familyId);
		}
		markDirty();
	}
};

export const addWordToFamily = function (wordId, familyId) {
	if (store.words[wordId] && store.families[familyId]) {
		if (!store.families[familyId].wordsKeys.includes(wordId)) {
			store.families[familyId].wordsKeys.push(wordId);
			storeChanges.modified.families.add(familyId);
			markDirty();
		}
	}
};

export const removeWordFromFamily = function (wordId, familyId) {
	if (store.families[familyId]) {
		store.families[familyId].wordsKeys = store.families[
			familyId
		].wordsKeys.filter((id) => id !== wordId);
		storeChanges.modified.families.add(familyId);
		markDirty();
	}
};

export const getIdsByDisplayName = function (scope, displayName) {
	const collection = store[scope];
	if (!collection) {
		return [];
	}
	return Object.entries(collection)
		.filter(([, entity]) => entity?.displayName === displayName)
		.map(([id]) => id);
};

export const hydrateStore = function (snapshot) {
	// Hydration must not trigger "unsaved changes" UI state.
	shouldTrackDirty = false;
	store.languages = snapshot.languages || {};
	store.words = snapshot.words || {};
	store.families = snapshot.families || {};
	clearStoreChanges();
	shouldTrackDirty = true;
};

export const save = async function () {
	const modificationDate = new Date().toISOString();

	// Persist languages first so translation upserts always reference existing IDs.
	for (const [languageId, language] of Object.entries(store.languages)) {
		await addInTable(
			"language",
			{
				language_id: languageId,
				display_name: language.displayName,
				modification_date: modificationDate,
			},
			"language_id",
		);
	}

	for (const languageId of storeChanges.deleted.languages) {
		await deleteFromTable("word_translation", {
			where: "eq",
			col: "language_id",
			value: languageId,
		});
		await deleteFromTable("language", {
			where: "eq",
			col: "language_id",
			value: languageId,
		});
	}

	// Persist words metadata; translations are persisted through translation deltas.
	for (const [wordId, word] of Object.entries(store.words)) {
		await addInTable(
			"words",
			{
				word_id: wordId,
				display_name: word.displayName,
				modification_date: modificationDate,
			},
			"word_id",
		);
	}

	// Translation persistence is now delta-based and driven by storeChanges.translations.
	for (const translationKey of storeChanges.deleted.translations) {
		const [wordId, languageId] = translationKey.split(":");
		await deleteFromTable(
			"word_translation",
			{ where: "eq", col: "word_id", value: wordId },
			{ where: "eq", col: "language_id", value: languageId },
		);
	}

	const translationUpsertKeys = new Set([
		...storeChanges.created.translations,
		...storeChanges.modified.translations,
	]);

	for (const translationKey of translationUpsertKeys) {
		const [wordId, languageId] = translationKey.split(":");
		const translationValue = store.words[wordId]?.translations?.[languageId];
		if (translationValue === undefined) {
			await deleteFromTable(
				"word_translation",
				{ where: "eq", col: "word_id", value: wordId },
				{ where: "eq", col: "language_id", value: languageId },
			);
			continue;
		}
		await addInTable(
			"word_translation",
			{
				word_id: wordId,
				language_id: languageId,
				value: translationValue,
			},
			"word_id, language_id",
		);
	}

	for (const wordId of storeChanges.deleted.words) {
		await deleteFromTable("word_family_association", {
			where: "eq",
			col: "word_id",
			value: wordId,
		});
		await deleteFromTable("word_translation", {
			where: "eq",
			col: "word_id",
			value: wordId,
		});
		await deleteFromTable("words", {
			where: "eq",
			col: "word_id",
			value: wordId,
		});
	}

	// Persist families and fully sync associations.
	for (const [familyId, family] of Object.entries(store.families)) {
		await addInTable(
			"word_family",
			{
				word_family_id: familyId,
				display_name: family.displayName,
				modification_date: modificationDate,
			},
			"word_family_id",
		);

		await deleteFromTable("word_family_association", {
			where: "eq",
			col: "word_family_id",
			value: familyId,
		});

		// Full replacement avoids drift between stored links and current family.wordsKeys.
		for (const wordId of family.wordsKeys) {
			await addInTable(
				"word_family_association",
				{
					word_id: wordId,
					word_family_id: familyId,
				},
				"word_id, word_family_id",
			);
		}
	}

	for (const familyId of storeChanges.deleted.families) {
		await deleteFromTable("word_family_association", {
			where: "eq",
			col: "word_family_id",
			value: familyId,
		});
		await deleteFromTable("word_family", {
			where: "eq",
			col: "word_family_id",
			value: familyId,
		});
	}

	clearStoreChanges();
	return true;
};

export const publish = async function () {
	await publishDatabase();
	return true;
};
