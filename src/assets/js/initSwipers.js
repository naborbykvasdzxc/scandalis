import Swiper from "swiper";
import {
  Navigation,
  Pagination,
  Scrollbar,
  EffectFade,
  Autoplay,
} from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export function initSwipers() {
  function getRem() {
    return parseFloat(getComputedStyle(document.documentElement).fontSize);
  }
  const headerSwiper = new Swiper(".header__swiper", {
    modules: [Navigation, EffectFade, Autoplay],
    navigation: {
      nextEl: ".header__next",
      prevEl: ".header__prev",
    },
    slidesPerView: 1,
    effect: "fade",
    loop: true,
    fadeEffect: {
      crossFade: true,
    },
    speed: 600,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    allowTouchMove: true,
    simulateTouch: true,
  });

  const collectionsSwiper = new Swiper(".collections__swiper", {
    modules: [Navigation, EffectFade, Autoplay],
    slidesPerView: 3,
    spaceBetween: 20 * getRem(),
    loop: true,
    initialSlide: 1,
    loopAdditionalSlides: 1,
    navigation: {
      nextEl: ".collections__next",
      prevEl: ".collections__prev",
    },
  });

  const bestsellersSwiper = new Swiper(".bestsellers__swiper", {
    modules: [Navigation, Autoplay],
    slidesPerView: "auto",
    spaceBetween: 20 * getRem(),
    navigation: {
      nextEl: ".bestsellers__next",
      prevEl: ".bestsellers__prev",
    },
  });

  const projectsSwiper = new Swiper(".projects__swiper", {
    modules: [Navigation, Autoplay],
    slidesPerView: 3,
    loop: true,
    initialSlide: 1,
    loopAdditionalSlides: 1,
    navigation: {
      nextEl: ".project__next",
      prevEl: ".project__prev",
    },
  });

  const articlesSwiper = new Swiper(".articles__swiper", {
    modules: [Navigation, Autoplay],
    slidesPerView: 3,
    spaceBetween: 40 * getRem(),
    loop: true,
  });

  const jobsSwiper = new Swiper(".jobs__swiper", {
    modules: [Navigation, Autoplay],
    slidesPerView: 4,
    spaceBetween: 40 * getRem(),
    loop: true,
  });

  const seenSwiper = new Swiper(".seen__swiper", {
    modules: [Navigation, Autoplay],
    slidesPerView: 4,
    spaceBetween: 40 * getRem(),
    loop: true,
  });
}
