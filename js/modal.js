let lastFocusTrigger = null;

function getFocusableEls(container) {
	return Array.from(container.querySelectorAll(
		'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
	)).filter(el => getComputedStyle(el).display !== 'none');
}

function trapFocus(e, container) {
	const els = getFocusableEls(container);
	if (!els.length || e.key !== 'Tab') return;
	const first = els[0];
	const last = els[els.length - 1];
	if (e.shiftKey && document.activeElement === first) {
		e.preventDefault();
		last.focus();
	} else if (!e.shiftKey && document.activeElement === last) {
		e.preventDefault();
		first.focus();
	}
}

const modal = document.querySelector(".modal");
let modalRenameBtn = document.getElementById("modalRenameBtn");
let modalDeleteBtn = document.getElementById("modalDeleteBtn");
const closePanel = document.querySelector(".document-panel");
let currentRenameEvent = null;
let currentDeleteEvent = null;

const familyModal = document.getElementById("familyModal");
const familyModalRenameBtn = document.getElementById("familyModalRenameBtn");
const familyModalAddWordBtn = document.getElementById("familyModalAddWordBtn");
const familyModalDeleteBtn = document.getElementById("familyModalDeleteBtn");
let currentFamilyRenameEvent = null;
let currentFamilyAddWordEvent = null;
let currentFamilyDeleteEvent = null;

const handleModalKeydown = (e) => {
	if (e.key === 'Escape') {
		e.preventDefault();
		toggleModal(false);
		toggleFamilyModal(false);
		return;
	}
	const visibleModal = modal.classList.contains('modal--visible') ? modal
		: familyModal.classList.contains('modal--visible') ? familyModal
		: null;
	if (visibleModal) trapFocus(e, visibleModal);
};

export const callModal = function (position, renameEvent, removeEvent, triggerEl = null) {
	lastFocusTrigger = triggerEl ?? document.activeElement;
	toggleModal(true);
	modal.style.insetInlineStart = position.x + "px";
	modal.style.insetBlockStart = position.y - modal.offsetHeight + "px";
	currentRenameEvent = () => {
		renameEvent();
		toggleModal(false);
	};
	modalRenameBtn.addEventListener("click", currentRenameEvent);
	currentDeleteEvent = () => {
		toggleModal(false);
		removeEvent();
	};
	modalDeleteBtn.addEventListener("click", currentDeleteEvent);
};

export const toggleModal = function (state) {
	if (state) {
		modal.classList.add("modal--visible");
		closePanel.classList.add("document-panel--visible");
		document.addEventListener('keydown', handleModalKeydown);
		modalRenameBtn.focus();
	} else {
		modal.classList.remove("modal--visible");
		closePanel.classList.remove("document-panel--visible");
		modalRenameBtn.removeEventListener("click", currentRenameEvent);
		modalDeleteBtn.removeEventListener("click", currentDeleteEvent);
		document.removeEventListener('keydown', handleModalKeydown);
		lastFocusTrigger?.focus();
		lastFocusTrigger = null;
	}
};

closePanel.addEventListener("click", () => {
	toggleModal(false);
	toggleFamilyModal(false);
});

export const callFamilyModal = function (
	position,
	renameEvent,
	addWordEvent,
	removeEvent,
	triggerEl = null,
) {
	lastFocusTrigger = triggerEl ?? document.activeElement;
	toggleFamilyModal(true);
	familyModal.style.insetInlineStart = position.x + "px";
	familyModal.style.insetBlockStart =
		position.y - familyModal.offsetHeight + "px";
	currentFamilyRenameEvent = () => {
		renameEvent();
		toggleFamilyModal(false);
	};
	familyModalRenameBtn.addEventListener("click", currentFamilyRenameEvent);
	currentFamilyAddWordEvent = () => {
		addWordEvent();
		toggleFamilyModal(false);
	};
	familyModalAddWordBtn.addEventListener("click", currentFamilyAddWordEvent);
	currentFamilyDeleteEvent = () => {
		toggleFamilyModal(false);
		removeEvent();
	};
	familyModalDeleteBtn.addEventListener("click", currentFamilyDeleteEvent);
};

export const toggleFamilyModal = function (state) {
	if (state) {
		familyModal.classList.add("modal--visible");
		closePanel.classList.add("document-panel--visible");
		document.addEventListener('keydown', handleModalKeydown);
		familyModalRenameBtn.focus();
	} else {
		familyModal.classList.remove("modal--visible");
		closePanel.classList.remove("document-panel--visible");
		familyModalRenameBtn.removeEventListener("click", currentFamilyRenameEvent);
		familyModalAddWordBtn.removeEventListener(
			"click",
			currentFamilyAddWordEvent,
		);
		familyModalDeleteBtn.removeEventListener("click", currentFamilyDeleteEvent);
		document.removeEventListener('keydown', handleModalKeydown);
		lastFocusTrigger?.focus();
		lastFocusTrigger = null;
	}
};
