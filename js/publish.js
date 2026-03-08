import { publishDatabase } from "./databaseTransfer.js";
import { hideSaveBtn } from "./dom.js";

const publishBtn = document.getElementById("publishBtn");
const publishConfirmPopup = document.getElementById("publishConfirmPopup");
const confirmPublishBtn = document.getElementById("confirmPublishBtn");
const cancelPublishBtn = document.getElementById("cancelPublishBtn");
publishBtn.addEventListener("click", () => {
	publishConfirmPopup.classList.add("publish__popup--visible");
});
cancelPublishBtn.addEventListener("click", () => {
	publishConfirmPopup.classList.remove("publish__popup--visible");
});
confirmPublishBtn.addEventListener("click", async () => {
	publishConfirmPopup.classList.remove("publish__popup--visible");
	publishBtn.classList.add("publish__btn--saving");
	await publishDatabase();
	publishBtn.classList.remove("publish__btn--saving");
	hidePublishBtn();
});

export const displayPublishBtn = function () {
	hideSaveBtn();
	publishBtn.classList.add("publish__btn--visible");
};

export const hidePublishBtn = function () {
	publishBtn.classList.remove("publish__btn--visible");
};
