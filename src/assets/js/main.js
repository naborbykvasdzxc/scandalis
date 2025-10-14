

import { initSwipers } from "./initSwipers";

import "../scss/main.scss";

import { initHeader } from "./initHeader";
import { initStoriesModal } from "./initStories";
import { mapHandler } from "./mapHandler";
import { initAnimations } from "./initAnimations";
import { initSertificate } from "./initSertificate";
import { initModals } from "./initModals";
import { utils } from "./utils";


document.addEventListener("DOMContentLoaded", () => {
  initSwipers();
  initHeader();
  initStoriesModal();
  mapHandler();
  initAnimations();
  initSertificate();
  initModals();
  utils();
});

