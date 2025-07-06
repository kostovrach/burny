(function () {
	const titles = document.querySelectorAll(".map__info-item-title");
	const contents = document.querySelectorAll(".map__info-item-content");

	if (!titles || !contents) return;

	titles.forEach((title, index) => {
		title.addEventListener("click", function () {
			const currentActiveTitle = document.querySelector(".map__info-item-title.active");
			const currentActiveContent = document.querySelector(".map__info-item-content.active");

			titles.forEach((t) => t.classList.remove("active"));
			contents.forEach((c) => c.classList.remove("active"));

			if (currentActiveTitle === title) {
				const otherIndex = index === 0 ? 1 : 0;
				titles[otherIndex].classList.add("active");
				contents[otherIndex].classList.add("active");
			} else {
				title.classList.add("active");
				contents[index].classList.add("active");
			}
		});
	});
})();
