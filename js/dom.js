import { bindContextMenu } from "./ui/customContextMenu.js";

const languageItemTemplate = document.getElementById("languageItemTemplate");
const traductionItemTemplate = document.getElementById(
	"traductionItemTemplate",
);

export const createDOMElement = function (
	parent,
	index,
	tagName,
	content,
	className,
) {
	const element = document.createElement(tagName);
	if (tagName === "input") {
		element.placeholder = content;
	} else {
		element.textContent = content;
	}
	if (className) {
		element.classList.add(className);
	}
	insertElementAt(element, index, parent);
	return element;
};

export const insertElementAt = function (element, index, parent) {
	const directChildren = parent.children;
	if (directChildren.length == 0) {
		parent.appendChild(element);
	} else {
		if (index < 0) {
			index = directChildren.length + index + 1;
		}
		const selectedDirectChild = directChildren[index];
		if (selectedDirectChild) {
			selectedDirectChild.before(element);
		} else {
			parent.appendChild(element);
		}
	}
};

const bindEditableItemContextMenu = function (
	item,
	displayEl,
	onDelete = null,
	onRename = null,
	removeOnDelete = false,
) {
	const editGroup = item.querySelector(".edit-group");
	const validateBtn = item.querySelector(".validate-btn");
	const editInput = item.querySelector(".edit-input");

	const handleRenameSubmit = (e) => {
		e.stopPropagation();
		const newValue = editInput.value;
		onRename(newValue, () => {
			editGroup.classList.add("hidden");
			displayEl.classList.remove("hidden");
			displayEl.textContent = newValue;
		});
	};

	bindContextMenu(item, () => {
		const contextData = [];
		if (onDelete) {
			contextData.push([
				"Supprimer",
				() => {
					onDelete(item);
					if (removeOnDelete) {
						item.remove();
					} else {
						displayEl.textContent = "null";
					}
				},
			]);
		}
		if (onRename) {
			contextData.push([
				"Renommer",
				() => {
					editGroup.classList.toggle("hidden");
					displayEl.classList.toggle("hidden");
					editInput.value = displayEl.textContent;
					editInput.focus();
					validateBtn.removeEventListener("click", handleRenameSubmit);
					validateBtn.addEventListener("click", handleRenameSubmit, {
						once: true,
					});
				},
			]);
		}
		return contextData;
	});
};

export const createLanguageItem = function (
	parent,
	languageName,
	creationDate = "",
	onDelete = null,
	onRename = null,
) {
	const item = languageItemTemplate.content
		.cloneNode(true)
		.querySelector(".language-item");
	const nameEl = item.querySelector(".language-item__name");
	const dateEl = item.querySelector(".creation-date");

	nameEl.textContent = languageName;
	dateEl.textContent = creationDate;

	bindEditableItemContextMenu(item, nameEl, onDelete, onRename, true);
	parent.appendChild(item);
	return { item, nameEl };
};

export const createTraductionItem = function (
	parent,
	language,
	value,
	onDelete = null,
	onRename = null,
) {
	const item = traductionItemTemplate.content
		.cloneNode(true)
		.querySelector(".language-item");
	const labelEl = item.querySelector(".language-item__label");
	const valueEl = item.querySelector(".language-item__value");
	labelEl.textContent = `${language} : `;
	valueEl.textContent = value;

	bindEditableItemContextMenu(item, valueEl, onDelete, onRename, false);
	parent.appendChild(item);
	return { item, labelEl, valueEl };
};

// Spawn a word in the parent list and set its content
export const createTextElement = function (parentList, wordContent) {
	if (wordContent !== "") {
		const para = document.createElement("span");
		const node = document.createTextNode(wordContent);
		para.appendChild(node);
		insertElementAt(para, -1, parentList);
		return para;
	}
};

// Add event listners to all button spawned in the DOM
