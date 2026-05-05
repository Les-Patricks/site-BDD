/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function mountModalFixture() {
	document.body.innerHTML = `
		<div class="document-panel"></div>
		<div class="modal">
			<div class="modal__content">
				<button type="button" id="modalRenameBtn">Rename</button>
				<button type="button" id="modalDeleteBtn">Delete</button>
			</div>
		</div>
		<div class="modal" id="familyModal">
			<div class="modal__content">
				<button type="button" id="familyModalRenameBtn">FR</button>
				<button type="button" id="familyModalAddWordBtn">FA</button>
				<button type="button" id="familyModalDeleteBtn">FD</button>
			</div>
		</div>
	`;
	Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
		configurable: true,
		get() {
			return 48;
		},
	});
}

describe("modal", () => {
	beforeEach(() => {
		mountModalFixture();
		vi.resetModules();
	});

	afterEach(() => {
		delete HTMLElement.prototype.offsetHeight;
	});

	it("toggleModal shows and hides overlay classes", async () => {
		const { toggleModal } = await import("../modal.js");
		const modal = document.querySelector(".modal");
		const panel = document.querySelector(".document-panel");
		toggleModal(true);
		expect(modal.classList.contains("modal--visible")).toBe(true);
		expect(panel.classList.contains("document-panel--visible")).toBe(true);
		toggleModal(false);
		expect(modal.classList.contains("modal--visible")).toBe(false);
	});

	it("callModal wires rename and delete on separate opens", async () => {
		const { callModal } = await import("../modal.js");
		const rename = vi.fn();
		const remove = vi.fn();
		callModal({ x: 100, y: 200 }, rename, remove);
		document.getElementById("modalRenameBtn").click();
		expect(rename).toHaveBeenCalledTimes(1);

		callModal({ x: 100, y: 200 }, vi.fn(), remove);
		document.getElementById("modalDeleteBtn").click();
		expect(remove).toHaveBeenCalledTimes(1);
	});

	it("callFamilyModal fires rename, add-word, and delete on separate opens", async () => {
		const { callFamilyModal } = await import("../modal.js");
		const rename = vi.fn();
		const addWord = vi.fn();
		const remove = vi.fn();
		callFamilyModal({ x: 10, y: 20 }, rename, addWord, remove);
		document.getElementById("familyModalRenameBtn").click();
		expect(rename).toHaveBeenCalledTimes(1);

		callFamilyModal({ x: 10, y: 20 }, vi.fn(), addWord, vi.fn());
		document.getElementById("familyModalAddWordBtn").click();
		expect(addWord).toHaveBeenCalledTimes(1);

		callFamilyModal({ x: 10, y: 20 }, vi.fn(), vi.fn(), remove);
		document.getElementById("familyModalDeleteBtn").click();
		expect(remove).toHaveBeenCalledTimes(1);
	});

	it("document-panel click closes modals", async () => {
		const { toggleModal, toggleFamilyModal } = await import("../modal.js");
		toggleModal(true);
		toggleFamilyModal(true);
		document.querySelector(".document-panel").click();
		const vis = document.querySelectorAll(".modal--visible");
		expect(vis.length).toBe(0);
	});
});
