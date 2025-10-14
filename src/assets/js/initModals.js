import { Modals as Modals } from "./libs/modal";
import { Modal as Modal } from "./libs/modal";

export function initModals() {
  const allModals = document.querySelectorAll("[data-modal-id]");
  for (const modalElement of allModals) {
    const modalInstance = new Modal(modalElement, {});
    Modals.addModal(modalInstance); 
  }
}
