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

	it("Tab key moves focus to next menu button", async () => {
		const { renderContextMenu } = await import("../ui/customContextMenu.js");
		const menu = renderContextMenu({ clientX: 0, clientY: 0 }, ["A", vi.fn()], ["B", vi.fn()]);
		const buttons = [...menu.querySelectorAll(".custom-context-menu__btn")];
		buttons[0].focus();

		document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true }));
		expect(document.activeElement).toBe(buttons[1]);
	});

	it("Shift+Tab wraps focus from first to last button", async () => {
		const { renderContextMenu } = await import("../ui/customContextMenu.js");
		const menu = renderContextMenu({ clientX: 0, clientY: 0 }, ["A", vi.fn()], ["B", vi.fn()]);
		const buttons = [...menu.querySelectorAll(".custom-context-menu__btn")];
		buttons[0].focus();

		document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true, cancelable: true }));
		expect(document.activeElement).toBe(buttons[buttons.length - 1]);
	});

	it("ArrowUp moves focus to previous button", async () => {
		const { renderContextMenu } = await import("../ui/customContextMenu.js");
		const menu = renderContextMenu({ clientX: 0, clientY: 0 }, ["A", vi.fn()], ["B", vi.fn()]);
		const buttons = [...menu.querySelectorAll(".custom-context-menu__btn")];
		buttons[1].focus();

		document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true, cancelable: true }));
		expect(document.activeElement).toBe(buttons[0]);
	});

	it("Escape closes menu and restores focus to trigger element", async () => {
		const { renderContextMenu } = await import("../ui/customContextMenu.js");
		const trigger = document.getElementById("host");
		trigger.tabIndex = 0;
		trigger.focus();

		const menu = renderContextMenu({ clientX: 0, clientY: 0 }, trigger, ["A", vi.fn()]);
		expect(menu.classList.contains("hidden")).toBe(false);

		document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
		expect(menu.classList.contains("hidden")).toBe(true);
		expect(document.activeElement).toBe(trigger);
	});

	it("second renderContextMenu call replaces previous keydown handler", async () => {
		const { renderContextMenu } = await import("../ui/customContextMenu.js");
		const cb1 = vi.fn();
		const cb2 = vi.fn();
		renderContextMenu({ clientX: 0, clientY: 0 }, ["A", cb1]);
		const menu = renderContextMenu({ clientX: 5, clientY: 5 }, ["B", cb2]);

		const buttons = [...menu.querySelectorAll(".custom-context-menu__btn")];
		buttons[0].focus();
		document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true }));
		expect(document.activeElement).toBe(buttons[0]);
	});

	it("bindContextMenu actionsBtn click opens menu at button position", async () => {
		const { bindContextMenu } = await import("../ui/customContextMenu.js");
		const host = document.getElementById("host");
		const actionsBtn = document.createElement("button");
		actionsBtn.className = "actions-btn";
		host.appendChild(actionsBtn);
		const cb = vi.fn();

		bindContextMenu(host, () => [["Option", cb]]);
		actionsBtn.click();
		vi.runAllTimers();

		const menu = document.getElementById("customContextMenuTemplate");
		expect(menu.classList.contains("hidden")).toBe(false);
		const btn = menu.querySelector(".custom-context-menu__btn");
		expect(btn.textContent).toBe("Option");
	});

	it("bindContextMenu actionsBtn click with empty contextData does nothing", async () => {
		const { bindContextMenu } = await import("../ui/customContextMenu.js");
		const host = document.getElementById("host");
		const actionsBtn = document.createElement("button");
		actionsBtn.className = "actions-btn";
		host.appendChild(actionsBtn);

		bindContextMenu(host, () => []);
		actionsBtn.click();

		const menu = document.getElementById("customContextMenuTemplate");
		expect(menu.classList.contains("hidden")).toBe(true);
	});
});
