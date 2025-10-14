import { slideToggle } from "./libs/collapse.min";

export function utils() {
  function validateFile(file) {
    const allowedExtensions = ["pdf", "doc", "docx", "txt", "rtf"];
    const maxSize = 9 * 1024 * 1024; // 9 МБ

    if (!file) {
      return { valid: false, error: "Файл не выбран" };
    }

    // Проверка расширения
    const extension = file.name.split(".").pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `Недопустимый формат файла. Разрешены: ${allowedExtensions.join(
          ", "
        )}`,
      };
    }

    // Проверка размера
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `Размер файла превышает 9 МБ (текущий размер: ${(
          file.size /
          1024 /
          1024
        ).toFixed(2)} МБ)`,
      };
    }

    return { valid: true };
  }

  // Обработка изменения файлового инпута
  const fileInput = document.querySelector('.modal__file input[type="file"]');
  if (fileInput) {
    fileInput.addEventListener("change", function (e) {
      const fileDecor =
        this.closest(".modal__file").querySelector(".modal__file-decor");

      // Проверка количества файлов
      if (this.files && this.files.length > 1) {
        alert("Можно загрузить только один файл");
        this.value = "";
        fileDecor.textContent = "Выберите файл с резюме*";
        return;
      }

      if (this.files && this.files.length > 0) {
        const file = this.files[0];
        const validation = validateFile(file);

        if (validation.valid) {
          fileDecor.textContent = file.name;
        } else {
          alert(validation.error);
          this.value = "";
          fileDecor.textContent = "Выберите файл с резюме*";
        }
      } else {
        fileDecor.textContent = "Выберите файл с резюме*";
      }
    });
  }

  const resizeOnContent = document.querySelector("[data-resize-on-content]");
  if (resizeOnContent) {
    resizeOnContent.addEventListener("input", function () {
      this.style.height = "auto";
      this.style.height = this.scrollHeight + "px";
    });
  }

  const handleCollapse = (button, container) => {
    let isAnimating = false;

    button.addEventListener("click", async () => {
      if (isAnimating) return;

      isAnimating = true;
      button.parentElement.classList.toggle("active");

      await slideToggle(container, 800);

      isAnimating = false;
    });
  };

  const collapse = document.querySelectorAll("[data-collapse]");
  collapse.forEach((item) => {
    const target = item.nextElementSibling;
    handleCollapse(item, target);
  });

  if (window.innerWidth <= 768) {
    const moveArr = document.querySelectorAll("[data-mobile-move]");
    moveArr.forEach((item) => {
      const target = document.querySelector(
        `[data-mobile-target="${item.dataset.mobileMove}"]`
      );
      target.appendChild(item);
    });

    const customerLinkButton = document.querySelector(
      ".customer__mobile-button"
    );
    if (customerLinkButton) {
      customerLinkButton.addEventListener("click", () => {
        customerLinkButton.parentElement.classList.toggle("active");
      });

      document.addEventListener("click", (e) => {
        if (
          !customerLinkButton.contains(e.target) &&
          !customerLinkButton.parentElement.contains(e.target)
        ) {
          customerLinkButton.parentElement.classList.remove("active");
        }
      });

      document.addEventListener("scroll", (e) => {
        customerLinkButton.parentElement.classList.remove("active");
      });
    }
  }
}
