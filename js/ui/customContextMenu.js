const contextMenuItemTemplate = document.getElementById(
	"customContextItemTemplate",
).content;

const contextMenu = document.getElementById("customContextMenuTemplate");

export const renderContextMenu = function (e, ...btnData) {
	contextMenu.style.left = `${e.clientX}px`;
	contextMenu.style.top = `${e.clientY}px`;
	contextMenu.classList.remove("hidden");
	const list = contextMenu.querySelector(".custom-context-menu__list");
	list.textContent = ""; // Clear previous menu items
	for (const [btnName, callback] of btnData) {
		const menuElement = contextMenuItemTemplate.cloneNode(true);
		const menuButton = menuElement.querySelector(".custom-context-menu__btn");
		menuButton.textContent = btnName;
		menuButton.addEventListener("click", (evt) => {
			contextMenu.classList.add("hidden");
			document.removeEventListener("click", closeMenu, { capture: true });
			callback(evt);
		});
		list.appendChild(menuElement);
	}
	const closeMenu = (e) => {
		if (!contextMenu.contains(e.target)) {
			contextMenu.classList.add("hidden");
			// On retire l'écouteur d'événement uniquement quand le menu se ferme
			document.removeEventListener("click", closeMenu, { capture: true });
		}
	};

	setTimeout(() => {
		document.addEventListener("click", closeMenu, { capture: true });
	}, 0);

	document.body.appendChild(contextMenu);
	return contextMenu;
};

export const bindContextMenu = function (target, buildContextData) {
	target.addEventListener("contextmenu", (e) => {
		e.preventDefault();
		const contextData = (buildContextData(e) || []).filter(
			([label, callback]) => Boolean(label) && typeof callback === "function",
		);
		if (contextData.length > 0) {
			renderContextMenu(e, ...contextData);
		}
	});
};
