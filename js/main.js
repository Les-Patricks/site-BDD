const toggleButtons = document.querySelectorAll(".toggle-button");
const listTemplate = document.querySelector("#template-list");
const wordFamilyTab = document.getElementById("Famille de mots");
const familyContainer = document.querySelector(".accordion-container");
const wordContainer = document.querySelector(".word-container");
const languageContainer = document.querySelector(".language-container");
const addWordBtn = document.querySelector(".add-btn");
const addWordLabel = document.querySelector(".add-btn-label");
const addWordInput = document.querySelector(".add-word-input");
const submitBtn = document.querySelector(".submit-btn");
const listObjects = [];
const wordObjects = new Map();
// console.log(toggleButtons.length);
toggleButtons.forEach((button) => {
	button.addEventListener("click", () => openTab(button));
	console.log();
});

function openTab(button) {
	// Declare all variables
	var i, tabcontent;

	// Get all elements with class="tabcontent" and hide them
	tabcontent = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = "none";
	}

	// Get all elements with class="toggleButtons" and remove the class "active"
	for (i = 0; i < toggleButtons.length; i++) {
		toggleButtons[i].className = toggleButtons[i].className.replace(
			" active",
			"",
		);
	}

	// Show the current tab, and add an "active" class to the button that opened the tab
	document.getElementById(button.innerText).style.display = "block";
	button.className += " active";
}
openTab(toggleButtons[1]);

// Spawn a list and set its name
const createListObject = function (parent, listName, index = null) {
	const clone = listTemplate.content.cloneNode(true);
	const list = clone.querySelector(".panel-inner");
	const button = clone.querySelector(".accordion-btn");
	const label = clone.querySelector("label");
	const addBtn = clone.querySelector(".add-btn");
	const uniqueId = `add-btn-${Date.now()}-${Math.random().toString(36).slice(2)}`;
	const languageInput = clone.querySelector(".language-input");
	const wordInput = clone.querySelector(".word-input");
	const submitBtn = clone.querySelector(".submit-btn");
	addBtn.id = uniqueId;
	label.setAttribute("for", uniqueId);

	languageInput.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			wordInput.focus();
			wordInput.select();
		}
	});

	wordInput.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			submit();
		}
	});
	const toggle = function () {
		addBtn.classList.toggle("clicked");
		label.classList.toggle("clicked");
		languageInput.classList.toggle("clicked");
		submitBtn.classList.toggle("clicked");
		wordInput.classList.toggle("clicked");
		languageInput.value = "";
		wordInput.value = "";
	};
	const submit = function (e) {
		console.log(
			"language added " +
				languageInput.value.trim() +
				" " +
				wordInput.value.trim(),
		);
		createWordObject(list, wordInput.value.trim(), 0);
		toggle();
	};
	submitBtn.addEventListener("click", (e) => {
		submit();
	});
	addBtn.addEventListener("click", (e) => {
		toggle();
	});

	button.innerHTML = listName;
	if (index === null) {
		parent.appendChild(clone);
		listObjects.push(list);
	} else {
		//To add word to a certain index
		parent.insertBefore(clone, listObjects[index].parentNode.parentNode);
		listObjects.splice(index, 0, list);
	}
	wordObjects.set(list, []);
	return list;
};

// Spawn a word in the parent list and set its content
const createWordObject = function (parentList, wordContent, index = null) {
	const para = document.createElement("p");
	const node = document.createTextNode(wordContent);
	para.appendChild(node);
	if (index === null) {
		wordObjects.get(parentList).push(para);
		parentList.appendChild(para);
	} else {
		parentList.insertBefore(para, wordObjects.get(parentList)[index]);
		wordObjects.get(parentList).splice(index, 0, para);
	}
	para.className += "word";
};

// Add event listners to all button spawned in the DOM
const updateBtns = function () {
	document.querySelectorAll(".accordion-btn").forEach((btn) => {
		btn.addEventListener("click", function (e) {
			e.stopPropagation();

			const panel = this.nextElementSibling;
			panel.classList.toggle("open");
			this.classList.toggle("active");
		});
	});
};

fetch("../tests/bdd.json")
	.then((response) => response.json())
	.then((data) => {
		// Create a dictionnary from word list
		const words = {};

		// Create a set of languages
		const languages = new Set();
		for (let i = 0; i < data.words.length; i++) {
			const element = data.words[i];
			const languageDict = {};
			const wordKey = createListObject(wordContainer, element.key);
			element.ecritures.forEach((ecriture) => {
				languages.add(ecriture.lang);
				languageDict[ecriture.lang] = ecriture.text;
				createWordObject(wordKey, ecriture.text);
			});
			// console.log(languageDict);
			words[element.key] = languageDict;
		}
		const languageObjects = {};
		Array.from(languages).forEach((language) => {
			languageObjects[language] = createListObject(languageContainer, language);
		});
		data.families.forEach((family) => {
			const familyList = createListObject(familyContainer, family.key);
			family.wordKeys.forEach((element) => {
				// Convert array in dictionnary
				const wordList = createListObject(familyList, element);
				languages.forEach((language) => {
					const trad = words[element][language];
					if (trad) {
						createWordObject(wordList, trad);
						createWordObject(languageObjects[language], trad);
					}
				});
			});
		});

		updateBtns();

		const reset = function () {
			addWordInput.value = "";
			clickWord();
		};

		const validate = function (e) {
			const value = addWordInput.value.trim();
			if (value) {
				console.log("Mot ajouté :", value);
				words[value] = {};
				createListObject(wordContainer, value, 0);
				reset();
			}
		};

		addWordInput.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				validate();
			} else if (e.key === "Escape") {
				reset();
			}
		});
		submitBtn.addEventListener("click", validate);

		const clickWord = function () {
			addWordBtn.classList.toggle("clicked");
			addWordLabel.classList.toggle("clicked");
			addWordInput.classList.toggle("clicked");
			submitBtn.classList.toggle("clicked");
		};
		addWordBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			clickWord();
			addWordInput.focus();
			addWordInput.select();
		});
		console.log(wordObjects);
	});
