import { webcrypto } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../ui/autocomplete.js", () => ({
	addWordToAutocomplete: vi.fn(),
	removeWordFromAutocomplete: vi.fn(),
}));

vi.mock("../ui/saveBtn.js", () => ({
	displaySaveBtn: vi.fn(),
}));

describe("state entity id generation (crypto fallbacks)", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("uses hex suffix from getRandomValues when randomUUID is absent", async () => {
		vi.stubGlobal("crypto", {
			getRandomValues: (arr) => webcrypto.getRandomValues(arr),
		});
		vi.resetModules();
		const state = await import("../state.js");
		state.store.languages = {};
		state.store.words = {};
		state.store.families = {};
		state.clearStoreChanges();

		const id = state.addWord("sole");
		expect(id).toMatch(/^word_[0-9a-f]{32}$/);
	});

	it("uses time and monotonic counter when Web Crypto is unavailable", async () => {
		vi.stubGlobal("crypto", undefined);
		vi.resetModules();
		const state = await import("../state.js");
		state.store.languages = {};
		state.store.words = {};
		state.store.families = {};
		state.clearStoreChanges();

		const first = state.addWord("a");
		const second = state.addWord("b");
		expect(first).not.toBe(second);
		expect(first).toMatch(/^word_\d+_\d+$/);
		expect(second).toMatch(/^word_\d+_\d+$/);
	});
});
