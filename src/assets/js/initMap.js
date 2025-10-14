import Map from "ol/Map.js";
import OSM from "ol/source/OSM.js";
import TileLayer from "ol/layer/Tile.js";
import View from "ol/View.js";
import { fromLonLat } from "ol/proj.js";
import { Vector as VectorSource } from "ol/source.js";
import { Vector as VectorLayer } from "ol/layer.js";
import Overlay from "ol/Overlay.js";
import  MapEvent  from "ol/MapEvent.js";
import { boundingExtent } from "ol/extent.js";

export default class VGMap {
  #map = null;
  #settings = null;
  #mapConfigs = [];
  #currentOverlays = [];
  mapElement = null;

  constructor(mapElement) {
    if (!mapElement) {
      console.error("Элемент карты не был передан в конструктор.");
      return;
    }
    this.mapElement = mapElement;

    this.init();
  }

  async init() {
    const configData = await this.#loadConfig();
    if (!configData) return;

    this.#settings = configData.settings;
    this.#mapConfigs = configData.maps;

    this.#createMap();
    const mapID = this.mapElement.dataset.mapConfig;
    const config = this.#mapConfigs.find((c) => c.id === mapID);
    this.updateView(config);
  }

  async #loadConfig() {
    const configUrl = this.mapElement.dataset.configUrl;
    if (!configUrl) {
      console.error(
        "URL конфигурации не указан в атрибуте data-config-url элемента карты.",
        this.mapElement
      );
      this.mapElement.innerHTML = "Ошибка: не задан источник конфигурации.";
      return null;
    }

    try {
      const response = await fetch(configUrl);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const configData = await response.json();
      return configData;
    } catch (error) {
      console.error(
        "Не удалось загрузить или обработать конфигурацию карты:",
        error
      );
      this.mapElement.innerHTML = "Ошибка загрузки данных для карты.";
      return null;
    }
  }

  #createMap() {
    const vectorLayer = new VectorLayer({ source: new VectorSource() });
    const tileLayer = new TileLayer({
      source: new OSM({
        url:
          this.#settings.tileLayerUrl ||
          "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      }),
      className: "vgmap-tile-class",
    });

    this.#map = new Map({
      layers: [tileLayer, vectorLayer],
      target: this.mapElement,
      view: new View({
        center: fromLonLat(this.#settings.defaultCenter || [0, 0]),
        zoom: this.#settings.defaultZoom || 1,
        minZoom: this.#settings.minZoom || 0,
        maxZoom: this.#settings.maxZoom || 28,
      }),
    });
  }

  updateView(config) {
    if (!this.#map || !config) return;

    const view = this.#map.getView();

    view.setMinZoom(config.minZoom || this.#settings.minZoom || 0);
    view.setMaxZoom(config.maxZoom || this.#settings.maxZoom || 28);

    this.#currentOverlays.forEach((overlay) =>
      this.#map.removeOverlay(overlay)
    );
    this.#currentOverlays = [];

    if (Array.isArray(config.markers) && config.markers.length > 0) {
      this.#addMarkers(config.markers);
      
      // Вычисляем extent на основе всех маркеров
      const coordinates = config.markers.map(marker => 
        fromLonLat(marker.position.toReversed())
      );
      const extent = boundingExtent(coordinates);
      
      // Используем fit для отображения всех маркеров с padding
      view.fit(extent, {
        padding: [30, 30, 30, 30], // отступы в пикселях
        duration: 400,
        maxZoom: config.zoom || this.#settings.defaultZoom, // ограничиваем максимальный зум
      });
    } else {
      // Если маркеров нет, используем обычную анимацию
      view.animate({
        center: fromLonLat(
          config.center.toReversed() || this.#settings.defaultCenter.toReversed()
        ),
        zoom: config.zoom || this.#settings.defaultZoom,
        duration: 400,
      });
    }

    this.#map.updateSize();
  }

  changeState(state) {
    this.#map.getView().animate({
        center: fromLonLat(state),
        zoom: 16,
        duration: 400,
      });
  }

  async getCurrentMapData() {
    const configData = await this.#loadConfig();
    if (!configData) return;

    const currentMapData = configData.maps.find(
      (c) => c.id === this.mapElement.dataset.mapConfig
    );

    return currentMapData;
  }

  async getMarkersData() {
    const configData = await this.#loadConfig();
    if (!configData) return;

    this.#settings = configData.settings;
    this.#mapConfigs = configData.maps;

    return this.#mapConfigs.find(
      (c) => c.id === this.mapElement.dataset.mapConfig
    ).markers;
  }

  #addMarkers(markers) {
    const markerTemplate = document.getElementById("marker-template");
    if (!markerTemplate) {
      console.error("Шаблон для маркеров с ID 'marker-template' не найден.");
      return;
    }

    markers.forEach((markerData) => {
      if (!markerData || !markerData.position || !markerData.iconSrc) {
        console.warn(
          "Пропущена некорректная метка (нужны position и iconSrc):",
          markerData
        );
        return;
      }

      const markerElement = markerTemplate.firstElementChild.cloneNode(true);
      markerElement.querySelector(".marker-icon").src = markerData.iconSrc;
      const textElement = markerElement.querySelector(".marker-text");

      if (markerData.label && markerData.label.trim() !== "") {
        textElement.textContent = markerData.label;
      } else {
        markerElement.classList.add("no-label");
      }

      const overlay = new Overlay({
        element: markerElement,
        position: fromLonLat(markerData.position.toReversed()),
        positioning: "center-center",
        stopEvent: false,
      });

      this.#map.addOverlay(overlay);
      this.#currentOverlays.push(overlay);
    });
  }

  // initDebug(){
  //   // Получаем текущий центр карты
  //   const center = this.getMapCenter();
  //   console.log("Текущий центр карты:", center);
    
  //   // Добавляем обработчик для отслеживания изменений центра
  //   this.onMapMoveEnd(() => {
  //     const newCenter = this.getMapCenter();
  //     console.log("Новый центр карты:", newCenter);
  //   });
  // }


  // getMapCenter(){
  //   if (!this.#map) {
  //     console.warn("Карта не инициализирована");
  //     return null;
  //   }
  //   return this.#map.getView().getCenter();
  // }

  // onMapMoveEnd(callback) {
  //   if (!this.#map) {
  //     console.warn("Карта не инициализирована");
  //     return;
  //   }
  //   this.#map.on(MapEvent.EventType.MOVEEND, callback);
  // }
}
