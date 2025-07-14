(function () {
	const slider = document.querySelector(".gallery__slider");

	if (!slider) return;

	const paginationWrapper = document.querySelector(".gallery__pagination-wrapper");
	const totalSlides = slider.querySelectorAll(".gallery__slide").length;
	const galleryTitlebox = document.querySelector(".gallery__titlebox");

	function generatePaginationNumbers() {
		if (!paginationWrapper) return;

		paginationWrapper.innerHTML = "";

		for (let i = 1; i <= totalSlides; i++) {
			const slide = document.createElement("div");
			slide.className = "gallery__pagination-item swiper-slide";
			slide.innerHTML = `<span>${i}</span>`;
			paginationWrapper.appendChild(slide);
		}
	}

	function updateGalleryProgress(activeIndex) {
		if (!galleryTitlebox || totalSlides === 0) return;
		
		const progress = ((activeIndex + 1) / totalSlides) * 100;
		const progressPercent = Math.min(progress, 100).toFixed(2) + '%';
		
		galleryTitlebox.style.setProperty('--gallery-progress', progressPercent);
	}

	generatePaginationNumbers();

	let paginationSwiper = null;
	if (document.querySelector(".gallery__pagination")) {
		paginationSwiper = new Swiper(".gallery__pagination", {
			slidesPerView: 5,
			spaceBetween: 24,
			speed: 300,
			freeMode: false,
			centeredSlides: true,
			slideToClickedSlide: true,
		});
	}

	const sliderParams = {
		slidesPerView: "auto",
		spaceBetween: 16,
		centeredSlides: true,
        loop: true,
		speed: 800,
        parallax: true,
        // mousewheel: {
		// 	enabled: true,
		// 	sensitivity: 1
		// },
        keyboard: {
            enabled: true,
            onlyInViewport: true,
        },
		navigation: {
			nextEl: ".gallery__button--next",
			prevEl: ".gallery__button--prev",
		},
		effect: "creative",
		creativeEffect: {
			limitProgress: 2,
			perspective: true,
			prev: {
				translate: ["-105%", 0, -20],
				rotate: [0, 15, 0],
				origin: "right",
			},
			next: {
				translate: ["105%", 0, -20],
				rotate: [0, -15, 0],
				origin: "left",
			},
		},
		on: {
			init: function () {
				updatePaginationActive(this.realIndex);
				centerActivePagination(this.realIndex);
				updateGalleryProgress(this.realIndex);
			},
			slideChange: function () {
				updatePaginationActive(this.realIndex);
				centerActivePagination(this.realIndex);
				updateGalleryProgress(this.realIndex);
			},
		},
	};

	function updatePaginationActive(activeIndex) {
		if (!paginationWrapper) return;

		const paginationSlides = paginationWrapper.querySelectorAll(".gallery__pagination-item");

		paginationSlides.forEach((slide, index) => {
			if (index === activeIndex) {
				slide.classList.add("active");
			} else {
				slide.classList.remove("active");
			}
		});
	}

	function centerActivePagination(activeIndex) {
		if (paginationSwiper) {
			paginationSwiper.slideTo(activeIndex, 300);
		}
	}

	const mainSwiper = new Swiper(slider, sliderParams);

	if (paginationWrapper) {
		paginationWrapper.addEventListener("click", function (e) {
			const numberElement = e.target.closest(".gallery__pagination-item");
			if (numberElement) {
				const slideElement = numberElement.closest(".gallery__pagination-item");
				const slideIndex = Array.from(slideElement.parentNode.children).indexOf(slideElement);
				mainSwiper.slideTo(slideIndex);
			}
		});
	}
})();