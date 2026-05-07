import { beforeEach, describe, expect, it, vi } from "vitest";

const invokeMock = vi.fn();
const getSessionMock = vi.fn();
const notifyErrorMock = vi.fn();
const hidePublishBtnMock = vi.fn();
const displayPublishBtnMock = vi.fn();
const updateFamiliesMock = vi.fn();
const updateWordsMock = vi.fn();
const updateLanguagesMock = vi.fn();
const updateBtnsMock = vi.fn();
const hydrateStoreMock = vi.fn();

vi.mock("../SupabaseManager.js", () => ({
	supabase: {
		auth: {
			getSession: getSessionMock,
		},
		functions: {
			invoke: invokeMock,
		},
	},
}));

vi.mock("../notify.js", () => ({
	notify: {
		error: notifyErrorMock,
		success: vi.fn(),
		warning: vi.fn(),
		show: vi.fn(),
	},
}));

vi.mock("../publish.js", () => ({
	displayPublishBtn: displayPublishBtnMock,
	hidePublishBtn: hidePublishBtnMock,
}));

vi.mock("../saveManager.js", () => ({}));

vi.mock("../tabs/familyTab.js", () => ({
	updateFamilies: updateFamiliesMock,
}));
vi.mock("../tabs/wordTab.js", () => ({
	updateWords: updateWordsMock,
}));
vi.mock("../tabs/languageTab.js", () => ({
	updateLanguages: updateLanguagesMock,
}));

vi.mock("../ui/AccordionView.js", () => ({
	updateBtns: updateBtnsMock,
}));

vi.mock("../state.js", async () => {
	const actual = await vi.importActual("../state.js");
	return {
		...actual,
		hydrateStore: hydrateStoreMock,
	};
});

function mkTabBtn() {
	return {
		classList: { add: vi.fn(), remove: vi.fn() },
		addEventListener: vi.fn(),
		click: vi.fn(),
		disabled: false,
	};
}

function mkTab() {
	return { classList: { add: vi.fn(), remove: vi.fn() } };
}

function makeBaseDom() {
	const wordFamilyBtn = mkTabBtn();
	const wordBtn = mkTabBtn();
	const languagesBtn = mkTabBtn();
	const wordFamilyTab = mkTab();
	const wordTab = mkTab();
	const languageTab = mkTab();
	const tabPanels = [wordFamilyTab, wordTab, languageTab];
	const tabButtons = [wordFamilyBtn, wordBtn, languagesBtn];
	const saveBtn = mkTabBtn();
	const publishBtn = mkTabBtn();
	const confirmPublishBtn = mkTabBtn();
	const cancelPublishBtn = mkTabBtn();
	const bootstrapLoadingRoot = {
		classList: { add: vi.fn(), remove: vi.fn() },
		setAttribute: vi.fn(),
		removeAttribute: vi.fn(),
	};
	const h1 = { insertAdjacentElement: vi.fn((_pos, node) => node) };

	vi.stubGlobal("document", {
		body: { prepend: vi.fn(), appendChild: vi.fn() },
		getElementById: (id) =>
			({
				wordFamilyBtn,
				wordBtn,
				languagesBtn,
				wordFamilyTab,
				wordTab,
				languageTab,
				saveBtn,
				publishBtn,
				confirmPublishBtn,
				cancelPublishBtn,
				bootstrapLoadingRoot,
			})[id],
		querySelector: (sel) => (sel === "h1" ? h1 : null),
		querySelectorAll: (sel) => {
			if (sel === ".tab-panel") {
				return tabPanels;
			}
			if (sel === ".tab__button") {
				return tabButtons;
			}
			return [];
		},
		createElement: vi.fn(() => ({
			appendChild: vi.fn(),
			setAttribute: vi.fn(),
			addEventListener: vi.fn(),
		})),
	});

	return { bootstrapLoadingRoot };
}

describe("ticket_11 red - bootstrap loading", () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
		vi.stubGlobal("location", {
			pathname: "/index.html",
			href: "http://localhost/index.html",
		});
	});

	it("CA-1102/1104: masque le loader en succes et conserve le flux Publish", async () => {
		getSessionMock.mockResolvedValue({ data: { session: { user: {} } } });
		invokeMock.mockResolvedValueOnce({
			data: {
				languages: [],
				words: [],
				translations: [],
				families: [],
				familyAssociations: [],
				publishPending: true,
			},
			error: null,
		});
		const { bootstrapLoadingRoot } = makeBaseDom();

		await import("../main.js");

		expect(bootstrapLoadingRoot.classList.add).toHaveBeenCalledWith(
			"bootstrap-loading--hidden",
		);
		expect(bootstrapLoadingRoot.setAttribute).toHaveBeenCalledWith(
			"aria-busy",
			"false",
		);
		expect(displayPublishBtnMock).toHaveBeenCalledTimes(1);
	});

	it("CA-1103: retire le loader aussi en erreur bootstrap (si auth ok)", async () => {
		getSessionMock.mockResolvedValue({ data: { session: { user: {} } } });
		invokeMock.mockResolvedValueOnce({
			error: new Error("bootstrap-down"),
		});
		const { bootstrapLoadingRoot } = makeBaseDom();

		await import("../main.js");

		expect(notifyErrorMock).toHaveBeenCalledTimes(1);
		expect(bootstrapLoadingRoot.classList.add).toHaveBeenCalledWith(
			"bootstrap-loading--hidden",
		);
	});

	it("securite: conserve le loader si pas d'authentification", async () => {
		getSessionMock.mockResolvedValue({ data: { session: null } });
		const { bootstrapLoadingRoot } = makeBaseDom();

		await import("../main.js");

		// Le loader ne doit PAS être masqué si pas de session
		expect(bootstrapLoadingRoot.classList.add).not.toHaveBeenCalledWith(
			"bootstrap-loading--hidden",
		);
		expect(invokeMock).not.toHaveBeenCalled();
	});

	it("robustesse: bootstrap reste fonctionnel si le noeud loader est absent", async () => {
		getSessionMock.mockResolvedValue({ data: { session: { user: {} } } });
		invokeMock.mockResolvedValueOnce({
			data: {
				languages: [],
				words: [],
				translations: [],
				families: [],
				familyAssociations: [],
				publishPending: false,
			},
			error: null,
		});

		const wordFamilyBtn = mkTabBtn();
		const wordBtn = mkTabBtn();
		const languagesBtn = mkTabBtn();
		const wordFamilyTab = mkTab();
		const wordTab = mkTab();
		const languageTab = mkTab();
		const tabPanels = [wordFamilyTab, wordTab, languageTab];
		const tabButtons = [wordFamilyBtn, wordBtn, languagesBtn];
		const saveBtn = mkTabBtn();
		const publishBtn = mkTabBtn();
		const confirmPublishBtn = mkTabBtn();
		const cancelPublishBtn = mkTabBtn();

		vi.stubGlobal("document", {
			body: { prepend: vi.fn(), appendChild: vi.fn() },
			getElementById: (id) =>
				({
					wordFamilyBtn,
					wordBtn,
					languagesBtn,
					wordFamilyTab,
					wordTab,
					languageTab,
					saveBtn,
					publishBtn,
					confirmPublishBtn,
					cancelPublishBtn,
					bootstrapLoadingRoot: null,
				})[id],
			querySelector: () => null,
			querySelectorAll: (sel) => {
				if (sel === ".tab-panel") {
					return tabPanels;
				}
				if (sel === ".tab__button") {
					return tabButtons;
				}
				return [];
			},
			createElement: vi.fn(() => ({
				appendChild: vi.fn(),
				setAttribute: vi.fn(),
				addEventListener: vi.fn(),
			})),
		});

		await expect(import("../main.js")).resolves.toBeDefined();
		expect(hydrateStoreMock).toHaveBeenCalledTimes(1);
		expect(hidePublishBtnMock).toHaveBeenCalledTimes(1);
		expect(notifyErrorMock).not.toHaveBeenCalled();
	});
});
