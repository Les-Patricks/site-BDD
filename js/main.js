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
const wordContent = wordTab.querySelector(".tab-panel__content");
const languageContent = languageTab.querySelector(".tab-panel__content");

// Word tab related stuff
const addWordBtn = wordTab.querySelector(".tab-panel__button");
const addWordLabel = wordTab.querySelector(".tab-panel__label");
const addWordInput = document.getElementById("addWordInput");
const submitBtn = wordTab.querySelector(".tab-panel__submit-button");
// ==========
const modal = document.querySelector(".modal");
const closePanel = document.querySelector(".document-panel");

// Conteneur
const wordKeys = new Set();
const familyKeys = new Set();
const languageKeys = new Set(["en", "fr"]);

wordFamilyBtn.addEventListener("click", () => openTab(wordFamilyTab));
wordBtn.addEventListener("click", () => openTab(wordTab));
languagesBtn.addEventListener("click", () => openTab(languageTab));

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
	element.classList.add(className);
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
	// console.log(index);
	if (directChildren.length == 0 || index == -1) {
		parent.appendChild(element);
	} else {
		const selectedDirectChild = parent.children[index];
		if (selectedDirectChild) {
			parent.insertBefore(element, selectedDirectChild);
		}
	}
};

// Spawn a list and set its name
const createAccordionElement = function (parent, listName) {
	const clonedList = listTemplate.content.cloneNode(true);
	const accordionBtn = clonedList.querySelector(".accordion__button");
	const editBtn = clonedList.querySelector(".accordion__edit-button");
	const content = clonedList.querySelector(".accordion__content");
	accordionBtn.innerHTML = listName;
	const toggle = function () {
		modal.classList.toggle("modal--visible");
		closePanel.classList.toggle("document-panel--visible");
	};
	const hide = function () {
		toggle();

		closePanel.removeEventListener("click", hide);
	};

	editBtn.addEventListener("click", () => {
		closePanel.addEventListener("click", hide);
		toggle();
		const rect = editBtn.getBoundingClientRect();
		modal.style.insetInlineStart = rect.right + "px";
		modal.style.insetBlockStart = rect.top - modal.offsetHeight + "px";
	});
	insertElementAt(clonedList, 0, parent);
	// wordObjects.set(content, []);
	addEventToButton(accordionBtn);
	return content;
};

// Adds a new word to the wordKeys and return if it was added or not
const createWord = function (wordContent) {
	const added = !wordKeys.has(wordContent);
	wordKeys.add(wordContent);
	return added;
};

// Spawn a word in the parent list and set its content
const createTextElement = function (parentList, wordContent) {
	if (wordContent !== "") {
		const para = document.createElement("p");
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

const submitAddingWord = function () {
	const value = addWordInput.value.trim().toLowerCase();
	if (value) {
		if (!createWord(value)) {
			alert("The key already exist");
		} else {
			const listObject = createAccordionElement(wordContent, value, 0);
			languageKeys.forEach((language) => {
				const textElement = createTextElement(listObject, `${language} : `);
				createDOMElement(textElement, -1, "input", "null", "accordion__input");
			});
		}
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
