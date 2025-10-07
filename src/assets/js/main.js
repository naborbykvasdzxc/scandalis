

import { initSwipers } from "./initSwipers";

import "../scss/main.scss";

import { initHeader } from "./initHeader";
import { initStoriesModal } from "./initStories";
import { mapHandler } from "./mapHandler";



document.addEventListener("DOMContentLoaded", () => {
  initSwipers();
  initHeader();
  initStoriesModal();
  mapHandler();
  

});

