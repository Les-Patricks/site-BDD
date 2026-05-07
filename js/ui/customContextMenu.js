const contextMenuItemTemplate = document.getElementById(
	"customContextItemTemplate",
).content;

const contextMenu = document.getElementById("customContextMenuTemplate");

let contextMenuTriggerEl = null;
let contextMenuKeydownHandler = null;

function closeContextMenu() {
	contextMenu.classList.add("hidden");
	if (contextMenuKeydownHandler) {
		document.removeEventListener("keydown", contextMenuKeydownHandler);
		contextMenuKeydownHandler = null;
	}
	if (contextMenuTriggerEl) {
		contextMenuTriggerEl.setAttribute("aria-expanded", "false");
		contextMenuTriggerEl.focus();
		contextMenuTriggerEl = null;
	}
}

export const renderContextMenu = function (positionSource, triggerElOrFirstItem, ...rest) {
	let triggerEl = null;
	let btnData;
	if (triggerElOrFirstItem instanceof Element || triggerElOrFirstItem === null || triggerElOrFirstItem === undefined) {
		triggerEl = triggerElOrFirstItem ?? null;
		btnData = rest;
	} else {
		btnData = [triggerElOrFirstItem, ...rest];
	}

	contextMenuTriggerEl = triggerEl;
	contextMenu.style.left = `${positionSource.clientX}px`;
	contextMenu.style.top = `${positionSource.clientY}px`;
	contextMenu.classList.remove("hidden");
	triggerEl?.setAttribute("aria-expanded", "true");

	const list = contextMenu.querySelector(".custom-context-menu__list");
	list.textContent = "";
	const buttons = [];

	for (const [btnName, callback] of btnData) {
		const menuElement = contextMenuItemTemplate.cloneNode(true);
		const menuButton = menuElement.querySelector(".custom-context-menu__btn");
		menuButton.textContent = btnName;
		menuButton.addEventListener("click", () => {
			closeContextMenu();
			callback();
		});
		list.appendChild(menuElement);
		buttons.push(menuButton);
	}

	buttons[0]?.focus();

	if (contextMenuKeydownHandler) {
		document.removeEventListener("keydown", contextMenuKeydownHandler);
	}
	contextMenuKeydownHandler = (e) => {
		const idx = buttons.indexOf(document.activeElement);
		if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
			e.preventDefault();
			buttons[(idx + 1) % buttons.length]?.focus();
		} else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
			e.preventDefault();
			buttons[(idx - 1 + buttons.length) % buttons.length]?.focus();
		} else if (e.key === "Escape") {
			e.preventDefault();
			closeContextMenu();
		}
	};
	document.addEventListener("keydown", contextMenuKeydownHandler);

	const closeMenu = (e) => {
		if (!contextMenu.contains(e.target)) {
			closeContextMenu();
			document.removeEventListener("click", closeMenu, { capture: true });
		}
	};
	setTimeout(() => {
		document.addEventListener("click", closeMenu, { capture: true });
	}, 0);

	document.body.appendChild(contextMenu);

	const rect = contextMenu.getBoundingClientRect();
	if (rect.right > window.innerWidth) {
		contextMenu.style.left = `${Math.max(0, window.innerWidth - rect.width)}px`;
	}
	if (rect.bottom > window.innerHeight) {
		contextMenu.style.top = `${Math.max(0, window.innerHeight - rect.height)}px`;
	}

	return contextMenu;
};

export const bindContextMenu = function (target, buildContextData) {
	target.addEventListener("contextmenu", (e) => {
		e.preventDefault();
		const contextData = (buildContextData(e) || []).filter(
			([label, callback]) => Boolean(label) && typeof callback === "function",
		);
		if (contextData.length > 0) {
			renderContextMenu(e, null, ...contextData);
		}
	});

	const actionsBtn = target.querySelector(".actions-btn");
	if (actionsBtn) {
		actionsBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			const contextData = (buildContextData(e) || []).filter(
				([label, callback]) => Boolean(label) && typeof callback === "function",
			);
			if (contextData.length === 0) return;
			const rect = actionsBtn.getBoundingClientRect();
			renderContextMenu(
				{ clientX: rect.left, clientY: rect.bottom },
				actionsBtn,
				...contextData,
			);
		});
	}
};
