export const addEventToButton = function (btn) {
	btn.addEventListener("click", function (e) {
		e.stopPropagation();
		const panel =
			btn.parentNode.parentNode.parentNode.parentNode.querySelector(
				".accordion__panel",
			);
		panel.classList.toggle("accordion__panel--open");
	});
};

export const updateBtns = function () {
	document.querySelectorAll(".accordion__button").forEach((btn) => {
		addEventToButton(btn);
	});
};
