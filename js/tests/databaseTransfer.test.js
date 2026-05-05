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

	it("throws when publish-to-firebase returns an error", async () => {
		const err = new Error("boom");
		invokeMock.mockResolvedValueOnce({ error: err });

		const { publishDatabase } = await import("../databaseTransfer.js");

		await expect(publishDatabase()).rejects.toThrow("boom");
		expect(notifyErrorMock).toHaveBeenCalledTimes(1);
		expect(notifyErrorMock).toHaveBeenCalledWith(
			expect.stringMatching(/Echec de la publication.*boom/s),
		);
	});

	it("resolves without throwing on success", async () => {
		invokeMock.mockResolvedValueOnce({ error: null });

		const { publishDatabase } = await import("../databaseTransfer.js");

		await expect(publishDatabase()).resolves.toBeUndefined();
		expect(notifySuccessMock).toHaveBeenCalledTimes(1);
		expect(notifySuccessMock).toHaveBeenCalledWith(
			expect.stringMatching(/Publication reussie/i),
		);
	});

	it("enriches the error message from the Edge function JSON body", async () => {
		const json = vi.fn().mockResolvedValue({
			stage: "validate",
			error: "Invalid payload",
		});
		const err = new Error("Edge error");
		err.context = { json };
		invokeMock.mockResolvedValueOnce({ error: err });

		const { publishDatabase } = await import("../databaseTransfer.js");

		await expect(publishDatabase()).rejects.toThrow(
			/Invalid payload.*\[stage=validate\]/s,
		);
		expect(notifyErrorMock).toHaveBeenCalledWith(
			expect.stringMatching(/Invalid payload.*validate/s),
		);
	});

	it("serializes a non-string error field as JSON in the message", async () => {
		const json = vi.fn().mockResolvedValue({
			error: { code: "E1" },
		});
		const err = new Error("fail");
		err.context = { json };
		invokeMock.mockResolvedValueOnce({ error: err });

		const { publishDatabase } = await import("../databaseTransfer.js");

		await expect(publishDatabase()).rejects.toThrow(/"code":"E1"/);
	});

	it("keeps the original message when context.json fails", async () => {
		const json = vi.fn().mockRejectedValue(new SyntaxError("not json"));
		const err = new Error("FunctionsRelayError");
		err.context = { json };
		invokeMock.mockResolvedValueOnce({ error: err });

		const { publishDatabase } = await import("../databaseTransfer.js");

		await expect(publishDatabase()).rejects.toThrow("FunctionsRelayError");
		expect(notifyErrorMock).toHaveBeenCalledWith(
			expect.stringMatching(/FunctionsRelayError/),
		);
	});
});

