// Créer une fonction pour créer système d'ajout (add system)
export const createAddSystem = function (
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
			if (e.key === "Escape") {
				toggle();
			}
		});
	}
	inputs[inputs.length - 1].addEventListener("keydown", (e) => {
		if (e.key === "Escape") {
			toggle();
		}
		if (e.key === "Enter") {
			submitEvent(...inputs.map((input) => input.value.trim()));
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
