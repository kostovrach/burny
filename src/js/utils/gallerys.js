(function () {
	function initGallery(galleryName) {
		Fancybox.bind(`[data-fancybox="${galleryName}"]`, {
			Toolbar: false,
			Carousel: {
				infinite: false,
			},
			Video: {
				autoplay: false,
			},
		});
	}

	initGallery("gallery-page");
	initGallery("gallery");
	initGallery("index-demo");
	initGallery("booking-hero-video");
	initGallery("offices-plan");
	initGallery("conference-plan");
})();
