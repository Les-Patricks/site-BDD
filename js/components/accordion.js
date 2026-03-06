import { insertElementAt, addEventToButton } from "../dom.js";

// Spawn a list and set its name
export const createAccordionElement = function (parent, listName) {
	const clonedList = listTemplate.content.cloneNode(true);
	const accordionBtn = clonedList.querySelector(".accordion__button");
	const content = clonedList.querySelector(".accordion__content");
	accordionBtn.innerHTML = listName;
	insertElementAt(clonedList, 0, parent);
	addEventToButton(accordionBtn);
	return content;
};
