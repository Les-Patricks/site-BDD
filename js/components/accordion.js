import { insertElementAt } from "../dom.js";
import { addEventToButton } from "../ui/AccordionView.js";
import { autocompleteWords } from "../state.js";
import { bindContextMenu } from "../ui/customContextMenu.js";

const addFormTemplate = document.getElementById("accordionAddForm");

const listTemplate = document.getElementById("accordion");
// Spawn a list and set its name
export const createAccordionElement = function (
	parent,
	listName,
	numberOfElements = "",
	creationDate = "",
	onDelete = null,
	onRename = null,
	onAdd = null,
) {
	const accordionItem = listTemplate.content
		.cloneNode(true)
		.querySelector(".accordion-item");
	insertElementAt(accordionItem, 0, parent);
	const btn = accordionItem.querySelector(".row-content");
	const expandIcon = parent.querySelector(".expand-icon");
	const accordionName = parent.querySelector(".accordion__button");
	const wordCount = parent.querySelector(".word-count");
	const creationDateElement = parent.querySelector(".creation-date");
	const accordionContent = parent.querySelector(".accordion__content");
	creationDateElement.textContent = creationDate;
	accordionName.textContent = listName;
	wordCount.textContent = numberOfElements;
	btn.addEventListener("click", (e) => {
		e.stopPropagation();
		expandIcon.classList.toggle("expand-icon--open");
	});
	addEventToButton(btn);
	// Inline add form (visible only when onAdd callback is provided)
	const form = addFormTemplate.content
		.cloneNode(true)
		.querySelector(".accordion__add-form");
	const input = form.querySelector(".accordion__input");
	const submitBtn = form.querySelector(".accordion__submit");
	if (onAdd) {
		accordionContent.before(form);
	}

	const editGroup = btn.querySelector(".edit-group");
	const validateBtn = btn.querySelector(".validate-btn");
	const editInput = btn.querySelector(".edit-input");

	const handleRenameSubmit = (e) => {
		e.stopPropagation();
		const newValue = editInput.value;
		onRename(newValue, () => {
			editGroup.classList.add("hidden");
			accordionName.classList.remove("hidden");
			accordionName.textContent = newValue;
		});
	};

	const handleAddSubmit = () => {
		const value = input.value.trim().toLowerCase();
		if (value) {
			onAdd(value, () => {
				form.classList.add("hidden");
				input.value = "";
			});
		}
	};
	validateBtn.addEventListener("click", handleRenameSubmit);
	editInput.addEventListener("keydown", (e) => {
		if (e.key === "Enter") { e.preventDefault(); handleRenameSubmit(e); }
	});
	submitBtn.addEventListener("click", handleAddSubmit);
	input.addEventListener("keydown", (e) => {
		if (e.key === "Enter") { e.preventDefault(); handleAddSubmit(); }
	});

	bindContextMenu(btn, () => {
		const contextData = [];
		if (onDelete) {
			contextData.push([
				"Supprimer",
				() => {
					onDelete(accordionItem);
					accordionItem.remove();
				},
			]);
		}
		if (onRename) {
			contextData.push([
				"Renommer",
				() => {
					editGroup.classList.remove("hidden");
					accordionName.classList.add("hidden");
					editInput.value = accordionName.textContent;
					editInput.focus();
				},
			]);
		}
		if (onAdd) {
			contextData.push([
				"Ajouter un mot",
				() => {
					let datalist = document.getElementById("autocomplete-datalist");
					if (!datalist) {
						datalist = document.createElement("datalist");
						datalist.id = "autocomplete-datalist";
						document.body.appendChild(datalist);
					}
					datalist.textContent = "";
					autocompleteWords.forEach((word) => {
						const option = document.createElement("option");
						option.value = word;
						datalist.appendChild(option);
					});

					form.classList.remove("hidden");
					form.querySelector("input").value = "";
					form.querySelector("input").focus();
				},
			]);
		}
		return contextData;
	});

	return accordionItem;
};
