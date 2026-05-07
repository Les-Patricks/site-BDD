const PANEL_OPEN_CLASS = "accordion__panel--open";

const openPanel = (panel) => {
	panel.classList.add(PANEL_OPEN_CLASS);
	panel.style.maxHeight = "0px";
	panel.removeAttribute("inert");
	requestAnimationFrame(() => {
		panel.style.maxHeight = `${panel.scrollHeight}px`;
	});
};

const closePanel = (panel) => {
	panel.style.maxHeight = `${panel.scrollHeight}px`;
	panel.setAttribute("inert", "");
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
		panel.setAttribute("inert", "");
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

	btn.addEventListener("keydown", function (e) {
		if (e.target !== btn) return;
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			btn.click();
		}
	});
};

export const updateBtns = function () {
	document.querySelectorAll(".accordion__button").forEach((btn) => {
		addEventToButton(btn);
	});
};
