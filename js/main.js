// ===== SETUP OF DOM =====
// Tabs buttons
const wordFamilyBtn = document.getElementById("wordFamilyBtn");
const wordBtn = document.getElementById("wordBtn");
const languagesBtn = document.getElementById("languagesBtn");

// Templates
const listTemplate = document.getElementById("listTemplate");
const addSystemTemplate = document.getElementById("addSystemTemplate");

// Tabs
const wordFamilyTab = document.getElementById("wordFamilyTab");
const wordTab = document.getElementById("wordTab");
const languageTab = document.getElementById("languageTab");
const allTabs = document.querySelectorAll(".tab-panel");

// Contents
const wordFamilyContent = wordFamilyTab.querySelector(".tab-panel__content");
let wordContent = wordTab.querySelector(".tab-panel__content");
let languageContent = languageTab.querySelector(".tab-panel__content");

// Word tab related stuff
const addWordBtn = wordTab.querySelector(".tab-panel__button");
const addWordLabel = wordTab.querySelector(".tab-panel__label");
const addWordInput = document.getElementById("addWordInput");
const submitBtn = wordTab.querySelector(".tab-panel__submit-button");
// ==========
const modal = document.querySelector(".modal");
let modalRenameBtn = document.getElementById("modalRenameBtn");
let modalDeleteBtn = document.getElementById("modalDeleteBtn");
const closePanel = document.querySelector(".document-panel");

// Conteneur
const wordKeys = new Set();
const familyKeys = new Set();
const languageKeys = new Set(["en", "fr"]);
const traductions = {};

wordFamilyBtn.addEventListener("click", () => openTab(wordFamilyTab));
wordBtn.addEventListener("click", () => {
	openTab(wordTab);
	updateWords();
});
languagesBtn.addEventListener("click", () => {
	openTab(languageTab);
	updateLanguages();
});

function openTab(currentTab) {
	currentTab.classList.add("tab-panel--open");
	allTabs.forEach((tab) => {
		if (tab !== currentTab) {
			tab.classList.remove("tab-panel--open");
		}
	});
}
openTab(wordTab);

const createDOMElement = function (parent, index, tagName, content, className) {
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

// Créer une fonction pour créer système d'ajout (add system)
const createAddSystem = function (
	parent,
	labelName,
	submitEvent,
	...inputNames
) {
	const clonedAddSystem = addSystemTemplate.content.cloneNode(true);
	const addPanel = clonedAddSystem.querySelector(".add-panel");
	const inputPanel = clonedAddSystem.querySelector(".add-panel__inputs");
	const addBtn = clonedAddSystem.querySelector(".add-panel__button");
	const addLabel = clonedAddSystem.querySelector(".add-panel__label");
	const submitBtn = clonedAddSystem.querySelector(".add-panel__submit-button");
	const inputContainer = clonedAddSystem.querySelector(".add-panel__inputs");
	const uniqueAddBtnId = `input-${Date.now()}-${Math.random().toString(36).slice(2)}`;

	// Create unique id and link the label to the button
	addBtn.id = uniqueAddBtnId;
	addLabel.innerHTML = labelName;
	addLabel.htmlFor = uniqueAddBtnId;
	const inputs = [];
	inputNames.forEach((inputName) => {
		const input = document.createElement("input");
		const uniqueId = `input-${Date.now()}-${Math.random().toString(36).slice(2)}`;
		input.id = uniqueId;
		input.type = "text";
		input.placeholder = inputName;
		input.classList.add("add-panel__input");
		inputPanel.appendChild(input);
		inputs.push(input);
	});
	for (let i = 0; i < inputs.length - 1; i++) {
		const input = inputs[i];
		input.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				const nextInput = inputs[i + 1];
				nextInput.focus();
				nextInput.select();
			}
		});
		input.addEventListener("keydown", (e) => {
			if (e.key === "Escape") {
				toggle();
			}
		});
	}
	inputs[inputs.length - 1].addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			submitEvent(...inputs.map((input) => input.value.trim()));
			toggle();
		}
	});
	inputs[inputs.length - 1].addEventListener("keydown", (e) => {
		if (e.key === "Escape") {
			toggle();
		}
	});
	const toggle = function () {
		addBtn.classList.toggle("add-panel__button--hidden");
		addLabel.classList.toggle("add-panel__label--hidden");
		submitBtn.classList.toggle("add-panel__submit-button--visible");
		inputContainer.classList.toggle("add-panel__inputs--visible");
		inputs.forEach((input) => {
			input.value = "";
		});
	};
	addBtn.addEventListener("click", () => {
		toggle();
		inputs[0].focus();
		inputs[0].select();
	});
	submitBtn.addEventListener("click", () => {
		submitEvent(...inputs.map((input) => input.value.trim()));
		toggle();
	});
	parent.appendChild(clonedAddSystem);
	return addPanel;
};

const insertElementAt = function (element, index, parent) {
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

const callModal = function (position, renameEvent, removeEvent) {
	toggleModal(true);
	modal.style.insetInlineStart = position.x + "px";
	modal.style.insetBlockStart = position.y - modal.offsetHeight + "px";
	modalRenameBtn.addEventListener("click", () => {
		renameEvent();
		toggleModal(false);
	});
	modalDeleteBtn.addEventListener("click", () => {
		toggleModal();
		removeEvent();
	});
};

const toggleModal = function (state) {
	if (state) {
		modal.classList.add("modal--visible");
		closePanel.classList.add("document-panel--visible");
	} else {
		console.log("nuked");
		modal.classList.remove("modal--visible");
		closePanel.classList.remove("document-panel--visible");
		const newRenameBtn = modalRenameBtn.cloneNode(true);
		modalRenameBtn.replaceWith(newRenameBtn);
		modalRenameBtn = newRenameBtn;

		const newDeleteBtn = modalDeleteBtn.cloneNode(true);
		modalDeleteBtn.replaceWith(newDeleteBtn);
		modalDeleteBtn = newDeleteBtn;
	}
};
closePanel.addEventListener("click", () => {
	toggleModal(false);
});

// Spawn a list and set its name
const createAccordionElement = function (parent, listName) {
	const clonedList = listTemplate.content.cloneNode(true);
	const accordion = clonedList.querySelector(".accordion");
	const accordionBtn = clonedList.querySelector(".accordion__button");
	const editBtn = clonedList.querySelector(".accordion__edit-button");
	const editInput = clonedList.querySelector(".accordion__edit-input");
	const submitEditBtn = clonedList.querySelector(
		".accordion__submit-edit-button",
	);
	const content = clonedList.querySelector(".accordion__content");
	accordionBtn.innerHTML = listName;

	// const toggleEditionThings = function () {
	// 	editInput.classList.toggle("accordion__edit-input--visible");
	// 	accordionBtn.classList.toggle("accordion__button--hidden");
	// 	submitEditBtn.classList.toggle("accordion__submit-edit-button--visible");
	// 	editInput.value = accordionBtn.innerHTML;
	// 	editBtn.classList.toggle("accordion__edit-button--hidden");
	// };

	// submitEditBtn.addEventListener("click", () => {
	// 	replaceWord(accordionBtn.innerHTML, editInput.value, () => {
	// 		accordionBtn.innerHTML = editInput.value;
	// 	});
	// 	toggleEditionThings();
	// });

	// editBtn.addEventListener("click", () => {
	// 	const rect = editBtn.getBoundingClientRect();
	// 	callModal(
	// 		{ x: rect.right, y: rect.top },
	// 		() => {
	// 			toggleEditionThings();
	// 			editInput.select();
	// 			editInput.focus();
	// 		},
	// 		() => {
	// 			removeWord(accordionBtn.innerHTML);
	// 			accordion.remove();
	// 		},
	// 	);
	// });
	insertElementAt(clonedList, 0, parent);
	addEventToButton(accordionBtn);
	return content;
};

// Adds a new word to the wordKeys and return if it was added or not
const createWord = function (wordContent, successEvent) {
	const added = !wordKeys.has(wordContent);
	wordKeys.add(wordContent);
	if (added) {
		successEvent();
	} else {
		alert("The key already exist");
	}
};

const removeWord = function (word) {
	wordKeys.delete(word);
};

const replaceWord = function (wordToReplace, wordToReplaceBy, successEvent) {
	wordKeys.delete(wordToReplace);
	createWord(wordToReplaceBy, successEvent);
};

// Spawn a word in the parent list and set its content
const createTextElement = function (parentList, wordContent) {
	if (wordContent !== "") {
		const para = document.createElement("span");
		const node = document.createTextNode(wordContent);
		para.appendChild(node);
		insertElementAt(para, -1, parentList);
		para.className += "word";
		return para;
	}
};

const addEventToButton = function (btn) {
	btn.addEventListener("click", function (e) {
		e.stopPropagation();
		const panel = btn.parentNode.querySelector(".accordion__panel");
		panel.classList.toggle("accordion__panel--open");
	});
};

// Add event listners to all button spawned in the DOM
const updateBtns = function () {
	document.querySelectorAll(".accordion__button").forEach((btn) => {
		addEventToButton(btn);
	});
};

const toggleAddSystem = function () {
	addWordBtn.classList.toggle("tab-panel__button--hidden");
	addWordLabel.classList.toggle("tab-panel__label--hidden");
	addWordInput.classList.toggle("tab-panel__input--visible");
	submitBtn.classList.toggle("tab-panel__submit-button--visible");
	addWordInput.value = "";
};

const addWord = function (value) {
	const listObject = createAccordionElement(wordContent, value, 0);
	const accordion =
		listObject.parentNode.parentNode.querySelector(".accordion");
	const accordionBtn =
		listObject.parentNode.parentNode.querySelector(".accordion__button");
	createEditBtn(
		listObject.parentNode.parentNode,
		1,
		accordionBtn.innerHTML,
		() => {
			accordionBtn.classList.toggle("accordion__button--hidden");
		},
		() => {
			removeWord(accordionBtn.innerHTML);
			accordion.remove();
		},
		(submitValue) => {
			replaceWord(accordionBtn.innerHTML, submitValue, () => {
				accordionBtn.innerHTML = submitValue;
			});
		},
	);
	if (!traductions[value]) {
		traductions[value] = {};
		console.log("nnuked");
	}
	languageKeys.forEach((language) => {
		if (!traductions[value][language]) {
			traductions[value][language] = "null";
		}
		const div = createDOMElement(listObject, 1, "div", "", "");
		const textElement = createTextElement(div, `${language} : `);
		const textValue = createDOMElement(
			textElement,
			-1,
			"text",
			traductions[value][language],
			"accordion__value",
		);
		createEditBtn(
			textElement,
			1,
			textValue.innerHTML,
			() => {
				textValue.classList.toggle("accordion__value--hidden");
			},
			() => {
				textValue.innerHTML = traductions[value][language];
			},
			(submitValue) => {
				textValue.innerHTML = submitValue;
				traductions[value][language] = submitValue;
			},
		);
	});
};

const updateWords = function () {
	const newWordContent = wordContent.cloneNode();
	wordContent.replaceWith(newWordContent);
	wordContent = newWordContent;
	wordKeys.forEach((word) => {
		addWord(word);
	});
};

const submitAddingWord = function () {
	const value = addWordInput.value.trim().toLowerCase();
	if (value) {
		createWord(value, () => {
			addWord(value);
		});
	}
};

addWordBtn.addEventListener("click", (e) => {
	e.stopPropagation();
	toggleAddSystem();
	addWordInput.focus();
	addWordInput.select();
});

submitBtn.addEventListener("click", (e) => {
	e.stopPropagation();
	submitAddingWord();
	toggleAddSystem();
});

addWordInput.addEventListener("keydown", (e) => {
	if (e.key === "Enter") {
		submitAddingWord();
		toggleAddSystem();
	} else if (e.key === "Escape") {
		toggleAddSystem();
	}
});

const createEditBtn = function (
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
	const rect = editBtn.getBoundingClientRect();
	editBtn.addEventListener("click", () => {
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

// Language tab
const updateLanguages = function () {
	const newContent = languageContent.cloneNode();
	languageContent.replaceWith(newContent);
	languageContent = newContent;
	languageKeys.forEach((language) => {
		const div = createDOMElement(languageContent, 0, "div", "", "");
		const languageElement = createTextElement(div, language);
		createEditBtn(
			div,
			1,
			languageElement.innerHTML,
			() => {
				languageElement.classList.toggle("word--hidden");
			},
			() => {
				languageKeys.delete(language);
				div.remove();
			},
			(value) => {
				languageKeys.delete(language);
				languageKeys.add(value);
				wordKeys.forEach((word) => {
					traductions[word][value] = traductions[word][language];
					traductions[word][language] = undefined;
				});
				languageElement.innerHTML = value;
			},
		);
	});
};

updateBtns();

// fetch("../tests/bdd.json")
// 	.then((response) => response.json())
// 	.then((data) => {
// 		// Create a dictionnary from word list
// 		const words = {};

// 		// Create a set of languages
// 		const languages = new Set();
// 		for (let i = 0; i < data.words.length; i++) {
// 			const element = data.words[i];
// 			const languageDict = {};
// 			const wordKey = createListObject(wordContainer, element.key);
// 			element.ecritures.forEach((ecriture) => {
// 				languages.add(ecriture.lang);
// 				languageDict[ecriture.lang] = ecriture.text;
// 				createWordObject(wordKey, ecriture.text);
// 			});
// 			// console.log(languageDict);
// 			words[element.key] = languageDict;
// 		}
// 		const languageObjects = {};
// 		Array.from(languages).forEach((language) => {
// 			languageObjects[language] = createListObject(languageContainer, language);
// 		});
// 		data.families.forEach((family) => {
// 			const familyList = createListObject(familyContainer, family.key);
// 			family.wordKeys.forEach((element) => {
// 				// Convert array in dictionnary
// 				const wordList = createListObject(familyList, element);
// 				languages.forEach((language) => {
// 					const trad = words[element][language];
// 					if (trad) {
// 						createWordObject(wordList, trad);
// 						createWordObject(languageObjects[language], trad);
// 					}
// 				});
// 			});
// 		});

// 		updateBtns();

// 		const reset = function () {
// 			addWordInput.value = "";
// 			clickWord();
// 		};

// 		const validate = function (e) {
// 			const value = addWordInput.value.trim();
// 			if (value) {
// 				console.log("Mot ajouté :", value);
// 				words[value] = {};
// 				createListObject(wordContainer, value, 0);
// 				reset();
// 			}
// 		};

// 		addWordInput.addEventListener("keydown", (e) => {
// 			if (e.key === "Enter") {
// 				validate();
// 			} else if (e.key === "Escape") {
// 				reset();
// 			}
// 		});
// 		submitBtn.addEventListener("click", validate);

// 		const clickWord = function () {
// 			addWordBtn.classList.toggle("clicked");
// 			addWordLabel.classList.toggle("clicked");
// 			addWordInput.classList.toggle("clicked");
// 			submitBtn.classList.toggle("clicked");
// 		};
// 		addWordBtn.addEventListener("click", (e) => {
// 			e.stopPropagation();
// 			clickWord();
// 			addWordInput.focus();
// 			addWordInput.select();
// 		});
// 		console.log(wordObjects);
// 	});
