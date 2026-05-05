/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const hidePublishBtn = vi.hoisted(() => vi.fn());

vi.mock("../publish.js", () => ({
	hidePublishBtn,
}));

describe("saveBtn", () => {
	beforeEach(() => {
		document.body.innerHTML = '<button type="button" id="saveBtn" class="save-btn"></button>';
		hidePublishBtn.mockClear();
		vi.resetModules();
	});

	it("displaySaveBtn shows save and hides publish affordance", async () => {
		const { displaySaveBtn } = await import("../ui/saveBtn.js");
		const saveBtn = document.getElementById("saveBtn");
		displaySaveBtn();
		expect(saveBtn.classList.contains("save-btn--visible")).toBe(true);
		expect(hidePublishBtn).toHaveBeenCalledTimes(1);
	});

	it("hideSaveBtn removes visible class", async () => {
		const { displaySaveBtn, hideSaveBtn } = await import("../ui/saveBtn.js");
		const saveBtn = document.getElementById("saveBtn");
		displaySaveBtn();
		hideSaveBtn();
		expect(saveBtn.classList.contains("save-btn--visible")).toBe(false);
	});
});
