/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	computeFilterState,
	getRowSearchLabel,
	initTabSearch,
	normalizeSearchQuery,
	refreshTabSearch,
	resetTabSearchModuleStateForTests,
} from "../ui/tabSearch.js";

describe("ticket 13 - tab search behavior", () => {
	it("CA-1301: filters by normalized substring on root labels", () => {
		const result = computeFilterState(
			["Alpha", "Beta family", "Gamma"],
			normalizeSearchQuery("  FAM  "),
		);

		expect(result.visibleFlags).toEqual([false, true, false]);
		expect(result.empty).toBe(false);
	});

	it("CA-1302: empty query restores full visibility", () => {
		const result = computeFilterState(
			["Alpha", "Beta", "Gamma"],
			normalizeSearchQuery("   "),
		);

		expect(result.visibleFlags).toEqual([true, true, true]);
		expect(result.empty).toBe(false);
	});

	it("CA-1303: exposes first visible index for loupe/Enter scroll", () => {
		const result = computeFilterState(
			["Alpha", "Beta", "Gamma"],
			normalizeSearchQuery("ga"),
		);

		expect(result.visibleFlags).toEqual([false, false, true]);
		expect(result.firstVisibleIndex).toBe(2);
	});

	it("CA-1304: supports independent filtering per tab context", () => {
		const families = computeFilterState(
			["Animaux", "Fruits"],
			normalizeSearchQuery("fr"),
		);
		const words = computeFilterState(
			["chat", "chien", "banane"],
			normalizeSearchQuery("ch"),
		);

		expect(families.visibleFlags).toEqual([false, true]);
		expect(words.visibleFlags).toEqual([true, true, false]);
	});

	it("CA-1305: works from in-memory labels only", () => {
		const labels = ["A", "B", "C"];
		const result = computeFilterState(labels, normalizeSearchQuery("z"));

		expect(result.empty).toBe(true);
		expect(result.visibleFlags).toEqual([false, false, false]);
	});

	it("computeFilterState: non-array labels returns empty safe state", () => {
		const result = computeFilterState(null, "x");

		expect(result.visibleFlags).toEqual([]);
		expect(result.empty).toBe(false);
		expect(result.firstVisibleIndex).toBe(-1);
	});

	it("computeFilterState: empty labels array never sets empty=true", () => {
		const result = computeFilterState([], normalizeSearchQuery("foo"));

		expect(result.visibleFlags).toEqual([]);
		expect(result.empty).toBe(false);
		expect(result.firstVisibleIndex).toBe(-1);
	});

	it("normalizeSearchQuery: coerces non-string query safely", () => {
		expect(normalizeSearchQuery(null)).toBe("");
		expect(normalizeSearchQuery(undefined)).toBe("");
		expect(normalizeSearchQuery(42)).toBe("42");
		expect(normalizeSearchQuery({})).toBe("[object object]");
	});

	it("computeFilterState: label entries coerce to string for matching", () => {
		const result = computeFilterState(["12", 123], normalizeSearchQuery("12"));

		expect(result.visibleFlags).toEqual([true, true]);
	});
});

const minimalTabPanelsHtml = `
	<div class="tab-panel" id="wordFamilyTab">
		<div class="tab-panel__search-header">
			<input class="tab-panel__search-bar" />
			<button type="button" class="tab-panel__search-btn">🔍</button>
		</div>
		<div class="tab-panel__content" id="familyTabPanelContent"></div>
	</div>
	<div class="tab-panel" id="wordTab">
		<div class="tab-panel__search-header">
			<input class="tab-panel__search-bar" />
			<button type="button" class="tab-panel__search-btn">🔍</button>
		</div>
		<div class="tab-panel__content" id="wordTabPanelContent"></div>
	</div>
`;

describe("ticket 13 P1 - initTabSearch robustness", () => {
	beforeEach(() => {
		resetTabSearchModuleStateForTests();
		document.body.innerHTML = minimalTabPanelsHtml;
	});

	it("does not stack DOM listeners when initTabSearch is called twice", () => {
		const addListenerSpy = vi.spyOn(HTMLElement.prototype, "addEventListener");

		initTabSearch();
		const listenerCountAfterFirstInit = addListenerSpy.mock.calls.length;

		initTabSearch();
		expect(addListenerSpy.mock.calls.length).toBe(listenerCountAfterFirstInit);

		addListenerSpy.mockRestore();
	});
});

const wordAccordionRowHtml = (title) => `
	<div class="accordion-item">
		<span class="row-content row">
			<span class="title-group left-group">
				<span class="accordion__button">${title}</span>
			</span>
		</span>
		<div class="accordion__panel"><div class="accordion__content"></div></div>
	</div>
`;

describe("ticket 13 - refresh keeps filter after list mutation", () => {
	beforeEach(() => {
		resetTabSearchModuleStateForTests();
		document.body.innerHTML = minimalTabPanelsHtml;
		initTabSearch();
	});

	it("hides a newly appended row when it does not match the active query", () => {
		const wordContent = document.getElementById("wordTabPanelContent");
		const wordSearchInput = document.querySelector(
			"#wordTab .tab-panel__search-bar",
		);

		wordContent.innerHTML =
			wordAccordionRowHtml("keeper-alpha") + wordAccordionRowHtml("zz-drop-me");

		wordSearchInput.value = "keeper";
		wordSearchInput.dispatchEvent(new Event("input", { bubbles: true }));

		const rowsAfterFilter = wordContent.querySelectorAll(":scope > .accordion-item");
		expect(rowsAfterFilter[0].classList.contains("tab-search__item--hidden")).toBe(
			false,
		);
		expect(rowsAfterFilter[1].classList.contains("tab-search__item--hidden")).toBe(
			true,
		);

		const wrapper = document.createElement("div");
		wrapper.innerHTML = wordAccordionRowHtml("no-match-new");
		const newRow = wrapper.firstElementChild;
		wordContent.appendChild(newRow);

		expect(newRow.classList.contains("tab-search__item--hidden")).toBe(false);

		refreshTabSearch("wordTab");

		expect(newRow.classList.contains("tab-search__item--hidden")).toBe(true);
	});
});

describe("ticket 13 - row label from DOM (family wrapper vs nested words)", () => {
	it("reads family title, not nested word accordion titles", () => {
		document.body.innerHTML = `
			<div id="familyRowWrap">
				<div class="accordion-item">
					<span class="row-content row">
						<span class="title-group left-group">
							<span class="accordion__button">Famille Zoo</span>
						</span>
					</span>
					<div class="accordion__panel">
						<div class="accordion__content">
							<div class="accordion-item">
								<span class="row-content row">
									<span class="title-group left-group">
										<span class="accordion__button">mot-secret</span>
									</span>
								</span>
								<div class="accordion__panel"><div class="accordion__content"></div></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		`;
		const wrap = document.getElementById("familyRowWrap");
		expect(getRowSearchLabel(wrap)).toBe("Famille Zoo");
	});

	it("reads word title when the row is the root accordion item", () => {
		document.body.innerHTML = `
			<div class="accordion-item" id="wordRow">
				<span class="row-content row">
					<span class="title-group left-group">
						<span class="accordion__button">Bonjour</span>
					</span>
				</span>
				<div class="accordion__panel"><div class="accordion__content"></div></div>
			</div>
		`;
		const row = document.getElementById("wordRow");
		expect(getRowSearchLabel(row)).toBe("Bonjour");
	});

	it("returns empty string when row is missing or has no root accordion", () => {
		expect(getRowSearchLabel(null)).toBe("");
		expect(getRowSearchLabel(undefined)).toBe("");

		document.body.innerHTML = `<div id="plain">no accordion</div>`;
		expect(getRowSearchLabel(document.getElementById("plain"))).toBe("");
	});
});
