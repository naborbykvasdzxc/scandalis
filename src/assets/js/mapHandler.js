import VGmap from "./initMap";

export async function mapHandler() {

  const map = document.querySelector(".contacts__map");
  const mapButtons = document.querySelector(".contacts__buttons");
  if (!map) return;



  const contactsMap = new VGmap(map);

  // contactsMap.initDebug();

  const markersData = await contactsMap.getMarkersData();

  function createMarkerMenu(data) {
    removeMarkerMenu();
    for (const marker of data) {
      const markerElement = document.createElement("div");
      markerElement.classList.add("contacts__button");
      markerElement.innerHTML = `
            <div class="contacts__name">${marker.name}</div>
            <div class="contacts__city">${marker.city}</div>
            <div class="contacts__address">${marker.address}</div>
            <div class="contacts__bottom">
                <div class="contacts__time">${marker.time}</div>
                <a href="${marker.link}" target="_blank" class="contacts__link">построить маршрут</a>
            </div>
         `;
      mapButtons.appendChild(markerElement);
      markerElement.addEventListener("click", () => {
        const correctPosition = marker.position.toReversed();
        contactsMap.changeState(correctPosition);
      });
    }
  }

  function removeMarkerMenu() {
    const markerMenu = document.querySelectorAll(".contacts__button");
    for (const el of markerMenu) {
      el.remove();
    }
  }

  createMarkerMenu(markersData);

  const mapDropButton = document.querySelector(".contacts__dropbutton");
  const mapDropList = document.querySelector(".contacts__droplist");
  mapDropButton.addEventListener("click", () => {
    mapDropList.classList.toggle("active");
  });

  const mapDropListElements = document.querySelectorAll(
    ".contacts__droplist-element"
  );
  for (const el of mapDropListElements) {
    el.addEventListener("click", async () => {
      const mapTarget = el.dataset.mapTarget;
      contactsMap.mapElement.dataset.mapConfig = mapTarget;
      if (el.classList.contains("active")) {
        return;
      }
      const currentMapData = await contactsMap.getCurrentMapData();
      mapDropList.classList.remove("active");
      mapDropListElements.forEach((el) => {
        el.classList.remove("active");
      });
      el.classList.add("active");
      mapDropButton.textContent = el.textContent;
      createMarkerMenu(currentMapData.markers);

      contactsMap.updateView(currentMapData);
    });
  }
}
