import Swiper from "swiper";
import { Navigation, EffectFade, Autoplay } from "swiper/modules";

const storiesItems = document.querySelectorAll(".stories__item");
const storiesModal = document.querySelector(".stories-modal");
const storiesModalContainer = storiesModal.querySelector(
  ".stories-modal__container"
);

// Функции для работы с куки
function setCookie(name, value, days = 30) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function getViewedStories() {
  const viewedStories = getCookie('viewedStories');
  return viewedStories ? JSON.parse(viewedStories) : [];
}

function markStoryAsViewed(storyId) {
  const viewedStories = getViewedStories();
  if (!viewedStories.includes(storyId)) {
    viewedStories.push(storyId);
    setCookie('viewedStories', JSON.stringify(viewedStories));
  }
}

function applySeenClass() {
  const viewedStories = getViewedStories();
  storiesItems.forEach(item => {
    const storyId = item.getAttribute('data-stories-id');
    if (viewedStories.includes(storyId)) {
      item.classList.add('seen');
    }
  });
}

function initStories() {
  const storiesModalItems = Array.from(storiesItems)
    .map((item, index) => {
      const imageSrc = item.querySelector("img").getAttribute("src");
      const imageAlt = item.querySelector("img").getAttribute("alt");
      const imageDescription =
        item.querySelector("img").dataset.description || "";
      const imageIndex = index;
      return `
      <div class="stories-modal__item swiper-slide" data-index="${imageIndex}">
        <div class="stories-modal__item__progress">
          <div class="stories-modal__item__progress-fill"></div>
        </div>
        <img src="${imageSrc}" alt="${imageAlt}">
        <div class="stories-modal__content">
          <div class="stories-modal__top">
            <img src="${imageSrc}" alt="${imageAlt}"> <p>${imageAlt}</p>
          </div>
          <div class="stories-modal__bottom">
            <div class="stories-modal__name">${imageAlt}</div>
            <div class="stories-modal__description">${imageDescription}</div>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
  storiesModalContainer.innerHTML = `<div class="swiper-wrapper">${storiesModalItems}</div>`;
}

export function initStoriesModal() {
  let storiesReady = false;
  let storiesSwiper = null;
  let progressInterval = null;
  let currentSlideIndex = 0;
  let closeTimer = null;
  
  // Применяем класс seen к уже просмотренным историям при инициализации
  applySeenClass();

  function closeStoriesModal() {
    storiesModal.classList.remove("active");
    // Останавливаем автоплей и сбрасываем прогресс
    if (storiesSwiper) {
      storiesSwiper.autoplay.stop();
    }
    clearInterval(progressInterval);
    clearTimeout(closeTimer);
    resetProgressBars();
  }

  function resetProgressBars() {
    const slides = storiesModal.querySelectorAll(".stories-modal__item");
    slides.forEach((slide) => {
      const progressBar = slide.querySelector(".stories-modal__item__progress");
      const fill = slide.querySelector(".stories-modal__item__progress-fill");
      progressBar.classList.remove("active", "completed");
      fill.style.width = "0%";
      fill.style.animation = "none";
    });
  }

  function updateProgressBar(slideIndex) {
    const slides = storiesModal.querySelectorAll(".stories-modal__item");

    // Сбрасываем все прогресс бары
    slides.forEach((slide, index) => {
      const progressBar = slide.querySelector(".stories-modal__item__progress");
      const fill = slide.querySelector(".stories-modal__item__progress-fill");
      progressBar.classList.remove("active", "completed");
      fill.style.width = "0%";
      fill.style.animation = "none";

      if (index < slideIndex) {
        progressBar.classList.add("completed");
        fill.style.width = "100%";
      }
    });

    // Активируем текущий прогресс бар
    if (slides[slideIndex]) {
      const progressBar = slides[slideIndex].querySelector(
        ".stories-modal__item__progress"
      );
      const fill = slides[slideIndex].querySelector(
        ".stories-modal__item__progress-fill"
      );
      progressBar.classList.add("active");
      fill.style.animation = "progressFill 5s linear forwards";
    }
  }

  const storiesModalClose = storiesModal.querySelector(".stories-modal__close");
  const storiesModalFade = storiesModal.querySelector(".stories-modal__fade");
  const storiesModalPrev = storiesModal.querySelector(".stories-modal__prev");
  const storiesModalNext = storiesModal.querySelector(".stories-modal__next");
  
  storiesModalClose?.addEventListener("click", closeStoriesModal);
  storiesModalFade?.addEventListener("click", closeStoriesModal);
  
  // Обработчики для ручной навигации
  storiesModalPrev?.addEventListener("click", () => {
    if (storiesSwiper) {
      storiesSwiper.slidePrev();
    }
  });
  
  storiesModalNext?.addEventListener("click", () => {
    if (storiesSwiper) {
      storiesSwiper.slideNext();
    }
  });

  storiesItems.forEach((item, index) => {
    item.dataset.index = index; // Добавляем индекс к каждому элементу
    item.addEventListener("click", () => {
      if (!storiesReady) {
        initStories();
        // Инициализируем Swiper после добавления контента
        storiesSwiper = new Swiper(".stories-modal__container", {
          modules: [Navigation, EffectFade, Autoplay],
          slidesPerView: 1,
          navigation: {
            nextEl: ".stories-modal__next",
            prevEl: ".stories-modal__prev",
          },
          autoplay: {
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          },
          on: {
            slideChange: function () {
              currentSlideIndex = this.activeIndex;
              updateProgressBar(currentSlideIndex);

              // Отмечаем текущую историю как просмотренную
              const currentStoryId = storiesItems[currentSlideIndex]?.getAttribute('data-stories-id');
              if (currentStoryId) {
                markStoryAsViewed(currentStoryId);
                storiesItems[currentSlideIndex].classList.add('seen');
              }

              // Отменяем предыдущий таймер закрытия, если он есть
              clearTimeout(closeTimer);

              // Проверяем, если это последний слайд
              if (currentSlideIndex === this.slides.length - 1) {
                // Запускаем таймер для закрытия модального окна через 5 секунд
                closeTimer = setTimeout(() => {
                  closeStoriesModal();
                }, 5000);
              }
            },
            autoplayStart: function () {
              updateProgressBar(this.activeIndex);
              
              // Отмечаем первую историю как просмотренную при старте автоплея
              const currentStoryId = storiesItems[this.activeIndex]?.getAttribute('data-stories-id');
              if (currentStoryId) {
                markStoryAsViewed(currentStoryId);
                storiesItems[this.activeIndex].classList.add('seen');
              }
            },
            autoplayStop: function () {
              clearInterval(progressInterval);
            },
          },
        });
        storiesReady = true;
      }
      storiesModal.classList.add("active");
      const imageIndex = parseInt(item.dataset.index);
      currentSlideIndex = imageIndex;
      if (storiesSwiper) {
        storiesSwiper.slideTo(imageIndex);
        storiesSwiper.autoplay.start();
      }
    });
  });
}
