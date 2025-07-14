(function () {
	const slider = document.querySelector(".card-slider");

	if (!slider) return;

	const sliderParams = {
		slidesPerView: "auto",
		spaceBetween: 16,
		grabCursor: true,
		speed: 16000,
		mousewheel: {
			forceToAxis: true,
		},
		//loop: true,
		// autoplay: {
		// 	delay: 0,
		// 	paused: false,
		// },
		//freeMode: true,
	};
	new Swiper(slider, sliderParams);
})();
