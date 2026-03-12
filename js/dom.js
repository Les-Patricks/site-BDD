import { callModal, callFamilyModal } from "./modal.js";
import { autocompleteWords } from "./state.js";

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
		element.innerHTML = content;
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
			parent.insertBefore(element, selectedDirectChild);
		} else {
			parent.appendChild(element);
		}
	}
};

export const bindInlineEdit = function (item, displayEl, onSave) {
	const editBtn = item.querySelector(".accordion__edit-btn");
	const editInput = item.querySelector(".edit-input");
	const editGroup = item.querySelector(".edit-group");
	const validateBtn = item.querySelector(".validate-btn");

	item.addEventListener("mouseenter", () => editBtn.classList.remove("hidden"));
	item.addEventListener("mouseleave", () => editBtn.classList.add("hidden"));

	editBtn.addEventListener("click", (e) => {
		e.stopPropagation();
		editGroup.classList.toggle("hidden");
		displayEl.classList.toggle("hidden");
		editInput.value = displayEl.textContent;
		editInput.focus();
	});

	validateBtn.addEventListener("click", (e) => {
		e.stopPropagation();
		const newValue = editInput.value;
		editGroup.classList.add("hidden");
		displayEl.classList.remove("hidden");
		displayEl.textContent = newValue;
		onSave(newValue);
	});
};

export const createLanguageItem = function (
	parent,
	languageName,
	onSave = () => {},
	creationDate = "",
) {
	const item = languageItemTemplate.content
		.cloneNode(true)
		.querySelector(".language-item");
	const nameEl = item.querySelector(".language-item__name");
	const dateEl = item.querySelector(".creation-date");
	nameEl.textContent = languageName;
	dateEl.textContent = creationDate;
	bindInlineEdit(item, nameEl, onSave);
	parent.appendChild(item);
	return { item, nameEl };
};

export const createTraductionItem = function (
	parent,
	language,
	value,
	onSave = () => {},
) {
	const item = traductionItemTemplate.content
		.cloneNode(true)
		.querySelector(".language-item");
	const labelEl = item.querySelector(".language-item__label");
	const valueEl = item.querySelector(".language-item__value");
	labelEl.textContent = `${language} : `;
	valueEl.textContent = value;
	bindInlineEdit(item, valueEl, onSave);
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
