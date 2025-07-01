(function () {
	const sliderEl = document.querySelector(".index-services__slider");
	if (!sliderEl) return;

	const sliderPagination = document.querySelector(".index-services__slider-pagination");
	if (!sliderPagination) return;

	const swiper = new Swiper(sliderEl, {
		pagination: {
			el: sliderPagination,
			clickable: true,
		},
		autoplay: {
			delay: 3000,
			disableOnInteraction: false,
			//pauseOnMouseEnter: true,
		},
		speed: 800,
		parallax: true,
		effect: "creative",
		creativeEffect: {
			next: {
				translate: ["100%", 0, 0],
				opacity: 0.1,
			},
			prev: {
				translate: ["-10%", 0, 0],
				opacity: 0.1,
			},
		},
		on: {
			init(swiper) {
				addTitlesToBullets(swiper);
				highlightActiveBullet(swiper);
				setupViewportAutoplay(swiper, sliderEl);
			},
			slideChange(swiper) {
				highlightActiveBullet(swiper);
			},
		},
	});

	function addTitlesToBullets(swiper) {
		const realSlides = Array.from(swiper.slides).filter((slide) =>
			!slide.classList.contains("swiper-slide-duplicate")
		);

		const bullets = sliderPagination.querySelectorAll(".swiper-pagination-bullet");

		bullets.forEach((bullet, index) => {
			const slide = realSlides[index];
			if (!slide) return;

			const titleEl = slide.querySelector(".index-services__slide-title");
			const titleText = titleEl ? titleEl.textContent.trim() : "";

			bullet.innerHTML = `<span>${titleText}</span>`;
		});
	}

	function highlightActiveBullet(swiper) {
		const bullets = sliderPagination.querySelectorAll(".swiper-pagination-bullet");

		bullets.forEach((bullet) => bullet.classList.remove("is-active"));

		const activeBullet = sliderPagination.querySelector(".swiper-pagination-bullet-active");
		if (activeBullet) {
			activeBullet.classList.add("is-active");
		}
	}

	function setupViewportAutoplay(swiper, targetEl) {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						swiper.autoplay.start();
					} else {
						swiper.autoplay.stop();
					}
				});
			},
			{
				root: null,
				threshold: 0.5,
			}
		);

		observer.observe(targetEl);
	}
})();
