(function () {
	const section = document.querySelector(".js-progress-section");
	const progressBar = document.querySelector(".js-progressbar-inner");

	if (!section || !progressBar) return;

	function updateProgressBar() {
		const rect = section.getBoundingClientRect();
		const windowHeight = window.innerHeight;

		const start = windowHeight * 0.2;
		const end = rect.height - windowHeight * 0.3;

		const visibleTop = Math.max(0, -rect.top + start);
		const maxScrollable = end;

		const progress = Math.min(1, Math.max(0, visibleTop / maxScrollable));

		progressBar.style.height = `${progress * 100}%`;
	}

	window.addEventListener("scroll", updateProgressBar);
	window.addEventListener("resize", updateProgressBar);
	window.addEventListener("load", updateProgressBar);
})();
