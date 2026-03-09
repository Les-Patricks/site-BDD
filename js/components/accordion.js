import { insertElementAt } from "../dom.js";
import { addEventToButton } from "../ui/AccordionView.js";

const listTemplate = document.getElementById("listTemplate");
// Spawn a list and set its name
export const createAccordionElement = function (parent, listName) {
	const clonedList = listTemplate.content.cloneNode(true);
	const accordionBtn = clonedList.querySelector(".accordion__button");
	const accordionLabel = clonedList.querySelector(".accordion__open-label");
	const content = clonedList.querySelector(".accordion__content");

	// Générer un id unique pour cette instance
	const uniqueId = `accordionBtn-${crypto.randomUUID()}`;
	accordionBtn.id = uniqueId;
	accordionLabel.setAttribute("for", uniqueId);

	accordionBtn.innerHTML = listName;
	insertElementAt(clonedList, 0, parent);
	addEventToButton(accordionBtn);
	accordionBtn.addEventListener("click", (e) => {
		e.stopPropagation();
		accordionLabel.classList.toggle("accordion__open-label--open");
	});
	return content;
};
