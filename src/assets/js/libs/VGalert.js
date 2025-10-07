/**
 * vg-alerts.js (с) 2025 VICTORY digital
 * https://victoryagency.ru/
 * Скрипт для управления уведомлениями с возможностью задания кастомных классов,
 * текста уведомления, автоматического показа и скрытия, группирования уведомлений
 * (при позиционировании относительно окна или относительно родительского блока) и наличия кнопки закрытия (крестика).
 *
 * Опции:
 *   - title: Заголовок уведомления. (Опционально)
 *   - text: Текст уведомления. (Можно передавать HTML)
 *   - classes: Дополнительные CSS-классы.
 *   - duration: Время показа (мс).
 *   - theme: Тема уведомлений. Доступные варианты: light, dark, auto.
 *   - parent: DOM-элемент, относительно которого производится позиционирование.
 *             Если задан – используется position: absolute; уведомление позиционируется относительно блока,
 *             при этом позиция определяется так, чтобы не накладываться на родительский элемент.
 *   - position: Позиция. Возможные варианты:
 *         "top left", "top center", "top right",
 *         "bottom left", "bottom center", "bottom right",
 *         "center left", "center center", "center right".
 *         Если указано одно слово, интерпретируется как:
 *           "top"    -> "top center"
 *           "bottom" -> "bottom center"
 *           "left"   -> "center left"
 *           "right"  -> "center right"
 *           "center" -> "center center"
 *         Если не задан, используется "bottom center" (для случая без родителя).
 *   - offset: Отступ от края контейнера или родительского блока. По умолчанию 10 пикселей.
 *   - group: Логический флаг (по умолчанию false). Если true, уведомления группируются вертикально.
 *   - groupGap: Отступ между уведомлениями в группе. По умолчанию равен offset.
 *   - groupMax: Если задано число, максимально допустимое число уведомлений в группе.
 *               Если число превышено или новое уведомление выходит за границы экрана,
 *               предыдущие уведомления из группы закрываются, а группа сбрасывается.
 *   - closeButton: Логический флаг (по умолчанию false). Если true, в уведомлении появляется
 *                кнопка закрытия (крестик), по нажатию на которую уведомление закрывается.
 *   - closeButtonText: Текст в кнопке закрытия.
 *   - autoClose: Логический флаг (по умолчанию true). Если false, уведомления не будут автоматически закрываться.
 *   - closeOthers: Логический флаг. Закрывает все остальные уведомления при открытии нового.
 *   - onOpen: Callback-функция, вызывается при появлении уведомления.
 *   - onClose: Callback-функция, вызывается при закрытии уведомления.
 *
 * Новые опции и события для модального режима (type: 'confirm'):
 *   - type: Тип уведомления. 'alert' (по умолчанию) или 'confirm'.
 *   - confirmButtonText: Текст кнопки подтверждения (по умолчанию 'OK').
 *   - cancelButtonText: Текст кнопки отмены (по умолчанию 'Отмена').
 *   - cancelButtonShow: Показывать ли кнопку отмены (по умолчанию true). Если false — кнопка отмены не отображается.
 *   - onConfirm: Callback-функция, вызывается при нажатии кнопки подтверждения.
 *   - onCancel: Callback-функция, вызывается при нажатии кнопки отмены.
 *
 * Особенности confirm-уведомления:
 *   - Блокирует взаимодействие со страницей (overlay, запрет скролла).
 *   - Фокусировка и навигация Tab ограничены только элементами внутри окна (ловушка фокуса).
 *   - При клике вне окна (по overlay) окно "дрожит" (shake-анимация), фокус возвращается внутрь окна.
 *   - Закрыть уведомление можно только через кнопки OK или Отмена.
 */
export default class VGalert {
    static currentAlert = null;
    static groupedGroups = {};
    static allNotifications = [];
  
    constructor(options) {
      this.title = options.title || ""; // опционально
      this.text = options.text || "";
      this.duration = options.duration || 5000;
      this.theme = options.theme || "auto";
      this.classes = options.classes || [];
      
      // Тип уведомления: alert или confirm
      this.type = options.type || "alert";
      // Тексты кнопок для confirm
      this.confirmButtonText = options.confirmButtonText || "OK";
      this.cancelButtonText = options.cancelButtonText || "Отмена";
      this.cancelButtonShow = typeof options.cancelButtonShow === "boolean" ? options.cancelButtonShow : true;
      // Колбэки для кнопок confirm
      this.onConfirm = typeof options.onConfirm === "function" ? options.onConfirm : null;
      this.onCancel = typeof options.onCancel === "function" ? options.onCancel : null;
  
      // Если родитель задан – уведомление позиционируется относительно него.
      this.parent = options.parent || null;
      // Если родитель не задан, группировка определяется опцией group.
      this.group = !this.parent ? options.group || false : false;
      this.rawPosition = options.position || "top center";
      [this.vertAlign, this.horizAlign] = this._parsePosition(this.rawPosition);
      // единый отступ
      this.offset = typeof options.offset === "number" ? options.offset : 15;
  
      // новые опции для каждой стороны, с fallback на this.offset
      this.offsetTop =
        typeof options.offsetTop === "number" ? options.offsetTop : this.offset;
      this.offsetBottom =
        typeof options.offsetBottom === "number"
          ? options.offsetBottom
          : this.offset;
      this.offsetLeft =
        typeof options.offsetLeft === "number" ? options.offsetLeft : this.offset;
      this.offsetRight =
        typeof options.offsetRight === "number"
          ? options.offsetRight
          : this.offset;
  
      // groupGap по прежнему, default = общий offset
      this.groupGap =
        typeof options.groupGap === "number" ? options.groupGap : this.offset;
      this.groupMax =
        typeof options.groupMax === "number" ? options.groupMax : undefined;
      this.closeButton =
        typeof options.closeButton === "boolean" ? options.closeButton : false;
      this.closeButtonText = options.closeButtonText || "";
      this.autoClose =
        typeof options.autoClose === "boolean" ? options.autoClose : true;
  
      this.closeOthers =
        typeof options.closeOthers === "boolean" ? options.closeOthers : false;
  
      // Новая опция onClose. Если передана функция, она будет вызвана при закрытии уведомления
      this.onClose =
        typeof options.onClose === "function" ? options.onClose : null;
      this.onOpen = typeof options.onOpen === "function" ? options.onOpen : null;
  
      // Если группировка включена (и родитель не задан), вычисляем ключ группы
      if (this.group) {
        this.groupKey = "document_" + this.rawPosition;
      }
  
      this._createElement();
      VGalert.allNotifications.push(this);
    }
  
    _parsePosition(posStr) {
      const verticalCandidates = ["top", "bottom", "center"];
      const horizontalCandidates = ["left", "right", "center"];
  
      let parts = posStr.trim().toLowerCase().split(/\s+/);
  
      // Если указано одно слово, используем преобразование по умолчанию
      if (parts.length === 1) {
        switch (parts[0]) {
          case "top":
            return ["top", "center"];
          case "bottom":
            return ["bottom", "center"];
          case "left":
            return ["center", "left"];
          case "right":
            return ["center", "right"];
          case "center":
            return ["center", "center"];
          default:
            return ["bottom", "center"];
        }
      }
  
      // Если указаны два слова, определим какой из них вертикальный, а какой горизонтальный
      if (parts.length >= 2) {
        let first = parts[0],
          second = parts[1];
        // Если первый элемент не входит в список вертикальных, а второй входит в него,
        // меняем местами.
        if (
          verticalCandidates.indexOf(first) < 0 &&
          verticalCandidates.indexOf(second) >= 0
        ) {
          return [second, first];
        }
        // Если первый входит в вертикальные, а второй – в горизонтальные, оставляем как есть
        if (
          verticalCandidates.indexOf(first) >= 0 &&
          horizontalCandidates.indexOf(second) >= 0
        ) {
          return [first, second];
        }
        // В остальных случаях задаём поведение по умолчанию (например, "bottom center")
        return ["bottom", "center"];
      }
  
      // Если что-то пошло не так – возвращаем значение по умолчанию
      return ["bottom", "center"];
    }
  
    _createElement() {
      this.elem = document.createElement("div");
      this.elem.classList.add("vgalert");
      if (this.classes.length) {
        this.classes.forEach((cls) => this.elem.classList.add(cls));
      }
      // Устанавливаем тему и тип
      if (this.theme) {
        this.elem.setAttribute("data-vgalert-theme", this.theme);
      }
      this.elem.setAttribute("data-vgalert-type", this.type);
  
      // Создаем отдельный элемент для заголовка уведомления
      if (this.title && this.title !== "") {
        const titleElem = document.createElement("div");
        titleElem.classList.add("vgalert-title");
        titleElem.textContent = this.title;
        this.elem.appendChild(titleElem);
      }
      // Создаем отдельный элемент для текста уведомления
      if (this.text && this.text !== "") {
        const messageElem = document.createElement("div");
        messageElem.classList.add("vgalert-message");
        messageElem.innerHTML = this.text;
        this.elem.appendChild(messageElem);
      }
  
      // Добавляем кнопки для типа confirm
      if (this.type === "confirm") {
        const buttonsContainer = document.createElement("div");
        buttonsContainer.classList.add("vgalert-buttons");
        // Кнопка подтверждения
        const confirmBtn = document.createElement("button");
        confirmBtn.classList.add("vgalert-confirm");
        confirmBtn.textContent = this.confirmButtonText;
        confirmBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (this.onConfirm) {
            this.onConfirm(this);
          }
          this.hide();
        });
        buttonsContainer.appendChild(confirmBtn);
        // Кнопка отмены (если разрешено)
        if (this.cancelButtonShow) {
          const cancelBtn = document.createElement("button");
          cancelBtn.classList.add("vgalert-cancel");
          cancelBtn.textContent = this.cancelButtonText;
          cancelBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (this.onCancel) {
              this.onCancel(this);
            }
            this.hide();
          });
          buttonsContainer.appendChild(cancelBtn);
        }
        this.elem.appendChild(buttonsContainer);
        // Кнопка закрытия (крестик) для confirm, если разрешено
        if (this.closeButton) {
          const closeBtn = document.createElement("span");
          closeBtn.classList.add("vgalert-close");
          closeBtn.innerHTML = this.closeButtonText || "&times;";
          closeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (this.onCancel) {
              this.onCancel();
            }
            this.hide();
          });
          this.elem.appendChild(closeBtn);
        }
      } else if (this.closeButton) {
        const closeBtn = document.createElement("span");
        closeBtn.classList.add("vgalert-close");
        closeBtn.innerHTML = this.closeButtonText || "&times;";
        closeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.hide();
        });
        this.elem.appendChild(closeBtn);
      }
  
      this.elem.setAttribute("data-vgalert-position", this.rawPosition);
      if (this.parent instanceof Element) {
        if (this.parent.id && this.parent.id.trim() !== "") {
          this.elem.setAttribute("data-vgalert-parent", this.parent.id);
        } else if (this.parent.className && this.parent.className.trim() !== "") {
          this.elem.setAttribute("data-vgalert-parent", this.parent.className);
        } else {
          this.elem.setAttribute("data-vgalert-parent", "true");
        }
      } else {
        this.elem.removeAttribute("data-vgalert-parent");
      }
  
      // Чтобы избежать резкого "подскока" при позиционировании,
      // временно отключаем CSS-переходы.
      document.body.appendChild(this.elem);
  
      const usingParent = this.parent instanceof Element;
      this.elem.style.position = usingParent ? "absolute" : "fixed";
  
      const pos = this.recalcPosition();
      this.elem.style.left = pos.computedLeft + "px";
      this.elem.style.top = pos.computedTop + "px";
      this.baseComputedTop = pos.baseComputedTop;
  
      // Через небольшой таймаут устанавливаем плавный переход.
      // Теперь при изменении top, left или opacity уведомление будет двигаться плавно.
      setTimeout(() => {
        this.show();
      }, 50);
  
      // Для confirm создаём overlay и запрещаем скролл
      if (this.type === "confirm") {
        this.overlay = document.createElement("div");
        this.overlay.classList.add("vgalert-overlay");
        this.overlay.tabIndex = 0; // overlay теперь может получать фокус
        this.overlay.addEventListener("mousedown", (e) => {
          e.stopPropagation();
          this._shake();
        });
        this.overlay.addEventListener("focus", () => {
          // Если overlay получил фокус, возвращаем фокус в окно confirm
          const btn = this.elem.querySelector('button, [tabindex]:not([tabindex="-1"])');
          if (btn) btn.focus();
        });
        document.body.appendChild(this.overlay);
        document.body.style.overflow = 'hidden';
        // Ловушка фокуса
        this._focusHandler = (e) => {
          if (e.key === 'Tab') {
            const focusable = this.elem.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey) {
              if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
              }
            } else {
              if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
              }
            }
          }
        };
        document.addEventListener('keydown', this._focusHandler, true);
        // Устанавливаем фокус на первую кнопку
        setTimeout(() => {
          const btn = this.elem.querySelector('button, [tabindex]:not([tabindex="-1"])');
          if (btn) btn.focus();
        }, 0);
      }
    }
  
    _shake() {
      if (!this.elem) return;
      this.elem.classList.remove("vgalert--shake");
      // Триггерим reflow для перезапуска анимации
      void this.elem.offsetWidth;
      this.elem.classList.add("vgalert--shake");
    }
  
    // recalcPosition рассчитывает текущие координаты уведомления.
    recalcPosition() {
      const usingParent = this.parent instanceof Element;
      let containerRect, containerLeft, containerTop;
      if (usingParent) {
        containerRect = this.parent.getBoundingClientRect();
        containerLeft = containerRect.left + window.pageXOffset;
        containerTop = containerRect.top + window.pageYOffset;
      } else {
        containerRect = {
          left: 0,
          top: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
        containerLeft = 0;
        containerTop = 0;
      }
      const alertWidth = this.elem.offsetWidth;
      const alertHeight = this.elem.offsetHeight;
      let computedLeft, computedTop, baseComputedTop;
  
      // Горизонтальное позиционирование.
      if (usingParent) {
        if (this.horizAlign === "left") {
          computedLeft = containerLeft - alertWidth - this.offsetLeft;
        } else if (this.horizAlign === "center") {
          computedLeft = containerLeft + containerRect.width / 2 - alertWidth / 2;
        } /* right */ else {
          computedLeft = containerLeft + containerRect.width + this.offsetRight;
        }
      } else {
        if (this.horizAlign === "left") {
          computedLeft = containerLeft + this.offsetLeft;
        } else if (this.horizAlign === "center") {
          computedLeft = containerLeft + containerRect.width / 2 - alertWidth / 2;
        } /* right */ else {
          computedLeft =
            containerLeft + containerRect.width - alertWidth - this.offsetRight;
        }
      }
  
      // Вертикаль
      if (usingParent) {
        if (this.vertAlign === "top") {
          baseComputedTop = containerTop - alertHeight - this.offsetTop;
        } else if (this.vertAlign === "bottom") {
          baseComputedTop =
            containerTop + containerRect.height + this.offsetBottom;
        } /* center */ else {
          baseComputedTop =
            containerTop + containerRect.height / 2 - alertHeight / 2;
        }
      } else {
        if (this.vertAlign === "top") {
          baseComputedTop = containerTop + this.offsetTop;
        } else if (this.vertAlign === "center") {
          baseComputedTop =
            containerTop + containerRect.height / 2 - alertHeight / 2;
        } /* bottom */ else {
          baseComputedTop =
            containerTop + containerRect.height - alertHeight - this.offsetBottom;
        }
      }
      computedTop = baseComputedTop;
  
      // Если группировка включена (и не используется parent)
      if (this.group && !usingParent) {
        const groupKey = this.groupKey;
        if (!VGalert.groupedGroups[groupKey]) {
          VGalert.groupedGroups[groupKey] = [];
        }
        let groupArr = VGalert.groupedGroups[groupKey];
        // Новые уведомления появляются сверху в группе
        if (groupArr.indexOf(this) === -1) {
          groupArr.unshift(this);
        }
        // Если groupMax задан или группа не вмещается в окно, сбрасываем группу
        if (
          (typeof this.groupMax === "number" &&
            groupArr.length > this.groupMax) ||
          (typeof this.groupMax !== "number" &&
            this._wouldOverflowWindow(groupArr))
        ) {
          groupArr.forEach((notif) => notif.hide());
          VGalert.groupedGroups[groupKey] = [];
          groupArr = VGalert.groupedGroups[groupKey];
          groupArr.unshift(this);
        } else {
          VGalert.recalcGroupPositions(groupKey);
        }
        computedTop = parseFloat(this.elem.style.top);
      }
  
      return { computedLeft, computedTop, baseComputedTop };
    }
  
    // Метод проверяет, выходит ли группа уведомлений за пределы окна
    _wouldOverflowWindow(groupArr) {
      if (groupArr.length === 0) return false;
      const containerHeight = window.innerHeight;
      const notif = groupArr[0];
      const alertHeight = notif.elem.offsetHeight;
      const gap = notif.groupGap;
  
      if (notif.vertAlign === "bottom") {
        // вместо notif.offset → notif.offsetBottom
        const baseline = containerHeight - alertHeight - notif.offsetBottom;
        const computedTopForNewest =
          baseline - (groupArr.length - 1) * (alertHeight + gap);
        return computedTopForNewest < 0;
      } else {
        // вместо notif.offset → notif.offsetTop
        const baseline = notif.offsetTop;
        const computedBottomForOldest =
          baseline + (groupArr.length - 1) * (alertHeight + gap) + alertHeight;
        return computedBottomForOldest > containerHeight;
      }
    }
  
    // Обновляет позицию уведомления (например, при изменении размеров окна)
    reposition() {
      const pos = this.recalcPosition();
      this.elem.style.left = pos.computedLeft + "px";
      this.elem.style.top = pos.computedTop + "px";
      this.baseComputedTop = pos.baseComputedTop;
    }
  
    show() {
      // 0) Для autoClose:false или типа confirm: закрываем все уведомления другого типа
      if (this.autoClose === false || this.type === "confirm") {
        VGalert.allNotifications.forEach((notif) => {
          if (
            notif !== this &&
            (notif.autoClose === false || notif.type === "confirm") &&
            notif.group !== this.group
          ) {
            notif.hide();
            if (notif.group && VGalert.groupedGroups[notif.groupKey]) {
              VGalert.groupedGroups[notif.groupKey] = [];
            }
          }
        });
      }
  
      // A) Одиночные с autoClose:false или типа confirm с одинаковым content заменяем
      if (!this.group && (this.autoClose === false || this.type === "confirm")) {
        VGalert.allNotifications.forEach((notif) => {
          if (
            notif !== this &&
            !notif.group &&
            (notif.autoClose === false || notif.type === "confirm") &&
            notif.title === this.title &&
            notif.text === this.text &&
            JSON.stringify(notif.classes) === JSON.stringify(this.classes)
          ) {
            notif.hide();
          }
        });
      }
  
      // B) Групповые с autoClose:false из других групп закрываем
      if (this.group && this.autoClose === false) {
        VGalert.allNotifications.forEach((notif) => {
          if (
            notif !== this &&
            notif.group &&
            notif.autoClose === false &&
            notif.groupKey !== this.groupKey
          ) {
            notif.hide();
            VGalert.groupedGroups[notif.groupKey] = [];
          }
        });
      }
  
      // C) Обработка closeOthers
      if (this.closeOthers) {
        VGalert.allNotifications.forEach((notif) => {
          // если группируем, закрываем только из других групп, иначе — всё
          const shouldClose =
            notif !== this &&
            (this.group ? notif.groupKey !== this.groupKey : true);
  
          if (shouldClose) {
            notif.hide();
          }
        });
  
        // очистка groupedGroups:
        if (this.group) {
          // оставляем только текущую группу
          Object.keys(VGalert.groupedGroups).forEach((key) => {
            if (key !== this.groupKey) {
              delete VGalert.groupedGroups[key];
            }
          });
        } else {
          // удаляем все группы
          VGalert.groupedGroups = {};
        }
      }
  
      if (!this.group && this.autoClose) {
        if (VGalert.currentAlert) {
          VGalert.currentAlert.hide();
        }
        VGalert.currentAlert = this;
      }
      // Изначально устанавливаем opacity = 0 для плавного появления
      this.elem.style.opacity = "0";
      // Форсируем рефлоу
      window.getComputedStyle(this.elem).opacity;
      this.elem.classList.add("show");
      // Устанавливаем opacity = 1 – сработает плавный fade‑in благодаря transition
      this.elem.style.opacity = "1";
  
      // Если задан onOpen, добавляем обработчик transitionend для opacity
      this.elem.addEventListener(
        "transitionend",
        (e) => {
          if (e.propertyName === "opacity" && typeof this.onOpen === "function") {
            this.onOpen(this);
          }
        },
        { once: true }
      );
  
      // Для типа confirm отключаем автозакрытие
      if (this.duration > 0 && this.autoClose && this.type !== "confirm") {
        this.hideTimer = setTimeout(() => this.hide(), this.duration);
      }
    }
  
    hide() {
      if (!this.elem.classList.contains("show")) return;
      if (this.group && this.groupKey && VGalert.groupedGroups[this.groupKey]) {
        VGalert.groupedGroups[this.groupKey] = VGalert.groupedGroups[
          this.groupKey
        ].filter((item) => item !== this);
        VGalert.recalcGroupPositions(this.groupKey);
      }
      this.elem.style.opacity = "0";
      this.elem.classList.remove("show");
      this.elem.addEventListener(
        "transitionend",
        () => {
          // Если задан onClose, вызываем callback здесь
          if (typeof this.onClose === "function") {
            this.onClose(this);
          }
          if (this.elem && this.elem.parentNode) {
            this.elem.parentNode.removeChild(this.elem);
          }
          VGalert.allNotifications = VGalert.allNotifications.filter(
            (item) => item !== this
          );
          if (VGalert.currentAlert === this) {
            VGalert.currentAlert = null;
          }
          if (this.type === "confirm" && this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
            document.body.style.overflow = '';
            document.removeEventListener('keydown', this._focusHandler, true);
          }
        },
        { once: true }
      );
    }
  
    // Изменение текста уведомления. Обновляет внутреннее свойство и меняет содержимое элемента с классом "vgalert-message"
    setText(newText) {
      this.text = newText;
      const messageElem = this.elem.querySelector(".vgalert-message");
      if (messageElem) {
        messageElem.textContent = newText;
      }
    }
  
    // Пересчитывает позиции для всех уведомлений в группе
    static recalcGroupPositions(groupKey) {
      const groupArr = VGalert.groupedGroups[groupKey];
      if (!groupArr || groupArr.length === 0) return;
      const containerRect = {
        top: 0,
        height: window.innerHeight,
      };
  
      let baseComputedTop;
      const vertAlign = groupArr[0].vertAlign;
  
      if (vertAlign === "bottom") {
        // Для нижнего выравнивания базовая позиция рассчитывается как раньше
        const alertHeight = groupArr[0].elem.offsetHeight;
        baseComputedTop =
          containerRect.top +
          containerRect.height -
          alertHeight -
          groupArr[0].offsetBottom;
      } else if (vertAlign === "center") {
        // Вычисляем общую высоту группы:
        let totalHeight =
          groupArr.reduce((sum, notif) => sum + notif.elem.offsetHeight, 0) +
          (groupArr.length - 1) * groupArr[0].groupGap;
        baseComputedTop =
          containerRect.top + (containerRect.height - totalHeight) / 2;
      } else {
        // Для выравнивания "top" (и по умолчанию) базовая позиция равна отступу от верха и offset
        baseComputedTop = containerRect.top + groupArr[0].offsetTop;
      }
  
      // Распределяем уведомления относительно вычисленной базовой позиции
      groupArr.forEach((notif, i) => {
        let newTop;
        if (vertAlign === "bottom") {
          newTop =
            baseComputedTop -
            (groupArr.length - 1 - i) *
              (notif.elem.offsetHeight + notif.groupGap);
        } else {
          // Для "center" и "top": суммируем высоты всех предыдущих уведомлений
          let sumHeights = 0;
          for (let j = 0; j < i; j++) {
            sumHeights += groupArr[j].elem.offsetHeight;
          }
          newTop = baseComputedTop + sumHeights + i * notif.groupGap;
        }
        notif.elem.style.top = newTop + "px";
      });
    }
  
    // Обработчик изменения размеров окна – обновляет позиции всех уведомлений
    static handleResize() {
      VGalert.allNotifications.forEach((notif) => {
        notif.reposition();
      });
    }
  
    /**
     * Закрывает все текущие уведомления сразу.
     */
    static closeAll() {
      // Копируем массив, чтобы не модифицировать его во время обхода
      const alerts = VGalert.allNotifications.slice();
      alerts.forEach((alert) => alert.hide());
  
      // Сбрасываем группировку и текущий alert
      VGalert.groupedGroups = {};
      VGalert.currentAlert = null;
    }
  }
  
  window.addEventListener("resize", VGalert.handleResize);