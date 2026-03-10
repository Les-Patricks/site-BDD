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

export const createEditBtn = function (parent, editValue, removeEvent, submit) {
	// const template = document.getElementById("editSystemTemplate");
	// const clone = template.content.cloneNode(true);
	// const editBtn = clone.querySelector(".edit-system__edit-btn");
	// const input = clone.querySelector(".edit-system__input");
	// const submitBtn = clone.querySelector(".edit-system__submit-btn");
	// const deleteBtn = clone.querySelector(".edit-system__delete-btn");
	// input.hidden = true;
	// submitBtn.hidden = true;
	// editBtn.addEventListener("click", () => {
	// 	input.value = editValue;
	// 	editBtn.hidden = true;
	// 	input.hidden = false;
	// 	submitBtn.hidden = false;
	// 	input.focus();
	// });
	// submitBtn.addEventListener("click", () => {
	// 	submit(input.value);
	// 	// reset UI
	// 	editBtn.hidden = false;
	// 	input.hidden = true;
	// 	submitBtn.hidden = true;
	// });
	// deleteBtn.addEventListener("click", removeEvent);
	// parent.appendChild(clone);
};

// Creer une fonction pour ajouter un bouton pour ajouter un mot à une famille

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
