/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { bindTabAddSystem, toggleAddSystem } from "../ui/tabAddSystem.js";

function mkEl(tag, className = "") {
	const el = document.createElement(tag);
	if (className) {
		el.className = className;
	}
	return el;
}

describe("tabAddSystem", () => {
	let addBtn;
	let addLabel;
	let addInput;
	let submitBtn;

	beforeEach(() => {
		// Collapsed add form: primary button visible; input/submit hidden (matches tab panels).
		addBtn = mkEl("button", "");
		addLabel = mkEl("label", "");
		addInput = mkEl("input", "");
		addInput.value = "previous";
		submitBtn = mkEl("button", "");
	});

	it("toggleAddSystem toggles visibility classes and clears the input", () => {
		toggleAddSystem(addBtn, addLabel, addInput, submitBtn);
		expect(addBtn.classList.contains("tab-panel__button--hidden")).toBe(true);
		expect(addLabel.classList.contains("tab-panel__label--hidden")).toBe(true);
		expect(addInput.classList.contains("tab-panel__input--visible")).toBe(true);
		expect(submitBtn.classList.contains("tab-panel__submit-button--visible")).toBe(
			true,
		);
		expect(addInput.value).toBe("");
	});

	it("bindTabAddSystem wires add click to expand and focus input", () => {
		const focusSpy = vi.spyOn(addInput, "focus");
		const selectSpy = vi.spyOn(addInput, "select");
		bindTabAddSystem(addBtn, addLabel, addInput, submitBtn, vi.fn());
		addBtn.click();
		expect(addInput.classList.contains("tab-panel__input--visible")).toBe(true);
		expect(focusSpy).toHaveBeenCalled();
		expect(selectSpy).toHaveBeenCalled();
	});

	it("bindTabAddSystem submit calls fn then collapses", () => {
		const submitFn = vi.fn();
		bindTabAddSystem(addBtn, addLabel, addInput, submitBtn, submitFn);
		addBtn.click();
		addInput.value = "new-item";
		submitBtn.click();
		expect(submitFn).toHaveBeenCalledTimes(1);
		expect(addInput.classList.contains("tab-panel__input--visible")).toBe(false);
	});
});
