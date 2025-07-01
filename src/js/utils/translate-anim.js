(function () {
	const animItem = document.querySelectorAll("[data-hover-anim]");

	if (!animItem.length) return;

	animItem.forEach((item) => {
		item.querySelectorAll("span").forEach((el) => {
			el.dataset.text = el.textContent;
		});

		let timeout;

		item.addEventListener("mouseenter", () => {
			clearTimeout(timeout);
			item.classList.remove("is-leaving");
			item.classList.add("is-hovered");
		});

		item.addEventListener("mouseleave", () => {
			item.classList.remove("is-hovered");
			item.classList.add("is-leaving");
			timeout = setTimeout(() => {
				item.classList.remove("is-leaving");
			}, 800);
		});
	});
})();
