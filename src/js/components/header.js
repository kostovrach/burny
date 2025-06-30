(function () {
	const header = document.querySelector(".header");

	if (!header) return;

	window.addEventListener("scroll", () => {
		const isStickyMode = window.scrollY > 10 && header.classList.contains("js-sticky") || document.body.classList.contains("lock");

		header.classList.toggle("sticky", isStickyMode);
	});

	// const navItemMore = header.querySelector(".header__nav-item--more");

	// navItemMore.addEventListener("click", function (event) {
	// 	event.stopPropagation();
	// 	this.classList.toggle("active");
	// });

	// document.addEventListener("click", function (e) {
	// 	if (!navItemMore.contains(e.target)) {
	// 		navItemMore.classList.remove("active");
	// 	}
	// });
})();
