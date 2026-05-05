/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../state.js", () => ({
	autocompleteWords: ["alpha", "beta"],
}));

function mountAccordionFixture() {
	document.body.innerHTML = `
		<template id="accordion">
			<div class="accordion-item">
				<span class="row-content row">
					<span class="title-group left-group">
						<span class="expand-icon">></span>
						<span class="accordion__button">Family Name</span>
						<span class="edit-group hidden">
							<input type="text" class="edit-input" />
							<span class="validate-btn">OK</span>
						</span>
					</span>
					<span class="word-count">8</span>
					<span class="creation-date right-group">2023/01/01</span>
				</span>
				<div class="accordion__panel">
					<div class="accordion__content"></div>
				</div>
			</div>
		</template>
		<template id="accordionAddForm">
			<span class="accordion__add-form hidden">
				<input type="text" class="accordion__input" list="autocomplete-datalist" />
				<span class="accordion__submit">GO</span>
			</span>
		</template>
		<datalist id="autocomplete-datalist"></datalist>
		<div id="customContextMenuTemplate" class="hidden">
			<div class="custom-context-menu">
				<ul class="custom-context-menu__list"></ul>
			</div>
		</div>
		<template id="customContextItemTemplate">
			<li class="custom-context-menu__item">
				<button type="button" class="custom-context-menu__btn">X</button>
			</li>
		</template>
		<div id="acc-root"></div>
	`;
}

describe("accordion createAccordionElement", () => {
	beforeEach(() => {
		mountAccordionFixture();
		vi.useFakeTimers();
		vi.stubGlobal("requestAnimationFrame", (cb) => {
			cb();
			return 0;
		});
		vi.resetModules();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.useRealTimers();
	});

	it("toggles expand icon on header click", async () => {
		const { createAccordionElement } = await import("../components/accordion.js");
		const parent = document.getElementById("acc-root");
		const item = createAccordionElement(parent, "List", "2", "d", null, null, null);
		const btn = item.querySelector(".row-content");
		const icon = item.querySelector(".expand-icon");
		btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(icon.classList.contains("expand-icon--open")).toBe(true);
	});

	it("delete from context menu removes the accordion item", async () => {
		const { createAccordionElement } = await import("../components/accordion.js");
		const parent = document.getElementById("acc-root");
		const onDelete = vi.fn();
		const item = createAccordionElement(parent, "L", "0", "d", onDelete, vi.fn(), null);
		const btn = item.querySelector(".row-content");
		btn.dispatchEvent(
			new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 1, clientY: 2 }),
		);
		vi.runAllTimers();
		const buttons = document.querySelectorAll(
			"#customContextMenuTemplate .custom-context-menu__btn",
		);
		const del = [...buttons].find((b) => b.textContent === "Supprimer");
		del.click();
		expect(onDelete).toHaveBeenCalled();
		expect(parent.contains(item)).toBe(false);
	});

	it("onAdd path opens inline form from context menu", async () => {
		const { createAccordionElement } = await import("../components/accordion.js");
		const parent = document.getElementById("acc-root");
		const onAdd = vi.fn((_value, done) => done());
		createAccordionElement(parent, "L", "0", "d", null, null, onAdd);
		const item = parent.querySelector(".accordion-item");
		const btn = item.querySelector(".row-content");
		btn.dispatchEvent(
			new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 1, clientY: 2 }),
		);
		vi.runAllTimers();
		const addBtn = [...document.querySelectorAll("#customContextMenuTemplate .custom-context-menu__btn")].find(
			(b) => b.textContent === "Ajouter un mot",
		);
		addBtn.click();
		const form = item.querySelector(".accordion__add-form");
		expect(form.classList.contains("hidden")).toBe(false);
		const input = form.querySelector(".accordion__input");
		input.value = "hello";
		form.querySelector(".accordion__submit").click();
		expect(onAdd).toHaveBeenCalled();
	});
});
