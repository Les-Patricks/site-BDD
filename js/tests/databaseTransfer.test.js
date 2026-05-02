import { beforeEach, describe, expect, it, vi } from "vitest";

const invokeMock = vi.fn();
const alertMock = vi.fn();

vi.mock("../SupabaseManager.js", () => ({
	supabase: {
		functions: {
			invoke: invokeMock,
		},
	},
}));

describe("databaseTransfer.publishDatabase", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubGlobal("alert", alertMock);
	});

	it("throw en cas d'erreur publish-to-firebase", async () => {
		const err = new Error("boom");
		invokeMock.mockResolvedValueOnce({ error: err });

		const { publishDatabase } = await import("../databaseTransfer.js");

		await expect(publishDatabase()).rejects.toThrow("boom");
		expect(alertMock).toHaveBeenCalledWith("Error publishing database: boom");
	});

	it("retourne sans throw en cas de succes", async () => {
		invokeMock.mockResolvedValueOnce({ error: null });

		const { publishDatabase } = await import("../databaseTransfer.js");

		await expect(publishDatabase()).resolves.toBeUndefined();
		expect(alertMock).toHaveBeenCalledWith("Database published successfully!");
	});
});

