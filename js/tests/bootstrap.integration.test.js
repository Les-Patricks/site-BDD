import { beforeEach, describe, expect, it, vi } from "vitest";

const invokeMock = vi.fn();
const displayPublishBtnMock = vi.fn();
const hidePublishBtnMock = vi.fn();
const updateLanguagesMock = vi.fn();
const updateWordsMock = vi.fn();
const updateFamiliesMock = vi.fn();
const updateBtnsMock = vi.fn();
const hideSaveBtnMock = vi.fn();
const displaySaveBtnMock = vi.fn();

vi.mock("../SupabaseManager.js", () => ({
	supabase: {
		functions: {
			invoke: invokeMock,
		},
		auth: {
			getSession: vi.fn().mockResolvedValue({
				data: { session: { user: { id: "test-user" } } },
				error: null,
			}),
		},
	},
}));

vi.mock("../publish.js", () => ({
	displayPublishBtn: displayPublishBtnMock,
	hidePublishBtn: hidePublishBtnMock,
}));

vi.mock("../tabs/languageTab.js", () => ({ updateLanguages: updateLanguagesMock }));
vi.mock("../tabs/wordTab.js", () => ({ updateWords: updateWordsMock }));
vi.mock("../tabs/familyTab.js", () => ({ updateFamilies: updateFamiliesMock }));
vi.mock("../ui/AccordionView.js", () => ({ updateBtns: updateBtnsMock }));
vi.mock("../ui/saveBtn.js", () => ({
	hideSaveBtn: hideSaveBtnMock,
	displaySaveBtn: displaySaveBtnMock,
}));

const listeners = {};

const mkBtn = () => ({
	textContent: "Save",
	classList: { add: vi.fn(), remove: vi.fn() },
	addEventListener: (event, cb) => {
		listeners[event] = cb;
	},
});

const mkTabBtn = () => ({
	classList: { add: vi.fn(), remove: vi.fn() },
	addEventListener: vi.fn(),
	click: vi.fn(),
});

const mkTab = () => ({ classList: { add: vi.fn(), remove: vi.fn() } });

let saveBtn;

beforeEach(async () => {
	vi.resetModules();
	vi.clearAllMocks();
	for (const key of Object.keys(listeners)) delete listeners[key];

	saveBtn = mkBtn();
	const publishBtn = mkBtn();
	const confirmPublishBtn = mkBtn();
	const cancelPublishBtn = mkBtn();
	const publishConfirmPopup = { classList: { add: vi.fn(), remove: vi.fn() } };

	const wordFamilyBtn = mkTabBtn();
	const wordBtn = mkTabBtn();
	const languagesBtn = mkTabBtn();
	const wordFamilyTab = mkTab();
	const wordTab = mkTab();
	const languageTab = mkTab();
	const tabPanels = [wordFamilyTab, wordTab, languageTab];
	const tabButtons = [wordFamilyBtn, wordBtn, languagesBtn];

	vi.stubGlobal("document", {
		getElementById: (id) =>
			({
				saveBtn,
				publishBtn,
				confirmPublishBtn,
				cancelPublishBtn,
				publishConfirmPopup,
				wordFamilyBtn,
				wordBtn,
				languagesBtn,
				wordFamilyTab,
				wordTab,
				languageTab,
			})[id],
		querySelectorAll: (selector) => {
			if (selector === ".tab-panel") return tabPanels;
			if (selector === ".tab__button") return tabButtons;
			return [];
		},
	});
});

describe("Integration contracts - admin endpoints", () => {
	it("save() envoie un payload metier via admin-save", async () => {
		const state = await import("../state.js");
		state.hydrateStore({ languages: {}, words: {}, families: {} });
		const languageId = state.addLanguage("Francais");
		const wordId = state.addWord("chat");
		state.addTranslation(wordId, languageId, "cat");
		const familyId = state.addFamily("Animaux");
		state.addWordToFamily(wordId, familyId);

		invokeMock.mockResolvedValue({
			data: { ok: true, code: "SAVE_OK" },
			error: null,
		});
		await import("../saveManager.js");
		await listeners.click();

		expect(invokeMock).toHaveBeenCalledWith(
			"admin-save",
			expect.objectContaining({
				body: expect.objectContaining({
					languages: expect.any(Array),
					words: expect.any(Array),
					families: expect.any(Array),
					toDelete: expect.any(Object),
				}),
			}),
		);
	});

	it("save() conserve les sets de suppression en cas d'erreur", async () => {
		const state = await import("../state.js");
		state.hydrateStore({
			languages: {},
			words: { chat: { displayName: "chat", translations: {} } },
			families: {},
		});
		state.deleteWord("chat");

		invokeMock.mockResolvedValue({ error: new Error("boom") });
		await import("../saveManager.js");
		await listeners.click();

		expect(state.storeChanges.deleted.words.has("chat")).toBe(true);
	});

	it("main hydrate le state depuis admin-bootstrap", async () => {
		const state = await import("../state.js");
		const hydrateStoreSpy = vi.spyOn(state, "hydrateStore");

		invokeMock.mockResolvedValue({
			error: null,
			data: {
				languages: [{ language_id: "fr" }],
				words: [{ word_id: "chat" }],
				translations: [{ word_id: "chat", language_id: "fr", value: "cat" }],
				families: [{ word_family_id: "animaux" }],
				familyAssociations: [{ word_id: "chat", word_family_id: "animaux" }],
			},
		});

		await import("../main.js");

		expect(invokeMock).toHaveBeenCalledWith("admin-bootstrap");
		expect(hydrateStoreSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				languages: expect.any(Object),
				words: expect.any(Object),
				families: expect.any(Object),
			}),
		);
	});

	it("main affiche Publish si publish_pending=true", async () => {
		invokeMock.mockResolvedValue({
			error: null,
			data: {
				languages: [],
				words: [],
				translations: [],
				families: [],
				familyAssociations: [],
				publish_pending: true,
			},
		});

		await import("../main.js");

		expect(displayPublishBtnMock).toHaveBeenCalledTimes(1);
		expect(hidePublishBtnMock).not.toHaveBeenCalled();
	});

	it("main masque Publish si publish_pending=false", async () => {
		invokeMock.mockResolvedValue({
			error: null,
			data: {
				languages: [],
				words: [],
				translations: [],
				families: [],
				familyAssociations: [],
				publish_pending: false,
			},
		});

		await import("../main.js");

		expect(hidePublishBtnMock).toHaveBeenCalledTimes(1);
		expect(displayPublishBtnMock).not.toHaveBeenCalled();
	});

	it("main accepte aussi publishPending (camelCase)", async () => {
		invokeMock.mockResolvedValue({
			error: null,
			data: {
				languages: [],
				words: [],
				translations: [],
				families: [],
				familyAssociations: [],
				publishPending: true,
			},
		});

		await import("../main.js");

		expect(displayPublishBtnMock).toHaveBeenCalledTimes(1);
		expect(hidePublishBtnMock).not.toHaveBeenCalled();
	});
});
