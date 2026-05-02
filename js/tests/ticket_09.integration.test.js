import { beforeEach, describe, expect, it, vi } from "vitest";

const saveMock = vi.fn();
const publishDatabaseMock = vi.fn();
const hidePublishBtnMock = vi.fn();
const displayPublishBtnMock = vi.fn();
const hideSaveBtnMock = vi.fn();

vi.mock("../state.js", async () => {
	const actual = await vi.importActual("../state.js");
	return {
		...actual,
		save: saveMock,
	};
});

vi.mock("../databaseTransfer.js", () => ({
	publishDatabase: publishDatabaseMock,
}));

vi.mock("../ui/saveBtn.js", () => ({
	hideSaveBtn: hideSaveBtnMock,
}));

const listeners = {};

function createClassList() {
	const classes = new Set();
	return {
		add: vi.fn((name) => classes.add(name)),
		remove: vi.fn((name) => classes.delete(name)),
		contains: (name) => classes.has(name),
	};
}

function mkBtn(text = "Save") {
	return {
		textContent: text,
		classList: createClassList(),
		addEventListener: (event, cb) => {
			listeners[event] = cb;
		},
	};
}

beforeEach(() => {
	vi.resetModules();
	vi.clearAllMocks();
	for (const key of Object.keys(listeners)) delete listeners[key];
});

describe("Ticket 09 Red - retry UI after failures", () => {
	it("T-090 [CA-901] save echec restaure le bouton Save pour retry", async () => {
		const saveBtn = mkBtn("Save");
		const publishBtn = mkBtn("Publish");
		const confirmPublishBtn = mkBtn("Confirm");
		const cancelPublishBtn = mkBtn("Cancel");
		const publishConfirmPopup = { classList: createClassList() };

		vi.stubGlobal("document", {
			getElementById: (id) =>
				({
					saveBtn,
					publishBtn,
					confirmPublishBtn,
					cancelPublishBtn,
					publishConfirmPopup,
				})[id],
		});

		saveMock.mockRejectedValueOnce(new Error("save failed"));
		saveMock.mockResolvedValueOnce(true);
		await import("../saveManager.js");
		await listeners.click();
		await listeners.click();

		expect(saveBtn.classList.remove).toHaveBeenCalledWith("save-btn__saving");
		expect(saveBtn.textContent).toBe("Save");
		expect(saveMock).toHaveBeenCalledTimes(2);
		expect(displayPublishBtnMock).not.toHaveBeenCalled();
	});

	it("T-091 [CA-902/903] publish echec doit restaurer le bouton Publish pour retry", async () => {
		const saveBtn = mkBtn("Save");
		const publishBtn = mkBtn("Publish");
		const confirmPublishBtn = mkBtn("Publish");
		const cancelPublishBtn = mkBtn("Cancel");
		const publishConfirmPopup = { classList: createClassList() };

		vi.stubGlobal("document", {
			getElementById: (id) =>
				({
					saveBtn,
					publishBtn,
					confirmPublishBtn,
					cancelPublishBtn,
					publishConfirmPopup,
				})[id],
		});

		publishDatabaseMock.mockRejectedValueOnce(new Error("publish failed"));
		publishDatabaseMock.mockResolvedValueOnce(undefined);
		await import("../publish.js");

		await expect(listeners.click()).rejects.toThrow("publish failed");
		expect(publishConfirmPopup.classList.remove).toHaveBeenCalledWith(
			"publish__popup--visible",
		);
		expect(publishBtn.classList.add).toHaveBeenCalledWith("publish__btn--saving");
		expect(publishBtn.classList.remove).not.toHaveBeenCalledWith(
			"publish__btn--visible",
		);
		await listeners.click();

		expect(publishBtn.classList.remove).toHaveBeenCalledWith("publish__btn--saving");
		expect(publishBtn.textContent).toBe("Publish");
		expect(publishDatabaseMock).toHaveBeenCalledTimes(2);
	});

	it("T-092 [CA-904] publish succes conserve le masquage du bouton Publish", async () => {
		const saveBtn = mkBtn("Save");
		const publishBtn = mkBtn("Publish");
		const confirmPublishBtn = mkBtn("Publish");
		const cancelPublishBtn = mkBtn("Cancel");
		const publishConfirmPopup = { classList: createClassList() };

		vi.stubGlobal("document", {
			getElementById: (id) =>
				({
					saveBtn,
					publishBtn,
					confirmPublishBtn,
					cancelPublishBtn,
					publishConfirmPopup,
				})[id],
		});

		publishDatabaseMock.mockResolvedValueOnce(undefined);
		await import("../publish.js");
		await listeners.click();

		expect(publishConfirmPopup.classList.remove).toHaveBeenCalledWith(
			"publish__popup--visible",
		);
		expect(publishBtn.classList.add).toHaveBeenCalledWith("publish__btn--saving");
		expect(publishBtn.classList.remove).toHaveBeenCalledWith("publish__btn--saving");
		expect(publishBtn.classList.remove).toHaveBeenCalledWith(
			"publish__btn--visible",
		);
		expect(publishBtn.textContent).toBe("Publish");
	});
});

