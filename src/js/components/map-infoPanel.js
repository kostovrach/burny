(function () {
	const titles = document.querySelectorAll(".map__info-item-title");
	const contents = document.querySelectorAll(".map__info-item-content");

	titles.forEach((title, index) => {
		title.addEventListener("click", function () {
			// Определяем текущий активный элемент
			const currentActiveTitle = document.querySelector(".map__info-item-title.active");
			const currentActiveContent = document.querySelector(".map__info-item-content.active");

			// Убираем активность у всех элементов
			titles.forEach((t) => t.classList.remove("active"));
			contents.forEach((c) => c.classList.remove("active"));

			// Если кликнули на активный элемент, активируем другой
			if (currentActiveTitle === title) {
				const otherIndex = index === 0 ? 1 : 0;
				titles[otherIndex].classList.add("active");
				contents[otherIndex].classList.add("active");
			} else {
				// Иначе активируем кликнутый элемент
				title.classList.add("active");
				contents[index].classList.add("active");
			}
		});
	});
})();
