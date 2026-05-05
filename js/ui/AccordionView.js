const PANEL_OPEN_CLASS = "accordion__panel--open";

const openPanel = (panel) => {
	panel.classList.add(PANEL_OPEN_CLASS);
	panel.style.maxHeight = "0px";
	requestAnimationFrame(() => {
		panel.style.maxHeight = `${panel.scrollHeight}px`;
	});
};

const closePanel = (panel) => {
	panel.style.maxHeight = `${panel.scrollHeight}px`;
	requestAnimationFrame(() => {
		panel.classList.remove(PANEL_OPEN_CLASS);
		panel.style.maxHeight = "0px";
	});
};

export const addEventToButton = function (btn) {
	const panel = btn.parentNode.querySelector(".accordion__panel");
	if (!panel) {
		return;
	}

	if (!panel.classList.contains(PANEL_OPEN_CLASS)) {
		panel.style.maxHeight = "0px";
	}

	panel.addEventListener("transitionend", () => {
		if (panel.classList.contains(PANEL_OPEN_CLASS)) {
			panel.style.maxHeight = "none";
		}
	});

	btn.addEventListener("click", function (e) {
		e.stopPropagation();
		const isOpen = panel.classList.contains(PANEL_OPEN_CLASS);
		if (isOpen) {
			closePanel(panel);
			return;
		}
		openPanel(panel);
	});
};

export const updateBtns = function () {
	document.querySelectorAll(".accordion__button").forEach((btn) => {
		addEventToButton(btn);
	});
};
