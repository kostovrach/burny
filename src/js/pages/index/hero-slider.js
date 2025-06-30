(function () {
	const mainSlider = document.querySelector(".index-hero__background-container");
	const thumbsSlider = document.querySelector(".index-hero__background-thumbs");

	if (!mainSlider || !thumbsSlider) return;

	const thumbsSwiper = new Swiper(thumbsSlider, {
		spaceBetween: 16,
		slidesPerView: "auto",
        direction: "vertical",
		freeMode: true,
		watchSlidesProgress: true,
		mousewheel: true,
	});

	new Swiper(mainSlider, {
		spaceBetween: 0,
        autoplay: {
            ebable: true,
            speed: 16000,
        },
        loop: true,
		parallax: true,
		effect: "creative",
		creativeEffect: {
			next: {
				translate: ["100%", 0],
			},
            prev: {
				translate: ["100%", 0],

            },
		},
		thumbs: {
			swiper: thumbsSwiper,
		},
	});
})();
