(function () {
	const slider = document.querySelector(".fill-slider");

	if (!slider) return;

	const sliderParams = {
		slidesPerView: "auto",
		spaceBetween: 32,
		//speed: 1000,
		// loop: true,
		// autoplay: {
		// 	delay: 0,
		// 	paused: false,
		// 	pauseOnMouseEnter: true,
		// },
		// freeMode: true,
		navigation: {
			nextEl: ".fill-slider__button--next",
			prevEl: ".fill-slider__button--prev",
		},
        keyboard: {
            enabled: true,
            onlyInViewport: true,
        },
	};

	new Swiper(slider, sliderParams);
})();
