import { callModal, callFamilyModal } from "./modal.js";
import { autocompleteWords } from "./state.js";

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

export const createEditBtn = function (
	parent,
	editIndex,
	editValue,
	toggleEvent,
	removeEvent,
	submit,
) {
	const submitBtn = createDOMElement(
		parent,
		editIndex,
		"button",
		"Submit",
		"accordion__submit-btn",
	);
	const editInput = createDOMElement(
		parent,
		editIndex,
		"input",
		"",
		"accordion__input",
	);
	const editBtn = createDOMElement(
		parent,
		editIndex,
		"button",
		"Edit",
		"accordion__edit-btn",
	);
	const toggleEditThings = function () {
		editInput.classList.toggle("accordion__input--visible");
		editBtn.classList.toggle("accordion__edit-btn--hidden");
		submitBtn.classList.toggle("accordion__submit-btn--visible");
		toggleEvent();
	};
	submitBtn.addEventListener("click", () => {
		submit(editInput.value);
		toggleEditThings();
	});
	editBtn.addEventListener("click", () => {
		const rect = editBtn.getBoundingClientRect();
		callModal(
			{ x: rect.right, y: rect.top },
			() => {
				editInput.value = editValue;
				toggleEditThings();
				editInput.focus();
				editInput.select();
			},
			removeEvent,
		);
	});
};

export const createFamilyEditBtn = function (
	parent,
	editIndex,
	editValue,
	toggleEvent,
	removeEvent,
	submit,
	addWordEvent,
) {
	const submitBtn = createDOMElement(
		parent,
		editIndex,
		"button",
		"Submit",
		"accordion__submit-btn",
	);
	const editInput = createDOMElement(
		parent,
		editIndex,
		"input",
		"",
		"accordion__input",
	);
	const addWordSubmitBtn = createDOMElement(
		parent,
		editIndex,
		"button",
		"Submit",
		"accordion__submit-btn",
	);
	const addWordInput = createDOMElement(
		parent,
		editIndex,
		"input",
		"",
		"accordion__input",
	);
	const autoCompleteList = createDOMElement(
		parent,
		editIndex,
		"ul",
		"",
		"accordion__autocomplete-list",
	);
	const editBtn = createDOMElement(
		parent,
		editIndex,
		"button",
		"Edit",
		"accordion__edit-btn",
	);
	addWordInput.addEventListener("keyup", () => {
		const value = addWordInput.value.trim().toLowerCase();
		autoCompleteList.innerHTML = "";
		if (value) {
			autocompleteWords.forEach((word) => {
				if (word.includes(value)) {
					const li = createDOMElement(
						autoCompleteList,
						-1,
						"li",
						word,
						"accordion__autocomplete-list-item",
					);
					//Width of the autocomplete list should be the same as the input
					autoCompleteList.style.width = addWordInput.offsetWidth + "px";
					autoCompleteList.style.left = addWordInput.offsetLeft + "px";
					li.addEventListener("click", () => {
						addWordInput.value = word;
						autoCompleteList.innerHTML = "";
						addWordInput.focus();
						addWordInput.select();
					});
				}
			});
		}
	});
	const toggleEditThings = function () {
		editInput.classList.toggle("accordion__input--visible");
		editBtn.classList.toggle("accordion__edit-btn--hidden");
		submitBtn.classList.toggle("accordion__submit-btn--visible");
		toggleEvent();
	};
	const toggleAddWordThings = function () {
		addWordInput.classList.toggle("accordion__input--visible");
		editBtn.classList.toggle("accordion__edit-btn--hidden");
		addWordSubmitBtn.classList.toggle("accordion__submit-btn--visible");
		toggleEvent();
	};
	submitBtn.addEventListener("click", () => {
		submit(editInput.value);
		toggleEditThings();
	});
	addWordSubmitBtn.addEventListener("click", () => {
		addWordEvent(addWordInput.value);
		toggleAddWordThings();
	});
	editBtn.addEventListener("click", () => {
		const rect = editBtn.getBoundingClientRect();
		callFamilyModal(
			{ x: rect.right, y: rect.top },
			() => {
				editInput.value = editValue;
				toggleEditThings();
				editInput.focus();
				editInput.select();
			},
			() => {
				addWordInput.value = "";
				toggleAddWordThings();
				addWordInput.focus();
			},
			removeEvent,
		);
	});
};

// Spawn a word in the parent list and set its content
export const createTextElement = function (parentList, wordContent) {
	if (wordContent !== "") {
		const para = document.createElement("span");
		const node = document.createTextNode(wordContent);
		para.appendChild(node);
		insertElementAt(para, -1, parentList);
		para.className += "word";
		return para;
	}
};

// Add event listners to all button spawned in the DOM
