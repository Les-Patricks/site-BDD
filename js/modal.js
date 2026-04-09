const modal = document.querySelector(".modal");
let modalRenameBtn = document.getElementById("modalRenameBtn");
let modalDeleteBtn = document.getElementById("modalDeleteBtn");
const closePanel = document.querySelector(".document-panel");
let currentRenameEvent = null;
let currentDeleteEvent = null;

const familyModal = document.getElementById("familyModal");
const familyModalRenameBtn = document.querySelector(
	"#familyModal #modalRenameBtn",
);
const familyModalAddWordBtn = document.getElementById("modalAddWordBtn");
const familyModalDeleteBtn = document.querySelector(
	"#familyModal #modalDeleteBtn",
);
let currentFamilyRenameEvent = null;
let currentFamilyAddWordEvent = null;
let currentFamilyDeleteEvent = null;

export const callModal = function (position, renameEvent, removeEvent) {
	toggleModal(true);
	modal.style.insetInlineStart = position.x + "px";
	modal.style.insetBlockStart = position.y - modal.offsetHeight + "px";
	currentRenameEvent = () => {
		renameEvent();
		toggleModal(false);
	};
	modalRenameBtn.addEventListener("click", currentRenameEvent);
	currentDeleteEvent = () => {
		toggleModal();
		removeEvent();
	};
	modalDeleteBtn.addEventListener("click", currentDeleteEvent);
};

export const toggleModal = function (state) {
	if (state) {
		modal.classList.add("modal--visible");
		closePanel.classList.add("document-panel--visible");
	} else {
		modal.classList.remove("modal--visible");
		closePanel.classList.remove("document-panel--visible");
		modalRenameBtn.removeEventListener("click", currentRenameEvent);
		modalDeleteBtn.removeEventListener("click", currentDeleteEvent);
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
) {
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
	} else {
		familyModal.classList.remove("modal--visible");
		closePanel.classList.remove("document-panel--visible");
		familyModalRenameBtn.removeEventListener("click", currentFamilyRenameEvent);
		familyModalAddWordBtn.removeEventListener(
			"click",
			currentFamilyAddWordEvent,
		);
		familyModalDeleteBtn.removeEventListener("click", currentFamilyDeleteEvent);
	}
};
