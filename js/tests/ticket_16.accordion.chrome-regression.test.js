/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { addEventToButton } from "../ui/AccordionView.js";

describe("ticket 16 - accordion animation chrome regression", () => {
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
});
