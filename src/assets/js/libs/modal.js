export class Modals {
    static modals = [];
  
    static addModal(modal) {
      Modals.modals.push(modal);
    }
  
    static getModal(id) {
      return this.modals.find((modal) => modal.modalID === id);
    }
  
    static getOpenModals() {
      return this.modals.filter((modal) => modal.isOpen === true);
    }
  
    static closeAllModals() {
      for (const modal of this.modals) {
        modal.closeModal();
      }
    }
  }
  
export class Modal {
    constructor(container, options = {}) {
      this.modal = container;
      this.modalID = container.dataset.modalId;
      this.modalButtons = document.querySelectorAll(
        `[data-modal="${this.modalID}"]`
      );
      this.defaultOptions = {
        modalCloseSelector: "[data-modal-close]",
        activeClass: "popup-active",
        animateClass: "pp-animate",
        unanimateClass: "pp-unanimate",
        bodyScrollLockClass: "scroll-lock",
        openAnimationDelay: 400,
        closeAnimationDelay: 800,
        closePrevWhenOpen: true,
        bodyOverflowHidden: true,
        onOpen: null,
        onClose: null,
        onInit: null,
      };
  
      this.options = { ...this.defaultOptions, ...options };
  
      this.isOpen = false;
  
      // Modals.addModal(this);
  
      this.init();
    }
  
    init() {
      this.modalClose = this.modal.querySelectorAll(
        this.options.modalCloseSelector
      );
  
      this.setupEventListeners();
      this.onInitCallback();
    }
  
    onInitCallback() {
      if (typeof this.options.onInit === "function") {
        this.options.onInit(this);
      }
    }
  
    setOptions(newOptions) {
      this.options = { ...this.defaultOptions, ...this.options, ...newOptions };
      this.modalClose = this.modal.querySelectorAll(
        this.options.modalCloseSelector
      );
  
      this.removeEventListeners();
  
      this.setupEventListeners();
    }
  
    setupEventListeners() {
      this.handleModalButtonClick = (e) => {
        this.lastClickedButton = e.currentTarget;
  
        if (e.currentTarget.closest("a")) {
          e.preventDefault();
        }
        if (!this.isOpen) {
          this.openModal();
        } else {
          this.closeModal();
        }
      };
  
      this.handleESCKeyDown = (e) => {
        if (e.key === "Escape" && this.isOpen == true) {
          this.closeModal();
        }
      };
  
      this.handleCloseClick = (e) => {
        e.stopPropagation();
        this.closeModal();
      };
  
      this.modalButtons?.forEach((item) => {
        item.addEventListener("click", this.handleModalButtonClick);
      });
  
      this.modalClose?.forEach((item) => {
        item.addEventListener("click", this.handleCloseClick);
      });
  
      document.addEventListener("keydown", this.handleESCKeyDown);
    }
  
    getLastClickedButton() {
      return this.lastClickedButton;
    }
  
    removeEventListeners() {
      this.modalButtons?.forEach((item) => {
        item.removeEventListener("click", this.handleModalButtonClick);
      });
      this.modalClose?.forEach((item) => {
        item.removeEventListener("click", this.handleCloseClick);
      });
  
      document.removeEventListener("keydown", this.handleESCKeyDown);
    }
  
    async openModal() {
      if (this.options.closePrevWhenOpen) {
        await this.closePrevOnOpen();
      }
  
      await this.onOpenCallBack(this);
  
      this.isOpen = true;
  
      document.body.classList.add(this.options.bodyScrollLockClass);
  
      this.modal.classList.remove(this.options.unanimateClass);
      this.modal.classList.add(this.options.activeClass);
  
      setTimeout(() => {
        this.modal.classList.add(this.options.animateClass);
      }, this.options.openAnimationDelay);
    }
  
    async onOpenCallBack() {
      if (typeof this.options.onOpen === "function") {
        await this.options.onOpen(this);
      }
    }
  
    async closePrevOnOpen() {
      const openModals = Modals.getOpenModals();
      for (const item of openModals) {
        await item.closeModal();
      }
    }
  
    async closeModal() {
      await this.removeClasses(this);
      this.onCloseCallback(this);
  
      document.body.classList.remove(this.options.bodyScrollLockClass);
  
      if (this.modal.querySelector("form")) {
        this.modal.querySelectorAll("input").forEach((input) => {
          input.value = "";
        });
        this.modal.querySelectorAll("textarea").forEach((input) => {
          input.value = "";
        });
      }
    }
  
    removeClasses() {
      this.modal.classList.add(this.options.unanimateClass);
      this.modal.classList.remove(this.options.animateClass);
      this.isOpen = false;
  
      return new Promise((resolve) => {
        setTimeout(() => {
          this.modal.classList.remove(this.options.activeClass);
          resolve();
        }, this.options.closeAnimationDelay);
      });
    }
  
    async onCloseCallback() {
      if (typeof this.options.onClose === "function") {
        await this.options.onClose(this);
      }
    }
  }
  

  
  // function changeOptions(options, modalID) {
  //   Modals.getModal(modalID).setOptions(options)
  // }
  