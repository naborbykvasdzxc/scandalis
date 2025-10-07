export function initHeader() {
  const header = document.querySelector(".header");
  if (header) {
    document.body.style.setProperty(
      "--header",
      `${document.querySelector(".header").clientHeight}px`
    );
  }

  function handlePopup(target, buttons, className) {
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        document.body.classList.toggle(className);
        setTimeout(() => {
          target.classList.toggle("active");
        }, 800);
      });
    });
  }

  const search = document.querySelector(".search");
  const searchButtons = document.querySelectorAll("[data-search-button]");
  handlePopup(search, searchButtons, "search-open");

  const burger = document.querySelector(".burger");
  if (burger) {
    const burgerButtons = document.querySelectorAll("[data-burger-button]");

    handlePopup(burger, burgerButtons, "menu-open");

    const burgerSubmenuButtons = document.querySelectorAll("[data-submenu]");
    const burgerSubmenus = document.querySelectorAll("[data-submenu-target]");
    burgerSubmenuButtons.forEach((button) => {
      button.addEventListener("click", () => {
        Array.from(burgerSubmenus)
          .find(
            (submenu) =>
              submenu.dataset.submenuTarget === button.dataset.submenu
          )
          .classList.add("active");
      });
    });
    const burgerDefaultButtons = document.querySelectorAll(".burger__default");
    burgerDefaultButtons.forEach((button) => {
      button.addEventListener("click", () => {
        button.parentElement.classList.remove("active");
      });
    });
  }

  const searchBar = document.querySelector(".search__input");
  const DELAY_AFTER_ANIMATION = 1000;
  const PLACEHOLDERS = [
    "джинсы женские",
    "Худи",
    "Брюки",
    "Хайп специально для Андрюши",
  ];

  const getRandomDelayBetween = (min, max) =>
    Math.floor(Math.random() * (max - min + 1) + min);

  const setPlaceholder = (inputNode, placeholder) => {
    inputNode.setAttribute("placeholder", placeholder);
  };

  const animateLetters = (
    currentLetters,
    remainingLetters,
    inputNode,
    onAnimationEnd
  ) => {
    if (!remainingLetters.length) {
      return (
        typeof onAnimationEnd === "function" &&
        onAnimationEnd(currentLetters.join(""), inputNode)
      );
    }

    currentLetters.push(remainingLetters.shift());

    setTimeout(() => {
      setPlaceholder(inputNode, currentLetters.join(""));
      animateLetters(
        currentLetters,
        remainingLetters,
        inputNode,
        onAnimationEnd
      );
    }, getRandomDelayBetween(70, 150));
  };

  const animatePlaceholder = (inputNode, placeholder, onAnimationEnd) => {
    animateLetters([], placeholder.split(""), inputNode, onAnimationEnd);
  };

  const onAnimationEnd = (placeholder, inputNode) => {
    setTimeout(() => {
      let newPlaceholder =
        PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)];

      do {
        newPlaceholder =
          PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)];
      } while (placeholder === newPlaceholder);

      animatePlaceholder(inputNode, newPlaceholder, onAnimationEnd);
    }, DELAY_AFTER_ANIMATION);
  };

  window.addEventListener("load", () => {
    animatePlaceholder(searchBar, PLACEHOLDERS[0], onAnimationEnd);
  });

  function handleScroll() {
    if (window.scrollY > 10) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
  handleScroll();

  document.addEventListener("scroll", () => {
    handleScroll();
  });
}
