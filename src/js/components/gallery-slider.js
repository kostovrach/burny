(function () {
	const slider = document.querySelector(".gallery-slider");

	if (!slider) return;

	// Получаем контейнер для пагинации
	const paginationWrapper = document.querySelector(".gallery-slider__pagination-wrapper");

	// Подсчитываем количество слайдов
	const totalSlides = slider.querySelectorAll(".gallery-slider__slide").length;

	// Генерируем номера для пагинации
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

	// Генерируем номера
	generatePaginationNumbers();

	// Инициализируем слайдер пагинации
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

	// Параметры основного слайдера
	const sliderParams = {
		slidesPerView: "auto",
		spaceBetween: 16,
		centeredSlides: true,
		speed: 800,
		navigation: {
			nextEl: ".gallery-slider__button--next",
			prevEl: ".gallery-slider__button--prev",
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

	// Функция обновления активного состояния пагинации
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

	// Функция центрирования активного элемента пагинации
	function centerActivePagination(activeIndex) {
		if (paginationSwiper) {
			paginationSwiper.slideTo(activeIndex, 300);
		}
	}

	// Инициализируем основной слайдер
	const mainSwiper = new Swiper(slider, sliderParams);

	// Обработка кликов по номерам пагинации
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

	class LensDistortionSlider {
		constructor() {
			this.currentSlide = 0;
			this.totalSlides = 5;

			this.leftCanvas = document.querySelector(".gallery-slider__distortion-mask--left");
			this.rightCanvas = document.querySelector(".gallery-slider__distortion-mask--right");
			this.leftCtx = this.leftCanvas.getContext("2d");
			this.rightCtx = this.rightCanvas.getContext("2d");

			this.distortionStrength = 1.6;
			this.effectType = "lens";
			this.fps = 60;
			this.animationId = null;

			this.init();
			this.setupCanvases();
			this.startDistortion();
		}

		init() {
			// Обработчик изменения размера окна
			window.addEventListener("resize", () => this.setupCanvases());
		}

		setupCanvases() {
			const rect = document.body.getBoundingClientRect();
			const width = window.innerWidth <= 1024 && window.innerWidth > 768 ? 100 : 140;
			const height = window.innerHeight;

			[this.leftCanvas, this.rightCanvas].forEach((canvas) => {
				canvas.width = width;
				canvas.height = height;
				canvas.style.width = width + "px";
				canvas.style.height = height + "px";
			});
		}

		captureBackground() {
			const tempCanvas = document.createElement("canvas");
			const tempCtx = tempCanvas.getContext("2d");

			tempCanvas.width = window.innerWidth;
			tempCanvas.height = window.innerHeight;

			// Захват всего viewport
			return html2canvas(document.body, {
				canvas: tempCanvas,
				width: window.innerWidth,
				height: window.innerHeight,
				useCORS: true,
				allowTaint: true,
				scale: 1,
			});
		}

		applyLensDistortion(ctx, sourceCanvas, isLeft) {
			const canvas = ctx.canvas;
			const width = canvas.width;
			const height = canvas.height;

			const imageData = ctx.createImageData(width, height);
			const data = imageData.data;

			// Создаем временный canvas для источника
			const tempCanvas = document.createElement("canvas");
			const tempCtx = tempCanvas.getContext("2d");
			tempCanvas.width = window.innerWidth;
			tempCanvas.height = window.innerHeight;

			// Рисуем текущее состояние страницы
			tempCtx.drawImage(sourceCanvas, 0, 0);
			const sourceData = tempCtx.getImageData(0, 0, window.innerWidth, window.innerHeight);

			for (let y = 0; y < height; y++) {
				for (let x = 0; x < width; x++) {
					let sourceX, sourceY;

					if (isLeft) {
						// Левая маска: искажение увеличивается к левому краю
						const normalizedX = x / width; // 0 (левый край) -> 1 (правый край)
						const distortionFactor = (1 - normalizedX) * (this.distortionStrength - 1);

						sourceX = x;
						sourceY = y + (y - height / 2) * distortionFactor;
					} else {
						// Правая маска: искажение увеличивается к правому краю
						const normalizedX = x / width; // 0 (левый край) -> 1 (правый край)
						const distortionFactor = normalizedX * (this.distortionStrength - 1);

						sourceX = window.innerWidth - width + x;
						sourceY = y + (y - height / 2) * distortionFactor;
					}

					// Волновой эффект
					if (this.effectType === "wave") {
						const waveY = Math.sin(sourceX * 0.01 + Date.now() * 0.005) * 10;
						sourceY += waveY;
					}

					// Проверяем границы
					sourceX = Math.max(0, Math.min(window.innerWidth - 1, Math.floor(sourceX)));
					sourceY = Math.max(0, Math.min(window.innerHeight - 1, Math.floor(sourceY)));

					const sourceIndex = (sourceY * window.innerWidth + sourceX) * 4;
					const targetIndex = (y * width + x) * 4;

					if (sourceIndex >= 0 && sourceIndex < sourceData.data.length - 4) {
						data[targetIndex] = sourceData.data[sourceIndex]; // R
						data[targetIndex + 1] = sourceData.data[sourceIndex + 1]; // G
						data[targetIndex + 2] = sourceData.data[sourceIndex + 2]; // B
						data[targetIndex + 3] = sourceData.data[sourceIndex + 3]; // A
					}
				}
			}

			ctx.putImageData(imageData, 0, 0);
		}

		renderDistortion() {
			if (this.effectType === "none") return;

			// Создаем снимок текущего состояния страницы
			const tempCanvas = document.createElement("canvas");
			const tempCtx = tempCanvas.getContext("2d");
			tempCanvas.width = window.innerWidth;
			tempCanvas.height = window.innerHeight;

			// Рисуем градиент как базу (упрощенная версия для демонстрации)
			// const currentSlideEl = document.querySelectorAll(".slide")[this.currentSlide];
			// const computedStyle = window.getComputedStyle(currentSlideEl);
			// const bgImage = computedStyle.backgroundImage;

			if (bgImage && bgImage !== "none") {
				tempCtx.fillStyle = bgImage;
				tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
			}

			// Применяем искажение
			this.applyLensDistortion(this.leftCtx, tempCanvas, true);
			this.applyLensDistortion(this.rightCtx, tempCanvas, false);
		}

		startDistortion() {
			if (this.animationId) return;

			const animate = () => {
				this.renderDistortion();

				setTimeout(() => {
					this.animationId = requestAnimationFrame(animate);
				}, 1000 / this.fps);
			};

			animate();
		}

		stopDistortion() {
			if (this.animationId) {
				cancelAnimationFrame(this.animationId);
				this.animationId = null;
			}

			// Очищаем canvas
			this.leftCtx.clearRect(0, 0, this.leftCanvas.width, this.leftCanvas.height);
			this.rightCtx.clearRect(0, 0, this.rightCanvas.width, this.rightCanvas.height);
		}

		addSwipeListeners() {
			let startX = 0;
			let startY = 0;

			const sliderContainer = document.querySelector(".gallery-slider__wrapper");

			sliderContainer.addEventListener("touchstart", (e) => {
				startX = e.touches[0].clientX;
				startY = e.touches[0].clientY;
			});

			sliderContainer.addEventListener("touchend", (e) => {
				const endX = e.changedTouches[0].clientX;
				const endY = e.changedTouches[0].clientY;

				const deltaX = startX - endX;
				const deltaY = startY - endY;

				if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
					if (deltaX > 0) {
						this.nextSlide();
					} else {
						this.prevSlide();
					}
				}
			});
		}
	}

	// Проверяем поддержку Canvas
	if (window.innerWidth > 768) {
		document.addEventListener("DOMContentLoaded", () => {
			new LensDistortionSlider();
		});
	} 
})();
