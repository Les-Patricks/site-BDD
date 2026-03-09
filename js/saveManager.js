import { traductions } from "./state.js";
import { addLanguagesInTable } from "./SupabaseManager.js";
import { addWordsInDataBase } from "./SupabaseManager.js";
import { addInTable, deleteFromTable } from "./SupabaseManager.js";
import { addWordsInFamilyInTable } from "./SupabaseManager.js";
import {
	languageKeys,
	families,
	wordToDelete,
	languageToDelete,
	familyToDelete,
	traductionToDelete,
} from "./state.js";
import { displayPublishBtn } from "./publish.js";
const saveBtn = document.getElementById("saveBtn");

saveBtn.addEventListener("click", async () => {
	const originalText = saveBtn.innerHTML;
	try {
		saveBtn.classList.add("save-btn__saving");
		saveBtn.innerHTML = "Saving...";
		const words = Object.entries(traductions).map(([word, traductions]) => {
			return {
				word,
				traductions,
			};
		});
		await addLanguagesInTable(
			Array.from(languageKeys).map((language) => [language, language]),
		);
		await addWordsInDataBase(words);
		for (const [familyKey, words] of Object.entries(families)) {
			await addInTable(
				"word_family",
				{ word_family_id: familyKey },
				"word_family_id",
			);
			await addWordsInFamilyInTable(words, familyKey);
		}
		for (const traduction of traductionToDelete) {
			await deleteFromTable("word_translation", {
				where: "eq",
				col: "word_id",
				value: traduction,
			});
		}
		traductionToDelete.length = 0;
		for (const word of wordToDelete) {
			await deleteFromTable("words", {
				where: "eq",
				col: "word_id",
				value: word,
			});
		}

		wordToDelete.length = 0;
		for (const language of languageToDelete) {
			await deleteFromTable("word_translation", {
				where: "eq",
				col: "language_id",
				value: language,
			});
			await deleteFromTable("language", {
				where: "eq",
				col: "language_id",
				value: language,
			});
		}
		languageToDelete.length = 0;
		for (const family of familyToDelete) {
			await deleteFromTable("word_family", {
				where: "eq",
				col: "word_family_id",
				value: family,
			});
		}
		familyToDelete.length = 0;

		saveBtn.classList.remove("save-btn__saving");
		saveBtn.innerHTML = originalText;
		displayPublishBtn();
	} catch (error) {
		console.error("Error saving data:", error);
		saveBtn.classList.remove("save-btn__saving");
		saveBtn.innerHTML = originalText;
	}
});
