import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Ticket 10 — tests contrat notify (alignes sur `plan_technique.md` — decisions arretees).
 * Restent en echec tant que `js/notify.js` n'est pas implemente (phase Red / jusqu'a Green).
 */

/** Durees documentees dans le plan : success generique 4 s, warning 6 s, save success 2,5 s (option). */
const MS_SUCCESS_DEFAULT = 4_000;
const MS_WARNING_DEFAULT = 6_000;
const MS_SAVE_SUCCESS = 2_500;

function installMinimalDocument() {
	const makeEl = (tag) => {
		const el = {
			tagName: String(tag).toUpperCase(),
			className: "",
			textContent: "",
			innerHTML: "",
			style: {},
			attributes: {},
			parentNode: null,
			children: [],
			_listeners: {},
			setAttribute(name, value) {
				this.attributes[name] = String(value);
			},
			getAttribute(name) {
				return this.attributes[name] ?? null;
			},
			appendChild(child) {
				child.parentNode = this;
				this.children.push(child);
				return child;
			},
			addEventListener(type, fn) {
				if (!this._listeners[type]) {
					this._listeners[type] = [];
				}
				this._listeners[type].push(fn);
			},
			dispatchEvent(event) {
				const type = event?.type ?? "click";
				for (const fn of this._listeners[type] ?? []) {
					fn(event);
				}
			},
			remove: vi.fn(function remove() {
				if (this.parentNode) {
					const i = this.parentNode.children.indexOf(this);
					if (i !== -1) {
						this.parentNode.children.splice(i, 1);
					}
					this.parentNode = null;
				}
			}),
		};
		return el;
	};

	const body = makeEl("body");
	globalThis.document = {
		body,
		head: makeEl("head"),
		createElement: (tag) => makeEl(tag),
		querySelector: () => null,
	};
	return { body };
}

function collectTextNodes(el, acc = []) {
	if (el.textContent) {
		acc.push(el.textContent);
	}
	for (const c of el.children ?? []) {
		collectTextNodes(c, acc);
	}
	return acc;
}

function findDeep(root, predicate) {
	if (!root) {
		return null;
	}
	if (predicate(root)) {
		return root;
	}
	for (const c of root.children ?? []) {
		const found = findDeep(c, predicate);
		if (found) {
			return found;
		}
	}
	return null;
}

describe("ticket_10 notify module", () => {
	let teardownDom;

	beforeEach(() => {
		teardownDom = installMinimalDocument();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		delete globalThis.document;
		vi.resetModules();
	});

	it("CA-1001: expose notify.success, notify.warning, notify.error et une fonction show commune", async () => {
		const { notify } = await import("../notify.js");
		expect(notify).toBeTruthy();
		expect(typeof notify.success).toBe("function");
		expect(typeof notify.warning).toBe("function");
		expect(typeof notify.error).toBe("function");
		expect(typeof notify.show).toBe("function");
	});

	it("CA-1005: success (defaut plan) affiche le message puis auto-dismiss apres 4 s", async () => {
		const { notify } = await import("../notify.js");
		notify.success("ok");
		const { body } = teardownDom;
		expect(body.children.length).toBeGreaterThan(0);
		const region = body.children[body.children.length - 1];
		expect(collectTextNodes(region).join(" ")).toContain("ok");
		vi.advanceTimersByTime(MS_SUCCESS_DEFAULT);
		expect(region.children.length === 0 || body.children.length === 0).toBe(true);
	});

	it("CA-1005: success avec durationMs 2500 (chemin type save) disparait apres 2,5 s", async () => {
		const { notify } = await import("../notify.js");
		notify.success("Enregistre", { durationMs: MS_SAVE_SUCCESS });
		const { body } = teardownDom;
		const region = body.children[body.children.length - 1];
		expect(collectTextNodes(region).join(" ")).toContain("Enregistre");
		vi.advanceTimersByTime(MS_SAVE_SUCCESS - 1);
		expect(region.children.length).toBeGreaterThan(0);
		vi.advanceTimersByTime(1);
		expect(region.children.length === 0 || body.children.length === 0).toBe(true);
	});

	it("CA-1005: warning (defaut plan) auto-dismiss apres 6 s", async () => {
		const { notify } = await import("../notify.js");
		notify.warning("attention");
		const { body } = teardownDom;
		const region = body.children[body.children.length - 1];
		expect(collectTextNodes(region).join(" ")).toContain("attention");
		vi.advanceTimersByTime(MS_WARNING_DEFAULT);
		expect(region.children.length === 0 || body.children.length === 0).toBe(true);
	});

	it("CA-1004: error utilise role alert et aria-live assertive sur l'item", async () => {
		const { notify } = await import("../notify.js");
		notify.error("echec");
		const { body } = teardownDom;
		const region = body.children[body.children.length - 1];
		const item = findDeep(region, (n) => n.getAttribute?.("role") === "alert");
		expect(item).toBeTruthy();
		expect(item.getAttribute("aria-live")).toBe("assertive");
	});

	it("CA-1004: error reste affichee sans auto-dismiss (meme apres un long delai)", async () => {
		const { notify } = await import("../notify.js");
		notify.error("persiste");
		const { body } = teardownDom;
		const region = body.children[body.children.length - 1];
		const item = findDeep(region, (n) => n.getAttribute?.("role") === "alert");
		expect(item).toBeTruthy();
		vi.advanceTimersByTime(120_000);
		const itemAfter = findDeep(region, (n) => n.getAttribute?.("role") === "alert");
		expect(itemAfter).toBeTruthy();
		expect(collectTextNodes(itemAfter).join(" ")).toContain("persiste");
	});

	it("CA-1004: error propose un bouton Fermer avec aria-label ; clic retire la notification", async () => {
		const { notify } = await import("../notify.js");
		notify.error("a fermer");
		const { body } = teardownDom;
		const region = body.children[body.children.length - 1];
		const closeBtn = findDeep(
			region,
			(n) => n.tagName === "BUTTON" && /fermer|close/i.test(n.getAttribute("aria-label") ?? ""),
		);
		expect(closeBtn).toBeTruthy();
		closeBtn.dispatchEvent({ type: "click" });
		const itemAfter = findDeep(region, (n) => n.getAttribute?.("role") === "alert");
		expect(itemAfter).toBeNull();
	});

	it("CA-1006: notify ne delegue pas a window.alert", async () => {
		const alertSpy = vi.fn();
		vi.stubGlobal("alert", alertSpy);
		const { notify } = await import("../notify.js");
		notify.error("x");
		notify.success("y");
		notify.warning("z");
		expect(alertSpy).not.toHaveBeenCalled();
	});
});
