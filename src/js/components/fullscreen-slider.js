(function () {
	const sliderEl = document.querySelector(".fullscreen-slider");
	if (!sliderEl) return;

	const sliderPagination = document.querySelector(".fullscreen-slider__pagination");
	if (!sliderPagination) return;

	let isPageScrollBlocked = false;

	const swiper = new Swiper(sliderEl, {
        direction: "vertical",
        mousewheel: {
			enabled: true,
			forceToAxis: true,
			sensitivity: 1
		},
		speed: 800,
		parallax: true,
		effect: "creative",
		creativeEffect: {
			next: {
				translate: [0, "150%", 0],
				opacity: 0.1,
			},
			prev: {
				translate: [0, "-100%", 0],
				opacity: 0.1,
			},
		},
		pagination: {
			el: sliderPagination,
			clickable: true,
		},
		on: {
			init(swiper) {
				addTitlesToBullets(swiper);
				highlightActiveBullet(swiper);
				blockPageScroll();
				// animateSlideTitle(swiper.slides[swiper.activeIndex]);
			},
			slideChange(swiper) {
				highlightActiveBullet(swiper);
				
				if (!swiper.isEnd) {
					blockPageScroll();
				}
				else {
					unblockPageScroll();
				}
				
				animateSlideTitle(swiper.slides[swiper.activeIndex]);
			}
		},
	});

	sliderEl.addEventListener('wheel', function(e) {
		if (swiper.isEnd && e.deltaY > 0) {
			unblockPageScroll();
			return;
		}
		
		if (!swiper.isEnd) {
			blockPageScroll();
		}
		
	}, { passive: true });

	function blockPageScroll() {
		if (isPageScrollBlocked) return;
		
		isPageScrollBlocked = true;
		
		document.body.style.overflow = 'hidden';
	}

	function unblockPageScroll() {
		if (!isPageScrollBlocked) return;
		
		isPageScrollBlocked = false;
		
		document.body.style.overflow = '';
	}

	let scrollTimeout;
	window.addEventListener('scroll', function() {
		clearTimeout(scrollTimeout);
		
		scrollTimeout = setTimeout(function() {
			const sliderRect = sliderEl.getBoundingClientRect();
			const sliderInView = sliderRect.top < window.innerHeight && sliderRect.bottom > 0;
			
			if (sliderInView && !swiper.isEnd && !isPageScrollBlocked) {
				blockPageScroll();
			}
		}, 100);
	});

	function animateSlideTitle(slide) {
		const titleEl = slide.querySelector('.text-anim');
		if (!titleEl) return;
		
		const originalText = titleEl.textContent.trim();
		if (!originalText) return;
		
		const duration = 1200; // <----- 
		const letters = originalText.split('');
		const totalLetters = letters.length;
		
		const sourceChars = [...new Set(originalText.split(''))];
		
		function getRandomChar() {
			return sourceChars[Math.floor(Math.random() * sourceChars.length)];
		}
		
		const letterStates = letters.map(() => ({
			isResolved: false,
			currentChar: getRandomChar()
		}));
		
		let startTime = Date.now();
		
		function animate() {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);
			
			letterStates.forEach((state, index) => {
				if (!state.isResolved) {
					const letterDelay = (index / totalLetters) * 0.2; // <----- 
					const letterProgress = Math.max(0, (progress - letterDelay) / 0.4); // <----- 
					
					if (letterProgress >= 1) {
						state.isResolved = true;
						state.currentChar = letters[index];
					} else if (letterProgress > 0) {
						state.currentChar = getRandomChar();
					}
				}
			});
			
			const newText = letterStates.map(state => state.currentChar).join('');
			titleEl.textContent = newText;
			
			if (progress < 1) {
				requestAnimationFrame(animate);
			}
		}
		
		requestAnimationFrame(animate);
	}

	function addTitlesToBullets(swiper) {
		const realSlides = Array.from(swiper.slides).filter((slide) =>
			!slide.classList.contains("swiper-slide-duplicate")
		);

		const bullets = sliderPagination.querySelectorAll(".swiper-pagination-bullet");

		bullets.forEach((bullet, index) => {
			const slide = realSlides[index];
			if (!slide) return;

			const titleEl = slide.querySelector(".fullscreen-slider__slide-title");
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
})();