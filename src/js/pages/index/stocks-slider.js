(function () {
	const slider = document.querySelector(".index-stocks__slider");

	if (!slider) return;

	const paginationWrapper = document.querySelector(".index-stocks__pagination-wrapper");
	const totalSlides = slider.querySelectorAll(".index-stocks__slide").length;

	function generatePaginationNumbers() {
		if (!paginationWrapper) return;

		paginationWrapper.innerHTML = "";

		for (let i = 1; i <= totalSlides; i++) {
			const slide = document.createElement("li");
			slide.className = "index-stocks__pagination-item swiper-slide";
			slide.innerHTML = `<span>${i}</span>`;
			paginationWrapper.appendChild(slide);
		}
	}

	generatePaginationNumbers();

	let paginationSwiper = null;
	if (document.querySelector(".index-stocks__pagination")) {
		paginationSwiper = new Swiper(".index-stocks__pagination", {
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
		initialSlide: 1,
		centeredSlides: true,
		speed: 800,
        freeMode: true,
		navigation: {
			nextEl: ".index-stocks__button--next",
			prevEl: ".index-stocks__button--prev",
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

		const paginationSlides = paginationWrapper.querySelectorAll(".index-stocks__pagination-item");

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
			const numberElement = e.target.closest(".index-stocks__pagination-item");
			if (numberElement) {
				const slideElement = numberElement.closest(".index-stocks__pagination-item");
				const slideIndex = Array.from(slideElement.parentNode.children).indexOf(slideElement);
				mainSwiper.slideTo(slideIndex);
			}
		});
	}
})();
