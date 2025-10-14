class Sertificate {
  constructor(container) {
    this.fieldsData = {};

    this.fieldsToValidate = [];

    this.form = container ? container : container.querySelector("form");
    this.submit = this.form.querySelector('button[type="submit"]');
    this.fields = this.form.querySelectorAll("input, textarea");

    this.collectFieldsData();
    this.setupEventListeners();
    this.updateFormView();
    this.updateFieldsToValidate();
  }

  validateForm() {
    this.fieldsToValidate.forEach((field) => {
      this.validateField(field);
    });
  }

  validateField(field) {
    if (field.type === "text") {
      if (field.value.length < 3) {
        field.classList.add("error");
      } else {
        field.classList.remove("error");
      }
    }

    if (field.type === "number") {
      if (field.value < 1000) {
        field.classList.add("error");
      } else {
        field.classList.remove("error");
      }
    }

    if (field.type === "email") {
      if (!field.value.includes("@")) {
        field.classList.add("error");
      } else {
        field.classList.remove("error");
      }
    }

    if (field.type === "checkbox") {
      if (!field.checked) {
        this.submit.setAttribute("disabled", true);
      } else {
        this.submit.removeAttribute("disabled");
      }
    }
  }

  collectFieldsData() {
    this.fields.forEach((field) => {
      // Для радио-кнопок берем только выбранное значение
      if (field.type === "radio") {
        if (field.checked) {
          this.fieldsData[field.name] = field.value;
        }
      }
      // Для чекбоксов берем состояние checked
      else if (field.type === "checkbox") {
        this.fieldsData[field.name] = field.checked;
      }
      // Для остальных полей (text, textarea, etc) берем значение
      else if (field.value !== "") {
        this.fieldsData[field.name] = field.value;
      }
    });
    console.log(this.fieldsData);
  }

  updateFieldsData(field) {
    this.fieldsData[field.name] = field.value;
  }

  setupEventListeners() {
    this.fields.forEach((field) => {
      field.addEventListener("change", (e) => {
        this.updateFieldsData(e.target);
        this.updateFormView();
        this.updateFieldsToValidate();
      });

      if (field.type === "textarea") {
        field.addEventListener("input", (e) => {
          if (this.coutTextareaSymbols() > 200) {
            field.value = field.value.slice(0, 200);
          }
        });
      }

      if (
        field.type === "text" ||
        field.type === "number" ||
        field.type === "email"
      ) {
        field.addEventListener("blur", (e) => {
          this.validateField(e.target);
        });
      }
      if (field.type === "checkbox") {
        field.addEventListener("change", (e) => {
          this.validateField(e.target);
        });
      }
    });
  }

  getFormTarget() {
    return this.fieldsData.target;
  }

  getFormNominal() {
    return this.fieldsData.nominal;
  }

  setFormTargetState() {
    if (this.getFormTarget() === "self") {
      return true;
    } else {
      return false;
    }
  }

  setFormNominalState() {
    if (this.getFormNominal() === "custom") {
      return true;
    } else {
      return false;
    }
  }

  updateFormView() {
    console.log(this.setFormTargetState());
    if (this.setFormTargetState()) {
      document.querySelector(
        ".sertificate__item[data-seftificate-self]"
      ).style.display = "flex";
      document.querySelector(
        ".sertificate__item[data-seftificate-friend]"
      ).style.display = "none";
    } else {
      document.querySelector(
        ".sertificate__item[data-seftificate-self]"
      ).style.display = "none";
      document.querySelector(
        ".sertificate__item[data-seftificate-friend]"
      ).style.display = "flex";
    }

    if (this.setFormNominalState()) {
      document.querySelector(".sertificate__optional").style.display = "flex";
    } else {
      document.querySelector(".sertificate__optional").style.display = "none";
    }
  }

  coutTextareaSymbols() {
    const textarea = this.form.querySelector("textarea");
    return textarea.value.length;
  }

  updateFieldsToValidate() {
    const fields = this.form.querySelectorAll(
      "input[type='text'], input[type='number'], input[type='email'], input[type='checkbox'], textarea"
    );
    this.fieldsToValidate = [];
    fields.forEach((field) => {
      if (field.closest('[style="display: none;"]')) {
        return;
      } else {
        this.fieldsToValidate.push(field);
      }
    });
    console.log(this.fieldsToValidate);
  }
}

export function initSertificate() {
  if (!document.querySelector(".sertificate")) {
    return;
  } else {
    new Sertificate(document.querySelector(".sertificate"));
  }
}
