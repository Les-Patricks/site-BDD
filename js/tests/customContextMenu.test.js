/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function mountMenuMarkup() {
	document.body.innerHTML = `
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
		<div id="host"></div>
	`;
}

describe("customContextMenu", () => {
	beforeEach(() => {
		mountMenuMarkup();
		vi.resetModules();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("renderContextMenu places the menu and invokes item callback", async () => {
		const { renderContextMenu } = await import("../ui/customContextMenu.js");
		const cb = vi.fn();
		const menu = renderContextMenu(
			{ clientX: 12, clientY: 34 },
			["Do", cb],
		);
		expect(menu.style.left).toBe("12px");
		expect(menu.style.top).toBe("34px");
		expect(menu.classList.contains("hidden")).toBe(false);
		const btn = menu.querySelector(".custom-context-menu__btn");
		btn.click();
		expect(cb).toHaveBeenCalledTimes(1);
		expect(menu.classList.contains("hidden")).toBe(true);
	});

	it("bindContextMenu ignores entries with invalid label or callback", async () => {
		const { bindContextMenu } = await import("../ui/customContextMenu.js");
		const host = document.getElementById("host");
		const good = vi.fn();
		bindContextMenu(host, () => [
			["", good],
			["Bad", null],
			["Ok", good],
		]);
		host.dispatchEvent(
			new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 1, clientY: 2 }),
		);
		vi.runAllTimers();
		const menu = document.getElementById("customContextMenuTemplate");
		const buttons = menu.querySelectorAll(".custom-context-menu__btn");
		expect(buttons.length).toBe(1);
		expect(buttons[0].textContent).toBe("Ok");
	});

	it("document capture click outside closes the menu", async () => {
		const { renderContextMenu } = await import("../ui/customContextMenu.js");
		renderContextMenu({ clientX: 0, clientY: 0 }, ["A", vi.fn()]);
		vi.runAllTimers();
		const menu = document.getElementById("customContextMenuTemplate");
		expect(menu.classList.contains("hidden")).toBe(false);
		document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(menu.classList.contains("hidden")).toBe(true);
	});
});
