(function () {
	const slider = document.querySelector(".gallery-slider");

	if (!slider) return;

	const sliderParams = {
		slidesPerView: "auto",
		spaceBetween: 16,
		centeredSlides: true,
		speed: 800,
		navigation: {
			nextEl: ".gallery-slider__button--next",
			prevEl: ".gallery-slider__button--prev",
		},
		pagination: {
			el: ".gallery-slider__pagination-container",
			clickable: true,
			type: "custom",
			renderCustom: function (slider, current, total) {
				return Array.from({ length: total }, (_, i) => {
					const num = i + 1;
					return num === current ? `<span class="gallery-slider__pagination-item active">${num}</span>` : `<span class="gallery-slider__pagination-item">${num}</span>`;
				}).join("");
			},
		},
		on: {
			init: function () {
                centerActiveBullet(this);
            },
			slideChange: function () {
                centerActiveBullet(this);
            },
		},
	};

	function centerActiveBullet(swiper) {
		const bullets = document.querySelectorAll(".gallery-slider__pagination-item");
		bullets.forEach((bullet, i) => {
			bullet.classList.remove("active");
			bullet.removeAttribute("data-index-offset");

			if (i === swiper.realIndex) {
				bullet.classList.add("active");
			} else {
				const offset = i - swiper.realIndex;
				if (Math.abs(offset) <= 2) {
					bullet.setAttribute("data-index-offset", offset);
				}
			}
		});
	}

	new Swiper(slider, sliderParams);
})();
