export const toggleAddSystem = function (
	addBtn,
	addLabel,
	addInput,
	submitBtn,
) {
	addBtn.classList.toggle("tab-panel__button--hidden");
	addLabel.classList.toggle("tab-panel__label--hidden");
	addInput.classList.toggle("tab-panel__input--visible");
	submitBtn.classList.toggle("tab-panel__submit-button--visible");
	addInput.value = "";
};

export const bindTabAddSystem = function (
	addBtn,
	addLabel,
	addInput,
	submitBtn,
	submitFn,
) {
	addBtn.addEventListener("click", (e) => {
		e.stopPropagation();
		toggleAddSystem(addBtn, addLabel, addInput, submitBtn);
		addInput.focus();
		addInput.select();
	});

	submitBtn.addEventListener("click", (e) => {
		e.stopPropagation();
		submitFn();
		toggleAddSystem(addBtn, addLabel, addInput, submitBtn);
	});

	addInput.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			submitFn();
			toggleAddSystem(addBtn, addLabel, addInput, submitBtn);
		}
	});
};
