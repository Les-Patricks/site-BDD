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

const listObjects = [];
const wordObjects = new Map();

// console.log(toggleButtons.length);
wordFamilyBtn.addEventListener("click", () => openTab(wordFamilyTab));
wordBtn.addEventListener("click", () => openTab(wordTab));
languagesBtn.addEventListener("click", () => openTab(languageTab));
// toggleButtons.forEach((button) => {
// 	button.addEventListener("click", () => openTab(button));
// });

function openTab(currentTab) {
	currentTab.classList.add("tab-panel--open");
	allTabs.forEach((tab) => {
		if (tab !== currentTab) {
			tab.classList.remove("tab-panel--open");
		}
	});
}
openTab(wordTab);

// Créer une fonction pour créer système d'ajout (add system)
const createAddSystem = function (parent, ...inputNames) {
	const clonedAddSystem = addSystemTemplate.content.cloneNode(true);
	const addPanel = clonedAddSystem.querySelector(".add-panel");
	const inputPanel = clonedAddSystem.querySelector(".add-panel__inputs");
	inputNames.forEach((inputName) => {
		const input = document.createElement("input");
		const uniqueId = `input-${Date.now()}-${Math.random().toString(36).slice(2)}`;
		input.id = uniqueId;
		input.type = "text";
		input.placeholder = inputName;
		input.classList.add("add-panel__input");
		inputPanel.appendChild(input);
	});
	parent.appendChild(clonedAddSystem);
	return addPanel;
};

// Spawn a list and set its name
const createListObject = function (parent, listName, index = null) {
	const clonedList = listTemplate.content.cloneNode(true);
	const accordionBtn = clonedList.querySelector(".accordion__button");
	const panel = clonedList.querySelector(".accordion__panel");
	// const addLabel = clonedList.querySelector("label");
	// const addBtn = clonedList.querySelector(".add-btn");
	// const uniqueId = `add-btn-${Date.now()}-${Math.random().toString(36).slice(2)}`;
	// const langugeInput = clonedList.querySelector(".language-input");
	//const listWordInputInstance = listInstance.querySelector(".word-input");
	// const submitBtn = clonedList.querySelector(".submit-btn");
	accordionBtn.innerHTML = listName;
	parent.appendChild(clonedList);
	wordObjects.set(panel, []);
	return panel;

	// addBtn.id = uniqueId;
	// addLabel.setAttribute("for", uniqueId);

	// langugeInput.addEventListener("keydown", (e) => {
	// 	if (e.key === "Enter") {
	// 		listWordInputInstance.focus();
	// 		listWordInputInstance.select();
	// 	}
	// });

	// listWordInputInstance.addEventListener("keydown", (e) => {
	// 	if (e.key === "Enter") {
	// 		submit();
	// 	}
	// });
	// const toggle = function () {
	// 	addBtn.classList.toggle("clicked");
	// 	addLabel.classList.toggle("clicked");
	// 	langugeInput.classList.toggle("clicked");
	// 	submitBtn.classList.toggle("clicked");
	// 	listWordInputInstance.classList.toggle("clicked");
	// 	langugeInput.value = "";
	// 	listWordInputInstance.value = "";
	// };
	// const submit = function (e) {
	// 	console.log(
	// 		"language added " +
	// 			langugeInput.value.trim() +
	// 			" " +
	// 			listWordInputInstance.value.trim(),
	// 	);
	// 	createWordObject(panel, listWordInputInstance.value.trim(), 0);
	// 	toggle();
	// };
	// submitBtn.addEventListener("click", (e) => {
	// 	submit();
	// });
	// addBtn.addEventListener("click", (e) => {
	// 	toggle();
	// });

	// accordionBtn.innerHTML = listName;
	// if (index === null) {
	// 	parent.appendChild(clonedList);
	// 	listObjects.push(panel);
	// } else {
	// 	//To add word to a certain index
	// 	parent.insertBefore(clonedList, listObjects[index].parentNode.parentNode);
	// 	listObjects.splice(index, 0, panel);
	// }
	// wordObjects.set(panel, []);
	// return panel;
};

// createAddSystem(testList, "Votre key", "Votre Mot");

// Spawn a word in the parent list and set its content
const createWordObject = function (parentList, wordContent, index = null) {
	const para = document.createElement("p");
	const node = document.createTextNode(wordContent);
	const content = document.querySelector(".accordion__content");
	para.appendChild(node);
	if (index === null) {
		wordObjects.get(parentList).push(para);
		content.appendChild(para);
	} else {
		content.insertBefore(para, wordObjects.get(parentList)[index]);
		wordObjects.get(parentList).splice(index, 0, para);
	}
	para.className += "word";
};
const testList = createListObject(wordTab, "test list");
createWordObject(testList, "test");

// Add event listners to all button spawned in the DOM
const updateBtns = function () {
	document.querySelectorAll(".accordion__button").forEach((btn) => {
		btn.addEventListener("click", function (e) {
			e.stopPropagation();
			// The problem comes from here

			const panel = this.nextElementSibling;
			panel.classList.toggle("open");
			this.classList.toggle("active");
		});
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
