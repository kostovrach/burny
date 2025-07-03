(function () {
    const slider = document.querySelector(".index-advant__slider");

    if (!slider) return;

	const sliderParams = {
		slidesPerView: "auto",
		spaceBetween: 16,
		grabCursor: true,
		speed: 16000,
		//loop: true,
		// autoplay: {
		// 	delay: 0,
		// 	paused: false,
		// },
		//freeMode: true,
	};
    new Swiper(slider, sliderParams)
})();
