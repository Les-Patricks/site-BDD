import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ────────────────────────────────────────────────

vi.mock("../ui/autocomplete.js", () => ({
	addWordToAutocomplete: vi.fn(),
	removeWordFromAutocomplete: vi.fn(),
}));

vi.mock("../ui/saveBtn.js", () => ({
	displaySaveBtn: vi.fn(),
}));

// `alert` n'existe pas dans Node.js — on le stubber globalement
vi.stubGlobal("alert", vi.fn());

import {
	wordKeys,
	familyKeys,
	languageKeys,
	traductions,
	families,
	autocompleteWords,
	wordToDelete,
	languageToDelete,
	familyToDelete,
	traductionToDelete,
	addWord,
	addLanguage,
	removeWord,
	replaceWord,
	replaceLanguage,
	removeLanguage,
	updateTraduction,
	removeTraduction,
	addFamily,
	removeFamily,
	addWordToFamily,
} from "../state.js";

import {
	addWordToAutocomplete,
	removeWordFromAutocomplete,
} from "../ui/autocomplete.js";

// ─── Reset state before each test ────────────────────────

beforeEach(() => {
	wordKeys.clear();
	familyKeys.clear();
	languageKeys.clear();

	for (const k in traductions) delete traductions[k];
	for (const k in families) delete families[k];

	wordToDelete.clear();
	languageToDelete.clear();
	familyToDelete.clear();
	traductionToDelete.clear();
	autocompleteWords.length = 0;

	vi.clearAllMocks();
	vi.mocked(alert).mockClear();
});

// ─── addWord ──────────────────────────────────────────────

describe("addWord", () => {
	it("ajoute un nouveau mot dans wordKeys", () => {
		addWord("chat", vi.fn());
		expect(wordKeys.has("chat")).toBe(true);
	});

	it("appelle successEvent quand le mot est nouveau", () => {
		const cb = vi.fn();
		addWord("chat", cb);
		expect(cb).toHaveBeenCalledOnce();
	});

	it("n'appelle pas successEvent si le mot existe déjà", () => {
		const cb = vi.fn();
		addWord("chat", vi.fn());
		addWord("chat", cb);
		expect(cb).not.toHaveBeenCalled();
	});

	it("appelle alert si le mot existe déjà", () => {
		addWord("chat", vi.fn());
		addWord("chat", vi.fn());
		expect(alert).toHaveBeenCalledOnce();
	});

	it("initialise une entrée de traduction pour chaque langue existante", () => {
		languageKeys.add("fr");
		languageKeys.add("en");
		addWord("chat", vi.fn());
		expect(traductions["chat"]).toEqual({ fr: "null", en: "null" });
	});

	it("crée un objet traduction vide si aucune langue existe", () => {
		addWord("chat", vi.fn());
		expect(traductions["chat"]).toEqual({});
	});

	it("appelle addWordToAutocomplete avec le bon mot", () => {
		addWord("chat", vi.fn());
		expect(addWordToAutocomplete).toHaveBeenCalledWith("chat");
	});
});

// ─── addLanguage ──────────────────────────────────────────

describe("addLanguage", () => {
	it("ajoute une nouvelle langue dans languageKeys", () => {
		addLanguage("fr", vi.fn());
		expect(languageKeys.has("fr")).toBe(true);
	});

	it("appelle successEvent quand la langue est nouvelle", () => {
		const cb = vi.fn();
		addLanguage("fr", cb);
		expect(cb).toHaveBeenCalledOnce();
	});

	it("n'appelle pas successEvent si la langue existe déjà", () => {
		const cb = vi.fn();
		addLanguage("fr", vi.fn());
		addLanguage("fr", cb);
		expect(cb).not.toHaveBeenCalled();
	});

	it("appelle alert si la langue existe déjà", () => {
		addLanguage("fr", vi.fn());
		addLanguage("fr", vi.fn());
		expect(alert).toHaveBeenCalledOnce();
	});

	it('ajoute une entrée "null" pour chaque mot existant', () => {
		addWord("chat", vi.fn());
		addWord("chien", vi.fn());
		addLanguage("fr", vi.fn());
		expect(traductions["chat"]["fr"]).toBe("null");
		expect(traductions["chien"]["fr"]).toBe("null");
	});

	it("ne touche pas aux mots existants lors de l'ajout d'une langue", () => {
		addWord("chat", vi.fn());
		addLanguage("fr", vi.fn());
		addLanguage("en", vi.fn());
		expect(traductions["chat"]).toHaveProperty("fr");
		expect(traductions["chat"]).toHaveProperty("en");
	});
});

// ─── removeWord ───────────────────────────────────────────

describe("removeWord", () => {
	it("supprime le mot des wordKeys", () => {
		addWord("chat", vi.fn());
		removeWord("chat");
		expect(wordKeys.has("chat")).toBe(false);
	});

	it("supprime le mot des traductions", () => {
		addWord("chat", vi.fn());
		removeWord("chat");
		expect(traductions["chat"]).toBeUndefined();
	});

	it("ajoute le mot dans wordToDelete", () => {
		addWord("chat", vi.fn());
		removeWord("chat");
		expect(wordToDelete.has("chat")).toBe(true);
	});

	it("ajoute le mot dans traductionToDelete", () => {
		addWord("chat", vi.fn());
		removeWord("chat");
		expect(traductionToDelete.has("chat")).toBe(true);
	});

	it("retire le mot de toutes les familles", () => {
		addWord("chat", vi.fn());
		addFamily("animaux", vi.fn());
		addWordToFamily("chat", "animaux", vi.fn());
		removeWord("chat");
		expect(families["animaux"]).not.toContain("chat");
	});

	it("appelle removeWordFromAutocomplete", () => {
		addWord("chat", vi.fn());
		removeWord("chat");
		expect(removeWordFromAutocomplete).toHaveBeenCalledWith("chat");
	});
});

// ─── replaceWord ──────────────────────────────────────────

describe("replaceWord", () => {
	it("ajoute le nouveau mot et supprime l'ancien", () => {
		addLanguage("fr", vi.fn());
		addWord("chat", vi.fn());
		updateTraduction("chat", "fr", "cat");
		replaceWord("chat", "chaton", vi.fn());
		expect(wordKeys.has("chaton")).toBe(true);
		expect(wordKeys.has("chat")).toBe(false);
	});

	it("transfère les traductions de l'ancien mot vers le nouveau", () => {
		addLanguage("fr", vi.fn());
		addWord("chat", vi.fn());
		updateTraduction("chat", "fr", "cat");
		replaceWord("chat", "chaton", vi.fn());
		expect(traductions["chaton"]["fr"]).toBe("cat");
	});

	it("appelle successEvent", () => {
		addWord("chat", vi.fn());
		const cb = vi.fn();
		replaceWord("chat", "chaton", cb);
		expect(cb).toHaveBeenCalledOnce();
	});

	it("n'appelle pas successEvent si le nouveau mot existe déjà", () => {
		addWord("chat", vi.fn());
		addWord("chaton", vi.fn());
		const cb = vi.fn();
		replaceWord("chat", "chaton", cb);
		expect(cb).not.toHaveBeenCalled();
	});
});

// ─── replaceLanguage ──────────────────────────────────────

describe("replaceLanguage", () => {
	it("supprime l'ancienne langue et ajoute la nouvelle", () => {
		addLanguage("fr", vi.fn());
		replaceLanguage("fr", "français", vi.fn());
		expect(languageKeys.has("fr")).toBe(false);
		expect(languageKeys.has("français")).toBe(true);
	});

	it("transfère les traductions vers la nouvelle langue", () => {
		addWord("chat", vi.fn());
		addLanguage("fr", vi.fn());
		updateTraduction("chat", "fr", "cat");
		replaceLanguage("fr", "français", vi.fn());
		expect(traductions["chat"]["français"]).toBe("cat");
		expect(traductions["chat"]["fr"]).toBeUndefined();
	});

	it("appelle successEvent", () => {
		addLanguage("fr", vi.fn());
		const cb = vi.fn();
		replaceLanguage("fr", "français", cb);
		expect(cb).toHaveBeenCalledOnce();
	});
});

// ─── removeLanguage ───────────────────────────────────────

describe("removeLanguage", () => {
	it("supprime la langue des languageKeys", () => {
		addLanguage("fr", vi.fn());
		removeLanguage("fr");
		expect(languageKeys.has("fr")).toBe(false);
	});

	it("ajoute la langue dans languageToDelete", () => {
		addLanguage("fr", vi.fn());
		removeLanguage("fr");
		expect(languageToDelete.has("fr")).toBe(true);
	});

	it("supprime la clé de langue dans les traductions de chaque mot", () => {
		addWord("chat", vi.fn());
		addLanguage("fr", vi.fn());
		removeLanguage("fr");
		expect(traductions["chat"]).not.toHaveProperty("fr");
	});
});

// ─── updateTraduction ─────────────────────────────────────

describe("updateTraduction", () => {
	it("met à jour la traduction d'un mot existant", () => {
		addWord("chat", vi.fn());
		addLanguage("fr", vi.fn());
		updateTraduction("chat", "fr", "cat");
		expect(traductions["chat"]["fr"]).toBe("cat");
	});

	it("ne plante pas si le mot n'existe pas dans les traductions", () => {
		expect(() => updateTraduction("inconnu", "fr", "unknown")).not.toThrow();
	});

	it("écrase une traduction existante", () => {
		addWord("chat", vi.fn());
		addLanguage("fr", vi.fn());
		updateTraduction("chat", "fr", "first");
		updateTraduction("chat", "fr", "second");
		expect(traductions["chat"]["fr"]).toBe("second");
	});
});

// ─── removeTraduction ─────────────────────────────────────

describe("removeTraduction", () => {
	it('remet la traduction à "null"', () => {
		addWord("chat", vi.fn());
		addLanguage("fr", vi.fn());
		updateTraduction("chat", "fr", "cat");
		removeTraduction("chat", "fr");
		expect(traductions["chat"]["fr"]).toBe("null");
	});
});

// ─── addFamily ────────────────────────────────────────────

describe("addFamily", () => {
	it("ajoute une nouveau famille dans familyKeys", () => {
		addFamily("animaux", vi.fn());
		expect(familyKeys.has("animaux")).toBe(true);
	});

	it("crée un tableau vide pour la famille", () => {
		addFamily("animaux", vi.fn());
		expect(families["animaux"]).toEqual([]);
	});

	it("appelle successEvent quand la famille est nouvelle", () => {
		const cb = vi.fn();
		addFamily("animaux", cb);
		expect(cb).toHaveBeenCalledOnce();
	});

	it("n'appelle pas successEvent si la famille existe déjà", () => {
		const cb = vi.fn();
		addFamily("animaux", vi.fn());
		addFamily("animaux", cb);
		expect(cb).not.toHaveBeenCalled();
	});

	it("appelle alert si la famille existe déjà", () => {
		addFamily("animaux", vi.fn());
		addFamily("animaux", vi.fn());
		expect(alert).toHaveBeenCalledOnce();
	});
});

// ─── removeFamily ─────────────────────────────────────────

describe("removeFamily", () => {
	it("supprime la famille des familyKeys", () => {
		addFamily("animaux", vi.fn());
		removeFamily("animaux");
		expect(familyKeys.has("animaux")).toBe(false);
	});

	it("ajoute la famille dans familyToDelete", () => {
		addFamily("animaux", vi.fn());
		removeFamily("animaux");
		expect(familyToDelete.has("animaux")).toBe(true);
	});

	it("supprime la famille de l'objet families", () => {
		addFamily("animaux", vi.fn());
		removeFamily("animaux");
		expect(families["animaux"]).toBeUndefined();
	});
});

// ─── addWordToFamily ──────────────────────────────────────

describe("addWordToFamily", () => {
	it("ajoute un mot dans la famille", () => {
		addWord("chat", vi.fn());
		addFamily("animaux", vi.fn());
		addWordToFamily("chat", "animaux", vi.fn());
		expect(families["animaux"]).toContain("chat");
	});

	it("appelle successEvent quand le mot est ajouté", () => {
		addWord("chat", vi.fn());
		addFamily("animaux", vi.fn());
		const cb = vi.fn();
		addWordToFamily("chat", "animaux", cb);
		expect(cb).toHaveBeenCalledOnce();
	});

	it("n'ajoute pas un mot déjà présent dans la famille", () => {
		addWord("chat", vi.fn());
		addFamily("animaux", vi.fn());
		addWordToFamily("chat", "animaux", vi.fn());
		addWordToFamily("chat", "animaux", vi.fn());
		expect(families["animaux"].filter((w) => w === "chat")).toHaveLength(1);
	});

	it("appelle alert si le mot est déjà dans la famille", () => {
		addWord("chat", vi.fn());
		addFamily("animaux", vi.fn());
		addWordToFamily("chat", "animaux", vi.fn());
		addWordToFamily("chat", "animaux", vi.fn());
		expect(alert).toHaveBeenCalledOnce();
	});

	it("appelle alert si la famille n'existe pas", () => {
		addWord("chat", vi.fn());
		addWordToFamily("chat", "inexistante", vi.fn());
		expect(alert).toHaveBeenCalledOnce();
	});

	it("n'appelle pas successEvent si la famille n'existe pas", () => {
		const cb = vi.fn();
		addWordToFamily("chat", "inexistante", cb);
		expect(cb).not.toHaveBeenCalled();
	});
});

// ═══════════════════════════════════════════════════════════
// ─── Cas limites & Edge Cases ────────────────────────────
// ═══════════════════════════════════════════════════════════

// ─── addWord — cas limites ────────────────────────────────

describe("addWord — cas limites", () => {
	it("accepte une chaîne vide '' comme clé de mot", () => {
		const cb = vi.fn();
		addWord("", cb);
		expect(cb).toHaveBeenCalledOnce();
		expect(wordKeys.has("")).toBe(true);
	});

	it("distingue la casse — 'chat' et 'Chat' sont deux mots distincts", () => {
		addWord("chat", vi.fn());
		addWord("Chat", vi.fn());
		expect(wordKeys.size).toBe(2);
	});

	it("accepte les caractères Unicode", () => {
		const cb = vi.fn();
		addWord("日本語", cb);
		expect(cb).toHaveBeenCalledOnce();
		expect(wordKeys.has("日本語")).toBe(true);
	});

	it("accepte des caractères spéciaux dans la clé", () => {
		const cb = vi.fn();
		addWord("mot-composé (1/2)", cb);
		expect(cb).toHaveBeenCalledOnce();
		expect(wordKeys.has("mot-composé (1/2)")).toBe(true);
	});

	it("une tentative d'ajout en doublon ne réinitialise pas les traductions existantes", () => {
		addLanguage("fr", vi.fn());
		addWord("chat", vi.fn());
		updateTraduction("chat", "fr", "cat");
		addWord("chat", vi.fn()); // doublon → ignoré
		expect(traductions["chat"]["fr"]).toBe("cat");
	});

	it("utiliser '__proto__' comme clé de mot n'altère pas Object.prototype", () => {
		addWord("__proto__", vi.fn());
		expect(wordKeys.has("__proto__")).toBe(true);
		expect(Object.prototype.toString).toBeTypeOf("function");
	});

	it("utiliser 'constructor' comme clé de mot ne plante pas", () => {
		const cb = vi.fn();
		addWord("constructor", cb);
		expect(cb).toHaveBeenCalledOnce();
		expect(wordKeys.has("constructor")).toBe(true);
	});
});

// ─── addLanguage — cas limites ────────────────────────────

describe("addLanguage — cas limites", () => {
	it("accepte une chaîne vide '' comme clé de langue", () => {
		const cb = vi.fn();
		addLanguage("", cb);
		expect(cb).toHaveBeenCalledOnce();
		expect(languageKeys.has("")).toBe(true);
	});

	it("utiliser '__proto__' comme langue n'altère pas Object.prototype", () => {
		addLanguage("__proto__", vi.fn());
		expect(languageKeys.has("__proto__")).toBe(true);
		expect(Object.prototype.toString).toBeTypeOf("function");
	});
});

// ─── removeWord — cas limites ─────────────────────────────

describe("removeWord — cas limites", () => {
	it("ne plante pas si le mot n'a jamais été ajouté dans wordKeys", () => {
		expect(() => removeWord("fantome")).not.toThrow();
	});

	it("supprimer deux fois le même mot ne l'ajoute qu'une fois dans wordToDelete", () => {
		// Set garantit l'unicité — pas de double DELETE en base de données
		addWord("chat", vi.fn());
		removeWord("chat");
		removeWord("chat");
		expect(wordToDelete.has("chat")).toBe(true);
		expect(wordToDelete.size).toBe(1);
	});

	it("supprimer deux fois le même mot ne l'ajoute qu'une fois dans traductionToDelete", () => {
		addWord("chat", vi.fn());
		removeWord("chat");
		removeWord("chat");
		expect(traductionToDelete.has("chat")).toBe(true);
		expect(traductionToDelete.size).toBe(1);
	});
});

// ─── replaceWord — cas limites ────────────────────────────

describe("replaceWord — cas limites", () => {
	it("remplacer un mot par lui-même laisse wordKeys intact", () => {
		addWord("chat", vi.fn());
		replaceWord("chat", "chat", vi.fn());
		// 'chat' existe déjà → addWord échoue → le mot reste
		expect(wordKeys.has("chat")).toBe(true);
	});

	it("remplacer un mot inexistant ne plante pas", () => {
		// 'fantome' absent de traductions → transferTraductions crashe sur Object.keys(undefined)
		expect(() => replaceWord("fantome", "nouveau", vi.fn())).not.toThrow();
	});
});

// ─── replaceLanguage — cas limites ────────────────────────

describe("replaceLanguage — cas limites", () => {
	it("remplacer une langue par elle-même préserve les traductions", () => {
		// 'fr' → 'fr' : delete traductions[word]['fr'] est exécuté entre les deux
		// affectations → les traductions sont perdues
		addWord("chat", vi.fn());
		addLanguage("fr", vi.fn());
		updateTraduction("chat", "fr", "cat");
		replaceLanguage("fr", "fr", vi.fn());
		expect(traductions["chat"]["fr"]).toBe("cat");
	});

	it("remplacer une langue inexistante ne plante pas", () => {
		addWord("chat", vi.fn());
		addLanguage("fr", vi.fn());
		// 'de' n'a jamais été ajouté
		expect(() => replaceLanguage("de", "allemand", vi.fn())).not.toThrow();
	});

	it("remplacer une langue inexistante ne modifie pas les traductions", () => {
		addWord("chat", vi.fn());
		addLanguage("fr", vi.fn());
		replaceLanguage("de", "allemand", vi.fn()); // 'de' n'existe pas → rien ne se passe
		expect(traductions["chat"]).not.toHaveProperty("allemand");
		expect(traductions["chat"]).toHaveProperty("fr"); // 'fr' intact
	});
});

// ─── removeLanguage — cas limites ─────────────────────────

describe("removeLanguage — cas limites", () => {
	it("ne plante pas si la langue n'a jamais été ajoutée", () => {
		expect(() => removeLanguage("inexistante")).not.toThrow();
	});

	it("supprimer une langue inexistante ne l'ajoute pas dans languageToDelete", () => {
		// Pollue le set → risque d'un DELETE inutile en base de données
		removeLanguage("fantome");
		expect(languageToDelete.has("fantome")).toBe(false);
	});
});

// ─── removeTraduction — cas limites ───────────────────────

describe("removeTraduction — cas limites", () => {
	it("ne plante pas si le mot n'existe pas dans traductions", () => {
		// 'fantome' absent → traductions['fantome'] est undefined
		// → traductions['fantome']['fr'] = 'null' lève un TypeError
		expect(() => removeTraduction("fantome", "fr")).not.toThrow();
	});
});

// ─── addWordToFamily — cas limites ────────────────────────

describe("addWordToFamily — cas limites", () => {
	it("permet d'ajouter un mot non présent dans wordKeys à une famille", () => {
		// Aucune validation que le mot existe dans wordKeys
		addFamily("animaux", vi.fn());
		const cb = vi.fn();
		addWordToFamily("mot_jamais_enregistre", "animaux", cb);
		expect(cb).toHaveBeenCalledOnce();
		expect(families["animaux"]).toContain("mot_jamais_enregistre");
	});

	it("un mot ajouté via addWordToFamily sans passer par addWord est retiré par removeWord", () => {
		// removeWord itère sur families peu importe si le mot était dans wordKeys
		addFamily("animaux", vi.fn());
		addWordToFamily("intrus", "animaux", vi.fn());
		removeWord("intrus");
		expect(families["animaux"]).not.toContain("intrus");
	});
});

// ─── removeFamily — cas limites ───────────────────────────

describe("removeFamily — cas limites", () => {
	it("ne plante pas si la famille n'a jamais été ajoutée", () => {
		expect(() => removeFamily("inexistante")).not.toThrow();
	});

	it("supprimer deux fois la même famille ne l'ajoute qu'une fois dans familyToDelete", () => {
		// Set garantit l'unicité — pas de double DELETE en base de données
		addFamily("animaux", vi.fn());
		removeFamily("animaux");
		removeFamily("animaux");
		expect(familyToDelete.has("animaux")).toBe(true);
		expect(familyToDelete.size).toBe(1);
	});
});

// ─── updateTraduction — cas limites ───────────────────────

describe("updateTraduction — cas limites", () => {
	it("accepte null (vrai null, pas la chaîne 'null') comme valeur", () => {
		addWord("chat", vi.fn());
		addLanguage("fr", vi.fn());
		updateTraduction("chat", "fr", null);
		expect(traductions["chat"]["fr"]).toBeNull();
	});

	it("accepte une chaîne vide comme valeur de traduction", () => {
		addWord("chat", vi.fn());
		addLanguage("fr", vi.fn());
		updateTraduction("chat", "fr", "");
		expect(traductions["chat"]["fr"]).toBe("");
	});

	it("crée la clé de langue même si elle n'a jamais été ajoutée via addLanguage", () => {
		// Permet de bypasser addLanguage → state potentiellement incohérent
		addWord("chat", vi.fn());
		updateTraduction("chat", "de", "Katze");
		expect(traductions["chat"]["de"]).toBe("Katze");
		expect(languageKeys.has("de")).toBe(false); // 'de' absent de languageKeys !
	});
});

// ─── Cohérence globale — scénarios complexes ──────────────

describe("cohérence globale — scénarios complexes", () => {
	it("réajouter un mot supprimé repart de zéro sans ghost traductions", () => {
		addLanguage("fr", vi.fn());
		addWord("chat", vi.fn());
		updateTraduction("chat", "fr", "cat");
		removeWord("chat");
		addWord("chat", vi.fn()); // re-ajout
		expect(traductions["chat"]["fr"]).toBe("null"); // repart à 'null', pas 'cat'
	});

	it("ajouter un mot à plusieurs familles puis removeWord le retire de toutes", () => {
		addWord("chat", vi.fn());
		addFamily("animaux", vi.fn());
		addFamily("félins", vi.fn());
		addWordToFamily("chat", "animaux", vi.fn());
		addWordToFamily("chat", "félins", vi.fn());
		removeWord("chat");
		expect(families["animaux"]).not.toContain("chat");
		expect(families["félins"]).not.toContain("chat");
	});

	it("les langues ajoutées après un mot apparaissent dans ses traductions", () => {
		addWord("chat", vi.fn());
		addLanguage("fr", vi.fn());
		addLanguage("en", vi.fn());
		addLanguage("de", vi.fn());
		expect(traductions["chat"]).toHaveProperty("fr");
		expect(traductions["chat"]).toHaveProperty("en");
		expect(traductions["chat"]).toHaveProperty("de");
	});

	it("supprimer toutes les langues vide les clés de traduction de chaque mot", () => {
		addWord("chat", vi.fn());
		addLanguage("fr", vi.fn());
		addLanguage("en", vi.fn());
		removeLanguage("fr");
		removeLanguage("en");
		expect(Object.keys(traductions["chat"])).toHaveLength(0);
	});

	it("le state est cohérent après une chaîne : addWord → addLanguage → replaceWord → removeLanguage", () => {
		addWord("chat", vi.fn());
		addLanguage("fr", vi.fn());
		updateTraduction("chat", "fr", "cat");
		replaceWord("chat", "chaton", vi.fn());
		removeLanguage("fr");
		expect(traductions["chaton"]).not.toHaveProperty("fr");
		expect(wordKeys.has("chat")).toBe(false);
		expect(wordKeys.has("chaton")).toBe(true);
	});

	it("un addWord suivi immédiatement d'un removeWord laisse un state propre", () => {
		addLanguage("fr", vi.fn());
		addWord("chat", vi.fn());
		removeWord("chat");
		expect(wordKeys.has("chat")).toBe(false);
		expect(traductions["chat"]).toBeUndefined();
		expect(wordToDelete.has("chat")).toBe(true);
		expect(languageKeys.has("fr")).toBe(true); // la langue reste
	});
});

// TEMP: break CI for merge gate verification
describe("TEMP: vérification du merge gate SonarCloud", () => {
	it("TEMP: break CI for merge gate verification", () => {
		expect(true).toBe(false);
	});
});
