const contextMenuTemplate = document.getElementById(
	"customContextMenuTemplate",
).content;

const contextMenuItemTemplate = document.getElementById(
	"customContextItemTemplate",
).content;

export const renderContextMenu = function (...btnData) {
	const contextMenu = contextMenuTemplate.cloneNode(true);
	contextMenu;
	const list = contextMenu.querySelector(".custom-context-menu__list");
	for (const [btnName, callback] of btnData) {
		const menuElement = contextMenuItemTemplate.cloneNode(true);
		const menuButton = menuElement.querySelector(".custom-context-menu__btn");
		menuButton.textContent = btnName;
		menuButton.addEventListener("click", callback);
		list.appendChild(menuElement);
	}
	//TODO: supprimer le context menu
	document.body.appendChild(contextMenu);
	return contextMenu;
};
