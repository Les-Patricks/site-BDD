import { beforeEach, describe, expect, it, vi } from "vitest";

const invokeMock = vi.fn();
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

function makeDomNode(tag) {
	const n = {
		tagName: String(tag).toUpperCase(),
		className: "",
		textContent: "",
		children: [],
		attributes: {},
		parentNode: null,
		disabled: false,
		setAttribute(k, v) {
			this.attributes[k] = String(v);
		},
		appendChild(c) {
			c.parentNode = this;
			this.children.push(c);
			return c;
		},
		addEventListener: vi.fn(),
	};
	return n;
}

describe("main.js — echec bootstrap", () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
	});

	it("notify.error + banniere + desactivation + pas hydrateStore ni premier clic onglet", async () => {
		invokeMock.mockResolvedValueOnce({
			error: new Error("bootstrap-down"),
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

		const h1 = {
			insertAdjacentElement: vi.fn((_pos, node) => node),
		};

		const body = { prepend: vi.fn(), appendChild: vi.fn() };

		vi.stubGlobal("document", {
			body,
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
			createElement: vi.fn((tag) => makeDomNode(tag)),
		});

		await import("../main.js");

		expect(hydrateStoreMock).not.toHaveBeenCalled();
		expect(notifyErrorMock).toHaveBeenCalledTimes(1);
		expect(notifyErrorMock).toHaveBeenCalledWith(
			expect.stringMatching(/Impossible de charger les donnees.*bootstrap-down/s),
		);
		expect(hidePublishBtnMock).toHaveBeenCalled();
		expect(displayPublishBtnMock).not.toHaveBeenCalled();
		expect(updateBtnsMock).not.toHaveBeenCalled();
		expect(wordFamilyBtn.click).not.toHaveBeenCalled();

		expect(wordFamilyBtn.disabled).toBe(true);
		expect(wordBtn.disabled).toBe(true);
		expect(languagesBtn.disabled).toBe(true);
		expect(saveBtn.disabled).toBe(true);
		expect(publishBtn.disabled).toBe(true);

		expect(h1.insertAdjacentElement).toHaveBeenCalledWith(
			"afterend",
			expect.objectContaining({
				className: "bootstrap-error-banner",
			}),
		);
	});
});
