(function () {
	const navigations = document.querySelectorAll('a[href*="#"]');
	if (!navigations.length) return;

	navigations.forEach(nav => {
		nav.addEventListener("click", function (e) {
			const blockID = nav.getAttribute('href');

			if (blockID === "#") return;

			const target = document.querySelector(blockID);
			if (!target) return;

			e.preventDefault();
			target.scrollIntoView({
				behavior: "smooth",
				block: "start"
			});
		});
	});
})();
