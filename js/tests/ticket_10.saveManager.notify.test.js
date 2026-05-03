import { beforeEach, describe, expect, it, vi } from "vitest";

const saveMock = vi.fn();
const displayPublishBtnMock = vi.fn();
const notifySuccessMock = vi.fn();
const notifyErrorMock = vi.fn();
const notifyWarningMock = vi.fn();

vi.mock("../state.js", async () => {
	const actual = await vi.importActual("../state.js");
	return {
		...actual,
		save: saveMock,
	};
});

vi.mock("../publish.js", () => ({
	displayPublishBtn: displayPublishBtnMock,
}));

vi.mock("../notify.js", () => ({
	notify: {
		success: notifySuccessMock,
		error: notifyErrorMock,
		warning: notifyWarningMock,
		show: vi.fn(),
	},
}));

const listeners = {};

function mkBtn(text = "Save") {
	return {
		textContent: text,
		classList: { add: vi.fn(), remove: vi.fn() },
		addEventListener: (event, cb) => {
			listeners[event] = cb;
		},
	};
}

beforeEach(() => {
	vi.resetModules();
	vi.clearAllMocks();
	for (const key of Object.keys(listeners)) {
		delete listeners[key];
	}
});

describe("ticket_10 saveManager + notify", () => {
	it("CA-1002: notify.success apres save reussi (message + durationMs 2500)", async () => {
		const saveBtn = mkBtn("Save");
		vi.stubGlobal("document", {
			getElementById: (id) => (id === "saveBtn" ? saveBtn : null),
		});
		saveMock.mockResolvedValueOnce(true);
		await import("../saveManager.js");
		await listeners.click();

		expect(notifySuccessMock).toHaveBeenCalledWith("Donnees enregistrees.", {
			durationMs: 2500,
		});
		expect(displayPublishBtnMock).toHaveBeenCalled();
	});

	it("CA-1002: notify.error apres echec save", async () => {
		const saveBtn = mkBtn("Save");
		vi.stubGlobal("document", {
			getElementById: (id) => (id === "saveBtn" ? saveBtn : null),
		});
		saveMock.mockRejectedValueOnce(new Error("network down"));
		await import("../saveManager.js");
		await listeners.click();

		expect(notifyErrorMock).toHaveBeenCalledWith(
			"Enregistrement impossible : network down",
		);
		expect(notifySuccessMock).not.toHaveBeenCalled();
	});
});
