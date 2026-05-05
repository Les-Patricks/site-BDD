/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const templatesHtml = `
	<template id="languageItemTemplate">
		<div class="language-item row">
			<span class="language-item__name"></span>
			<span class="edit-group hidden">
				<input type="text" class="edit-input" />
				<span class="validate-btn">OK</span>
			</span>
			<span class="creation-date"></span>
		</div>
	</template>
	<template id="traductionItemTemplate">
		<div class="language-item row">
			<span>
				<span class="language-item__label"></span>
				<span class="language-item__value"></span>
				<span class="edit-group hidden">
					<input type="text" class="edit-input" />
					<span class="validate-btn">OK</span>
				</span>
			</span>
		</div>
	</template>
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
`;

describe("dom helpers", () => {
	beforeEach(() => {
		document.body.innerHTML = `<div id="root"></div>${templatesHtml}`;
		vi.resetModules();
		vi.useFakeTimers();
	});

	it("createDOMElement inserts with class and handles input placeholder", async () => {
		const dom = await import("../dom.js");
		const parent = document.getElementById("root");
		const span = dom.createDOMElement(parent, 0, "span", "hi", "c1");
		expect(span.textContent).toBe("hi");
		expect(span.classList.contains("c1")).toBe(true);
		const input = dom.createDOMElement(parent, 1, "input", "ph", "");
		expect(input.placeholder).toBe("ph");
	});

	it("insertElementAt appends when index is out of range", async () => {
		const dom = await import("../dom.js");
		const parent = document.getElementById("root");
		const a = document.createElement("span");
		a.id = "a";
		const b = document.createElement("span");
		b.id = "b";
		parent.appendChild(a);
		dom.insertElementAt(b, 99, parent);
		expect([...parent.children].map((c) => c.id)).toEqual(["a", "b"]);
	});

	it("insertElementAt resolves negative index before last child", async () => {
		const dom = await import("../dom.js");
		const parent = document.getElementById("root");
		const x = document.createElement("span");
		x.textContent = "1";
		const y = document.createElement("span");
		y.textContent = "2";
		parent.appendChild(x);
		parent.appendChild(y);
		const z = document.createElement("span");
		z.textContent = "z";
		// length 2, index -2 -> resolved index 1 -> insert before "2"
		dom.insertElementAt(z, -2, parent);
		expect([...parent.children].map((c) => c.textContent)).toEqual(["1", "z", "2"]);
	});

	it("createTextElement returns nothing for empty string", async () => {
		const dom = await import("../dom.js");
		const parent = document.getElementById("root");
		expect(dom.createTextElement(parent, "")).toBeUndefined();
		expect(parent.children.length).toBe(0);
	});

	it("createTextElement appends a span", async () => {
		const dom = await import("../dom.js");
		const parent = document.getElementById("root");
		const el = dom.createTextElement(parent, "w");
		expect(el.textContent).toBe("w");
		expect(parent.contains(el)).toBe(true);
	});

	it("createLanguageItem wires delete via context menu", async () => {
		const dom = await import("../dom.js");
		const parent = document.getElementById("root");
		const onDelete = vi.fn();
		dom.createLanguageItem(parent, "Latin", "2020", onDelete, null);
		const item = parent.querySelector(".language-item");
		item.dispatchEvent(
			new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 5, clientY: 6 }),
		);
		vi.runAllTimers();
		const menuBtn = document.querySelector("#customContextMenuTemplate .custom-context-menu__btn");
		menuBtn.click();
		expect(onDelete).toHaveBeenCalledWith(item);
		expect(parent.contains(item)).toBe(false);
	});

	it("createTraductionItem sets label and value", async () => {
		const dom = await import("../dom.js");
		const parent = document.getElementById("root");
		const { labelEl, valueEl } = dom.createTraductionItem(
			parent,
			"EN",
			"hello",
			null,
			null,
		);
		expect(labelEl.textContent).toBe("EN : ");
		expect(valueEl.textContent).toBe("hello");
	});

	afterEach(() => {
		vi.useRealTimers();
	});
});
