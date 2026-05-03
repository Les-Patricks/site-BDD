import { beforeEach, describe, expect, it, vi } from "vitest";

const invokeMock = vi.fn();
const notifySuccessMock = vi.fn();
const notifyErrorMock = vi.fn();
const notifyWarningMock = vi.fn();

vi.mock("../SupabaseManager.js", () => ({
	supabase: {
		functions: {
			invoke: invokeMock,
		},
	},
}));

vi.mock("../notify.js", () => ({
	notify: {
		success: notifySuccessMock,
		error: notifyErrorMock,
		warning: notifyWarningMock,
		show: vi.fn(),
	},
}));

describe("databaseTransfer.publishDatabase", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.resetModules();
	});

	it("throw en cas d'erreur publish-to-firebase", async () => {
		const err = new Error("boom");
		invokeMock.mockResolvedValueOnce({ error: err });

		const { publishDatabase } = await import("../databaseTransfer.js");

		await expect(publishDatabase()).rejects.toThrow("boom");
		expect(notifyErrorMock).toHaveBeenCalledTimes(1);
		expect(notifyErrorMock).toHaveBeenCalledWith(
			expect.stringMatching(/Echec de la publication.*boom/s),
		);
	});

	it("retourne sans throw en cas de succes", async () => {
		invokeMock.mockResolvedValueOnce({ error: null });

		const { publishDatabase } = await import("../databaseTransfer.js");

		await expect(publishDatabase()).resolves.toBeUndefined();
		expect(notifySuccessMock).toHaveBeenCalledTimes(1);
		expect(notifySuccessMock).toHaveBeenCalledWith(
			expect.stringMatching(/Publication reussie/i),
		);
	});
});

