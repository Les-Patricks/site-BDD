/**
 * Notifications toast non bloquantes.
 */

const MS_SUCCESS_DEFAULT = 4_000;
const MS_WARNING_DEFAULT = 6_000;

let rootEl = null;

function getRoot() {
	if (typeof document === "undefined" || !document.body) {
		return null;
	}
	if (rootEl && rootEl.parentNode) {
		return rootEl;
	}
	const el = document.createElement("div");
	el.className = "notify";
	el.setAttribute("aria-live", "polite");
	el.setAttribute("aria-relevant", "additions text");
	document.body.appendChild(el);
	rootEl = el;
	return rootEl;
}

/**
 * @param {{ type: 'success' | 'warning' | 'error', message: string, durationMs?: number }} opts
 */
function show(opts) {
	const { type, message } = opts;
	const root = getRoot();
	if (!root) {
		return;
	}
	const item = document.createElement("div");
	item.className = `notify__item notify--${type}`;

	const msgEl = document.createElement("span");
	msgEl.className = "notify__message";
	msgEl.textContent = String(message);
	item.appendChild(msgEl);

	let timeoutId = null;

	if (type === "error") {
		item.setAttribute("role", "alert");
		item.setAttribute("aria-live", "assertive");
		const btn = document.createElement("button");
		btn.type = "button";
		btn.className = "notify__close";
		btn.setAttribute("aria-label", "Fermer");
		btn.textContent = "\u00D7";
		btn.addEventListener("click", () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
			item.remove();
		});
		item.appendChild(btn);
	} else {
		item.setAttribute("role", "status");
		item.setAttribute("aria-live", "polite");
		const ms =
			type === "success"
				? (opts.durationMs ?? MS_SUCCESS_DEFAULT)
				: (opts.durationMs ?? MS_WARNING_DEFAULT);
		timeoutId = setTimeout(() => {
			item.remove();
		}, ms);
	}

	root.appendChild(item);
}

export const notify = {
	show,
	success(message, options = {}) {
		show({ type: "success", message, ...options });
	},
	warning(message, options = {}) {
		show({ type: "warning", message, ...options });
	},
	error(message, options = {}) {
		show({ type: "error", message, ...options });
	},
};
