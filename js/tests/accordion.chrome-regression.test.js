/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { addEventToButton, updateBtns } from "../ui/AccordionView.js";

describe("accordion animation chrome regression", () => {
	beforeEach(() => {
		document.body.innerHTML = `
			<div class="accordion-item">
				<button type="button" class="row-content">Toggle</button>
				<div class="accordion__panel">
					<div class="accordion__content">Child</div>
				</div>
			</div>
		`;
		vi.restoreAllMocks();
	});

	it("initializes collapsed panel with max-height 0px", () => {
		const button = document.querySelector(".row-content");
		const panel = document.querySelector(".accordion__panel");

		addEventToButton(button);

		expect(panel.style.maxHeight).toBe("0px");
		expect(panel.classList.contains("accordion__panel--open")).toBe(false);
	});

	it("opens with animated max-height based on scrollHeight", () => {
		const button = document.querySelector(".row-content");
		const panel = document.querySelector(".accordion__panel");

		Object.defineProperty(panel, "scrollHeight", {
			configurable: true,
			get: () => 42,
		});
		const rafSpy = vi
			.spyOn(window, "requestAnimationFrame")
			.mockImplementation((callback) => {
				callback();
				return 1;
			});

		addEventToButton(button);
		button.dispatchEvent(new MouseEvent("click", { bubbles: true }));

		expect(panel.classList.contains("accordion__panel--open")).toBe(true);
		expect(panel.style.maxHeight).toBe("42px");
		expect(rafSpy).toHaveBeenCalled();
	});

	it("keeps open state unconstrained after transition end", () => {
		const button = document.querySelector(".row-content");
		const panel = document.querySelector(".accordion__panel");

		Object.defineProperty(panel, "scrollHeight", {
			configurable: true,
			get: () => 120,
		});
		vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
			callback();
			return 1;
		});

		addEventToButton(button);
		button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		panel.dispatchEvent(new Event("transitionend"));

		expect(panel.style.maxHeight).toBe("none");
	});

	it("closes back to max-height 0px", () => {
		const button = document.querySelector(".row-content");
		const panel = document.querySelector(".accordion__panel");

		Object.defineProperty(panel, "scrollHeight", {
			configurable: true,
			get: () => 65,
		});
		vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
			callback();
			return 1;
		});

		addEventToButton(button);
		button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		button.dispatchEvent(new MouseEvent("click", { bubbles: true }));

		expect(panel.classList.contains("accordion__panel--open")).toBe(false);
		expect(panel.style.maxHeight).toBe("0px");
	});

	it("panel gets inert attribute when closed, loses it when opened, regains on close", () => {
		const button = document.querySelector(".row-content");
		const panel = document.querySelector(".accordion__panel");
		Object.defineProperty(panel, "scrollHeight", { configurable: true, get: () => 80 });
		vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => { cb(); return 1; });

		addEventToButton(button);
		expect(panel.hasAttribute("inert")).toBe(true);

		button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(panel.hasAttribute("inert")).toBe(false);

		button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(panel.hasAttribute("inert")).toBe(true);
	});

	it("keydown Enter on btn opens panel", () => {
		const button = document.querySelector(".row-content");
		const panel = document.querySelector(".accordion__panel");
		Object.defineProperty(panel, "scrollHeight", { configurable: true, get: () => 50 });
		vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => { cb(); return 1; });

		addEventToButton(button);
		button.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));

		expect(panel.classList.contains("accordion__panel--open")).toBe(true);
	});

	it("keydown Space on btn opens panel", () => {
		const button = document.querySelector(".row-content");
		const panel = document.querySelector(".accordion__panel");
		Object.defineProperty(panel, "scrollHeight", { configurable: true, get: () => 50 });
		vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => { cb(); return 1; });

		addEventToButton(button);
		button.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true }));

		expect(panel.classList.contains("accordion__panel--open")).toBe(true);
	});

	it("keydown Enter bubbled from inner element does not toggle panel", () => {
		const button = document.querySelector(".row-content");
		const panel = document.querySelector(".accordion__panel");
		const inner = document.createElement("button");
		button.appendChild(inner);

		addEventToButton(button);
		inner.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));

		expect(panel.classList.contains("accordion__panel--open")).toBe(false);
	});

	it("panel already open at init: no inert set, maxHeight unchanged", () => {
		const button = document.querySelector(".row-content");
		const panel = document.querySelector(".accordion__panel");
		panel.classList.add("accordion__panel--open");
		panel.style.maxHeight = "120px";

		addEventToButton(button);

		expect(panel.hasAttribute("inert")).toBe(false);
		expect(panel.style.maxHeight).toBe("120px");
	});

	it("transitionend on closed panel does not set maxHeight none", () => {
		const button = document.querySelector(".row-content");
		const panel = document.querySelector(".accordion__panel");
		Object.defineProperty(panel, "scrollHeight", { configurable: true, get: () => 60 });
		vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => { cb(); return 1; });

		addEventToButton(button);
		button.dispatchEvent(new MouseEvent("click", { bubbles: true })); // open
		button.dispatchEvent(new MouseEvent("click", { bubbles: true })); // close
		panel.dispatchEvent(new Event("transitionend"));

		expect(panel.style.maxHeight).toBe("0px");
	});

	it("addEventToButton returns early when no accordion panel sibling", () => {
		document.body.innerHTML = `<button class="row-content">No panel</button>`;
		const button = document.querySelector(".row-content");
		expect(() => addEventToButton(button)).not.toThrow();
	});

	it("non-Enter/Space keydown on btn does not toggle panel", () => {
		const button = document.querySelector(".row-content");
		const panel = document.querySelector(".accordion__panel");
		addEventToButton(button);

		button.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
		expect(panel.classList.contains("accordion__panel--open")).toBe(false);
	});

	it("updateBtns sets inert on panels for all accordion__button elements in DOM", () => {
		document.body.innerHTML = `
			<div class="accordion-item">
				<span class="accordion__button row-content">A</span>
				<div class="accordion__panel"><div></div></div>
			</div>
		`;
		updateBtns();
		expect(document.querySelector(".accordion__panel").hasAttribute("inert")).toBe(true);
	});
});
