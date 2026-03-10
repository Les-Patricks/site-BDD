import { insertElementAt } from "../dom.js";
import { addEventToButton } from "../ui/AccordionView.js";

const listTemplate = document.getElementById("accordion");
// Spawn a list and set its name
export const createAccordionElement = function (
	parent,
	listName,
	numberOfElements = "",
	creationDate = "",
) {
	const accordionItem = listTemplate.content
		.cloneNode(true)
		.querySelector(".accordion-item");
	insertElementAt(accordionItem, 0, parent);
	const btn = parent.querySelector(".row-content");
	const expandIcon = parent.querySelector(".expand-icon");
	const accordionName = parent.querySelector(".accordion__button");
	const wordCount = parent.querySelector(".word-count");
	const creationDateElement = parent.querySelector(".creation-date");
	const editBtn = parent.querySelector(".accordion__edit-btn");
	const addBtn = parent.querySelector(".accordion__add-btn");
	const editInput = parent.querySelector(".edit-input");
	const editGroup = parent.querySelector(".edit-group");
	const validateBtn = parent.querySelector(".validate-btn");
	creationDateElement.innerHTML = creationDate;
	accordionName.innerHTML = listName;
	wordCount.innerHTML = numberOfElements;
	btn.addEventListener("click", (e) => {
		e.stopPropagation();
		expandIcon.classList.toggle("expand-icon--open");
	});
	addEventToButton(btn);
	accordionItem.addEventListener("mouseenter", () => {
		editBtn.classList.remove("hidden");
	});
	accordionItem.addEventListener("mouseleave", () => {
		editBtn.classList.add("hidden");
	});
	editBtn.addEventListener("click", (e) => {
		e.stopPropagation();
		editGroup.classList.toggle("hidden");
		accordionName.classList.toggle("hidden");
		editInput.value = accordionName.innerHTML;
		editInput.focus();
	});
	validateBtn.addEventListener("click", (e) => {
		e.stopPropagation();
		editGroup.classList.add("hidden");
		accordionName.classList.remove("hidden");
		accordionName.innerHTML = editInput.value;
	});

	return accordionItem;
};
