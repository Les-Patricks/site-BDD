const tabSearchRegistry = new Map();

export const normalizeSearchQuery = (query) => {
	return String(query ?? "").trim().toLowerCase();
};

const normalizeLabel = (label) => String(label ?? "").toLowerCase();

export const computeFilterState = (labels, normalizedQuery) => {
	const query = normalizeSearchQuery(normalizedQuery);
	if (!Array.isArray(labels)) {
		return {
			visibleFlags: [],
			empty: false,
			firstVisibleIndex: -1,
		};
	}
	if (!query) {
		return {
			visibleFlags: labels.map(() => true),
			empty: false,
			firstVisibleIndex: labels.length > 0 ? 0 : -1,
		};
	}

	const visibleFlags = labels.map((label) =>
		normalizeLabel(label).includes(query),
	);
	const firstVisibleIndex = visibleFlags.findIndex(Boolean);

	return {
		visibleFlags,
		empty: labels.length > 0 && firstVisibleIndex === -1,
		firstVisibleIndex,
	};
};

export const getRowSearchLabel = (rowElement) => {
	if (!rowElement || typeof rowElement.querySelector !== "function") {
		return "";
	}
	const rootAccordion = rowElement.classList.contains("accordion-item")
		? rowElement
		: rowElement.querySelector(":scope > .accordion-item");
	if (!rootAccordion) {
		return "";
	}
	const titleElement = rootAccordion.querySelector(
		":scope > .row-content .title-group .accordion__button",
	);
	return titleElement?.textContent?.trim() ?? "";
};

const applyPanelFilter = (panelId, withScroll = false) => {
	const panelSearchState = tabSearchRegistry.get(panelId);
	if (!panelSearchState) {
		return;
	}

	const rowElements = Array.from(panelSearchState.content.children);
	const rowLabels = rowElements.map(getRowSearchLabel);
	const filterState = computeFilterState(
		rowLabels,
		normalizeSearchQuery(panelSearchState.input.value),
	);

	rowElements.forEach((rowElement, index) => {
		const shouldHideRow = !filterState.visibleFlags[index];
		rowElement.classList.toggle("tab-search__item--hidden", shouldHideRow);
	});
	if (filterState.empty) {
		panelSearchState.content.dataset.searchEmpty = "true";
	} else {
		delete panelSearchState.content.dataset.searchEmpty;
	}

	if (withScroll && filterState.firstVisibleIndex >= 0) {
		rowElements[filterState.firstVisibleIndex]?.scrollIntoView({
			block: "nearest",
			inline: "nearest",
		});
	}
};

let tabSearchInitialized = false;

/**
 * Clears registry and init flag. Used only by Vitest so each case can mount a fresh DOM.
 * Do not call from production code.
 */
export const resetTabSearchModuleStateForTests = () => {
	tabSearchRegistry.clear();
	tabSearchInitialized = false;
};

const registerPanel = (panelId, contentId) => {
	const panel = document.getElementById(panelId);
	const content = document.getElementById(contentId);
	if (!panel || !content) {
		return;
	}
	const input = panel.querySelector(".tab-panel__search-bar");
	const button = panel.querySelector(".tab-panel__search-btn");
	if (!input || !button) {
		return;
	}

	tabSearchRegistry.set(panelId, {
		input,
		button,
		content,
	});

	input.addEventListener("input", () => {
		applyPanelFilter(panelId, false);
	});
	button.addEventListener("click", () => {
		applyPanelFilter(panelId, true);
	});
	input.addEventListener("keydown", (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			applyPanelFilter(panelId, true);
		}
	});
};

export const initTabSearch = () => {
	if (tabSearchInitialized) {
		return;
	}
	tabSearchInitialized = true;
	registerPanel("wordFamilyTab", "familyTabPanelContent");
	registerPanel("wordTab", "wordTabPanelContent");
};

export const refreshTabSearch = (panelId) => {
	applyPanelFilter(panelId, false);
};
