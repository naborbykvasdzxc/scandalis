export function initTabs() {
  // Находим все контейнеры с табами на странице
  const tabContainers = document.querySelectorAll('[data-tab-container]');

  if (!tabContainers.length) return;

  tabContainers.forEach((container) => {
    // Находим все кнопки табов в текущем контейнере
    const tabButtons = container.querySelectorAll('[data-tab-button]');
    const tabContents = container.querySelectorAll('[data-tab-content]');

    if (!tabButtons.length) return;

    // Обработчик клика на кнопку таба
    tabButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab-button');

        // Убираем класс active со всех кнопок
        tabButtons.forEach((btn) => btn.classList.remove('active'));

        // Убираем класс active со всех контентов
        tabContents.forEach((content) => content.classList.remove('active'));

        // Добавляем класс active на кликнутую кнопку
        button.classList.add('active');

        // Находим и активируем соответствующий контент
        const activeContent = container.querySelector(
          `[data-tab-content="${tabName}"]`
        );

        if (activeContent) {
          activeContent.classList.add('active');
        }
      });
    });
  });
}

