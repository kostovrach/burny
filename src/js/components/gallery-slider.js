(function () {
	const slider = document.querySelector(".gallery-slider");

	if (!slider) return;

	const paginationWrapper = document.querySelector(".gallery-slider__pagination-wrapper");
	const totalSlides = slider.querySelectorAll(".gallery-slider__slide").length;

	function generatePaginationNumbers() {
		if (!paginationWrapper) return;

		paginationWrapper.innerHTML = "";

		for (let i = 1; i <= totalSlides; i++) {
			const slide = document.createElement("li");
			slide.className = "index-gallery__pagination-item gallery-slider__pagination-item swiper-slide";
			slide.innerHTML = `<span>${i}</span>`;
			paginationWrapper.appendChild(slide);
		}
	}

	generatePaginationNumbers();

	let paginationSwiper = null;
	if (document.querySelector(".gallery-slider__pagination")) {
		paginationSwiper = new Swiper(".gallery-slider__pagination", {
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
		speed: 800,
		grabCursor: true,
		navigation: {
			nextEl: ".gallery-slider__button--next",
			prevEl: ".gallery-slider__button--prev",
		},
		mousewheel: {
			forceToAxis: true,
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
			},
			slideChange: function () {
				updatePaginationActive(this.realIndex);
				centerActivePagination(this.realIndex);
			},
		},
	};

	function updatePaginationActive(activeIndex) {
		if (!paginationWrapper) return;

		const paginationSlides = paginationWrapper.querySelectorAll(".gallery-slider__pagination-item");

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
			const numberElement = e.target.closest(".gallery-slider__pagination-item");
			if (numberElement) {
				const slideElement = numberElement.closest(".gallery-slider__pagination-item");
				const slideIndex = Array.from(slideElement.parentNode.children).indexOf(slideElement);
				mainSwiper.slideTo(slideIndex);
			}
		});
	}
})();
