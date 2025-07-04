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

	initGallery("index-gallery");
	initGallery("index-demo");
})();
