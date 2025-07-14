(function () {
	const modal = document.getElementById("modal-office-select");
	if (!modal) return;

	const slider = modal.querySelector(".modal-select__slider");
	const btnPrev = modal.querySelector(".modal-select__toolbar-navbutton--prev");
	const btnNext = modal.querySelector(".modal-select__toolbar-navbutton--next");
	const currentFloor = modal.querySelector(".modal-select__toolbar-current-number");
	const closeBtn = modal.querySelector("[data-modal-office-close]");

	if (!slider || !btnPrev || !btnNext || !currentFloor || !closeBtn) return;

	const swiper = new Swiper(slider, {
		direction: "vertical",
		slidesPerView: 1,
        // effect: "fade",
		speed: 500,
		navigation: {
			nextEl: btnNext,
			prevEl: btnPrev,
		},
		keyboard: {
			enabled: true,
			onlyInViewport: true,
		},
		allowTouchMove: false,
		simulateTouch: false,
		on: {
			slideChange: function () {
				updateCurrentFloor();
			}
		}
	});

	let scrollPosition = 0;

	function handleScrollReturn() {
		document.body.classList.remove("select-lock");
		document.body.style.removeProperty("top");
		document.body.style.removeProperty("position");
		window.scrollTo(0, scrollPosition);
	}

	function handleScrollBlock() {
		scrollPosition = window.pageYOffset;
		document.body.style.position = "fixed";
		document.body.style.top = `-${scrollPosition}px`;
		document.body.classList.add("select-lock");
	}

	function updateCurrentFloor() {
		const activeSlide = swiper.slides[swiper.activeIndex];
		const floorNumber = activeSlide?.getAttribute("data-office-floor");
		if (floorNumber && currentFloor) {
			currentFloor.textContent = floorNumber;
		}
	}

	function findSlideIndexByFloor(floorNumber) {
		const slides = swiper.slides;
		for (let i = 0; i < slides.length; i++) {
			if (slides[i].getAttribute("data-office-floor") === floorNumber) {
				return i;
			}
		}
		return 0;
	}

	function openModal(targetFloor = null) {
		modal.classList.add("open");
		modal.setAttribute("aria-hidden", "false");
		document.activeElement?.blur();
		handleScrollBlock();

		if (targetFloor) {
			const slideIndex = findSlideIndexByFloor(targetFloor);
			swiper.slideTo(slideIndex, 0);
		}
		updateCurrentFloor();
	}

	function closeModal() {
		modal.classList.remove("open");
		modal.setAttribute("aria-hidden", "true");
		handleScrollReturn();
	}

	function initEventListeners() {
		const floorMarkers = document.querySelectorAll("[data-office-floor]");
		floorMarkers.forEach(marker => {
			if (!modal.contains(marker)) {
				marker.addEventListener("click", function (e) {
					e.preventDefault();
					const floorNumber = this.getAttribute("data-office-floor");
					openModal(floorNumber);
				});
			}
		});

		closeBtn.addEventListener("click", closeModal);

		document.addEventListener("keydown", function (e) {
			if (e.key === "Escape" && modal.classList.contains("open")) {
				closeModal();
			}
		});

		modal.addEventListener("click", function (e) {
			if (e.target === modal) {
				closeModal();
			}
		});
	}

	function init() {
		setTimeout(() => {
			initEventListeners();
			updateCurrentFloor();
		}, 100);
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();