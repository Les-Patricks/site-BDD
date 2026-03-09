import { hidePublishBtn } from "../publish.js";
const saveBtn = document.getElementById("saveBtn");

export const displaySaveBtn = function () {
	saveBtn.classList.add("save-btn--visible");
	hidePublishBtn();
};

export const hideSaveBtn = function () {
	saveBtn.classList.remove("save-btn--visible");
};
