import { insertElementAt, bindInlineEdit } from "../dom.js";
import { addEventToButton } from "../ui/AccordionView.js";
import { autocompleteWords } from "../state.js";
import { renderContextMenu } from "../ui/customContextMenu.js";

const addFormTemplate = document.getElementById("accordionAddForm");

const listTemplate = document.getElementById("accordion");
// Spawn a list and set its name
export const createAccordionElement = function (
	parent,
	listName,
	numberOfElements = "",
	creationDate = "",
	onAdd = null,
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
	const addBtn = parent.querySelector(".accordion__add-btn");
	const accordionPanel = parent.querySelector(".accordion__panel");
	const accordionContent = parent.querySelector(".accordion__content");
	creationDateElement.innerHTML = creationDate;
	accordionName.innerHTML = listName;
	wordCount.innerHTML = numberOfElements;
	btn.addEventListener("click", (e) => {
		e.stopPropagation();
		expandIcon.classList.toggle("expand-icon--open");
	});
	addEventToButton(btn);
	accordionItem.addEventListener("contextmenu", (e) => {
		e.preventDefault(); // bloque le menu natif du navigateur

		renderContextMenu([
			"Supprimer",
			() => {
				accordionItem.remove();
			},
		]);
	});
	bindInlineEdit(accordionItem, accordionName, () => {});

	// Inline add form (visible only when onAdd callback is provided)
	let addForm = null;
	if (onAdd) {
		addForm = addFormTemplate.content
			.cloneNode(true)
			.querySelector(".accordion__add-form");
		const addWordInput = addForm.querySelector(".accordion__add-input");
		const submitBtn = addForm.querySelector(".accordion__add-submit");

		const doSubmit = () => {
			const value = addWordInput.value.trim().toLowerCase();
			if (value) {
				onAdd(value, () => {
					addForm.classList.add("hidden");
					addWordInput.value = "";
				});
			}
		};

		submitBtn.addEventListener("click", doSubmit);
		addWordInput.addEventListener("keydown", (e) => {
			if (e.key === "Enter") doSubmit();
		});

		accordionPanel.insertBefore(addForm, accordionContent);
	}

	addBtn.addEventListener("click", (e) => {
		e.stopPropagation();
		if (addForm) {
			// Refresh the shared datalist with current words
			let datalist = document.getElementById("autocomplete-datalist");
			if (!datalist) {
				datalist = document.createElement("datalist");
				datalist.id = "autocomplete-datalist";
				document.body.appendChild(datalist);
			}
			datalist.innerHTML = "";
			autocompleteWords.forEach((word) => {
				const option = document.createElement("option");
				option.value = word;
				datalist.appendChild(option);
			});

			addForm.classList.toggle("hidden");
			if (!addForm.classList.contains("hidden")) {
				addForm.querySelector("input").value = "";
				addForm.querySelector("input").focus();
			}
		}
	});

	return accordionItem;
};
