(function () {
	const mainSlider = document.querySelector(".index-hero__background-container");
	const thumbsSlider = document.querySelector(".index-hero__background-thumbs");

	if (!mainSlider || !thumbsSlider) return;

	const thumbsSwiper = new Swiper(thumbsSlider, {
		spaceBetween: 16,
		slidesPerView: "auto",
		direction: "vertical",
		watchSlidesProgress: true,
		mousewheel: true,
	});

	const mainSwiper = new Swiper(mainSlider, {
		spaceBetween: 0,
		loop: true,
		parallax: true,
		autoplay: {
			enable: true,
			delay: 5000,
		},
		speed: 800,
		effect: "creative",
		creativeEffect: {
			next: {
				translate: ["-10%", 0, 0],
				opacity: 0,
			},
			prev: {
				translate: ["10%", 0, 0],
				opacity: 0,
			},
		},
		thumbs: {
			swiper: thumbsSwiper,
		},
	});

	mainSwiper.on("slideChange", () => {
		const realIndex = mainSwiper.realIndex;
		const targetSlide = thumbsSwiper.slides[realIndex];

		if (targetSlide) {
			thumbsSwiper.slideTo(thumbsSwiper.slides.indexOf(targetSlide), 600);
		}
	});
})();
