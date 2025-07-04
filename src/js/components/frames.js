(function () {
	class FrameAnimation {
		constructor(options = {}) {
			this.config = {
				canvasId: "building-frames",
				frameCount: 29,
				framePath: "../assets/img/service/frames/",
				frameFormat: "jpg",
				dragSensitivity: 0.3,
				scrollTriggerConfig: {
					start: "35% bottom",
					end: "bottom bottom",
					scrub: true,
					markers: false,
				},
				preloadStrategy: "progressive", // 'all' | 'progressive' | 'lazy'
				qualityMode: "higt", // 'auto' | 'high' | 'low'
				...options,
			};

			this.canvas = null;
			this.ctx = null;
			this.dpr = window.devicePixelRatio || 1;
			this.images = new Map();
			this.currentFrame = 0;
			this.isDragging = false;
			this.startY = 0;
			this.frameFromDrag = 0;
			this.isInitialized = false;
			this.loadingPromises = new Map();

			this.renderThrottled = this.throttle(this.render.bind(this), 16); // ~60fps
			this.resizeThrottled = this.throttle(this.handleResize.bind(this), 100);

			this.intersectionObserver = null;

			this.init();
		}

		init() {
			this.canvas = document.getElementById(this.config.canvasId);
			if (!this.canvas) return;

			this.ctx = this.canvas.getContext("2d");
			this.setupCanvas();
			this.setupEventListeners();
			this.setupIntersectionObserver();
			this.preloadImages();
		}

		setupCanvas() {
			this.setCanvasSize();
			this.ctx.imageSmoothingEnabled = this.config.qualityMode !== "low";
			this.ctx.imageSmoothingQuality = this.config.qualityMode === "high" ? "high" : "medium";
		}

		setCanvasSize() {
			const rect = this.canvas.getBoundingClientRect();
			const width = rect.width;
			const height = rect.height;

			const adaptiveDpr = this.config.qualityMode === "auto" ? Math.min(this.dpr, width > 1200 ? 1.5 : 2) : this.dpr;

			this.canvas.width = width * adaptiveDpr;
			this.canvas.height = height * adaptiveDpr;
			this.canvas.style.width = `${width}px`;
			this.canvas.style.height = `${height}px`;

			this.ctx.scale(adaptiveDpr, adaptiveDpr);
		}

		setupEventListeners() {
			window.addEventListener("resize", this.resizeThrottled);

			this.canvas.addEventListener("pointerdown", this.handlePointerDown.bind(this), { passive: false });
			this.canvas.addEventListener("pointermove", this.handlePointerMove.bind(this), { passive: false });
			this.canvas.addEventListener("pointerup", this.handlePointerEnd.bind(this));
			this.canvas.addEventListener("pointerleave", this.handlePointerEnd.bind(this));
			this.canvas.addEventListener("pointercancel", this.handlePointerEnd.bind(this));

			this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
		}

		setupIntersectionObserver() {
			if (!("IntersectionObserver" in window)) return;

			this.intersectionObserver = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting && !this.isInitialized) {
							this.setupScrollTrigger();
							this.isInitialized = true;
						}
					});
				},
				{ rootMargin: "50px" }
			);

			this.intersectionObserver.observe(this.canvas);
		}

		async preloadImages() {
			switch (this.config.preloadStrategy) {
				case "all":
					await this.preloadAllImages();
					break;
				case "progressive":
					await this.preloadProgressive();
					break;
				case "lazy":
					await this.loadImage(0);
					break;
			}

			this.render(0);
		}

		async preloadAllImages() {
			const tasks = [];
			for (let i = 0; i < this.config.frameCount; i++) {
				tasks.push(this.loadImage(i));
			}
			await Promise.all(tasks);
		}

		async preloadProgressive() {
			const keyFrames = [0, Math.floor(this.config.frameCount / 2), this.config.frameCount - 1];
			await Promise.all(keyFrames.map((i) => this.loadImage(i)));

			this.loadRemainingFrames(keyFrames);
		}

		async loadRemainingFrames(excludeFrames) {
			const remaining = [];
			for (let i = 0; i < this.config.frameCount; i++) {
				if (!excludeFrames.includes(i)) {
					remaining.push(i);
				}
			}

			const batchSize = 5;
			for (let i = 0; i < remaining.length; i += batchSize) {
				const batch = remaining.slice(i, i + batchSize);
				await Promise.all(batch.map((index) => this.loadImage(index)));

				await new Promise((resolve) => setTimeout(resolve, 100));
			}
		}

		loadImage(index) {
			if (this.loadingPromises.has(index)) {
				return this.loadingPromises.get(index);
			}

			const promise = new Promise((resolve, reject) => {
				if (this.images.has(index)) {
					resolve(this.images.get(index));
					return;
				}

				const img = new Image();
				img.crossOrigin = "anonymous";
				img.src = `${this.config.framePath}${String(index)}.${this.config.frameFormat}`;

				img.onload = () => {
					this.images.set(index, img);
					resolve(img);
				};

				img.onerror = () => {
					console.error(`Ошибка загрузки кадра ${index}`);
					reject(new Error(`Failed to load frame ${index}`));
				};
			});

			this.loadingPromises.set(index, promise);
			return promise;
		}

		async render(index) {
			if (index < 0 || index >= this.config.frameCount) return;

			let img = this.images.get(index);

			if (!img) {
				try {
					img = await this.loadImage(index);
				} catch (error) {
					return;
				}
			}

			const width = this.canvas.clientWidth;
			const height = this.canvas.clientHeight;

			this.ctx.clearRect(0, 0, width, height);

			this.drawImageFit(img, width, height);
		}

		drawImageFit(img, canvasWidth, canvasHeight) {
			const imgRatio = img.width / img.height;
			const canvasRatio = canvasWidth / canvasHeight;

			let drawWidth,
				drawHeight,
				offsetX = 0,
				offsetY = 0;

			if (imgRatio > canvasRatio) {
				drawHeight = canvasHeight;
				drawWidth = drawHeight * imgRatio;
				offsetX = (canvasWidth - drawWidth) / 2;
			} else {
				drawWidth = canvasWidth;
				drawHeight = drawWidth / imgRatio;
				offsetY = (canvasHeight - drawHeight) / 2;
			}

			this.ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
		}

		setupScrollTrigger() {
			if (typeof gsap === "undefined" || !gsap.registerPlugin) return;

			const scrollObj = { frame: 0 };

			gsap.to(scrollObj, {
				frame: this.config.frameCount - 1,
				ease: "none",
				scrollTrigger: {
					trigger: this.canvas.parentElement,
					...this.config.scrollTriggerConfig,
					onUpdate: () => {
						const index = Math.round(scrollObj.frame);
						if (index !== this.currentFrame) {
							this.currentFrame = index;
							this.renderThrottled(this.currentFrame);
						}
					},
				},
			});
		}

		handlePointerDown(e) {
			e.preventDefault();
			this.isDragging = true;
			this.startY = e.clientY;
			this.frameFromDrag = this.currentFrame;
			this.canvas.setPointerCapture(e.pointerId);
		}

		handlePointerMove(e) {
			if (!this.isDragging) return;
			e.preventDefault();

			const deltaY = e.clientY - this.startY;
			let nextFrame = this.frameFromDrag + Math.floor(-deltaY * this.config.dragSensitivity);
			nextFrame = Math.max(0, Math.min(this.config.frameCount - 1, nextFrame));

			if (nextFrame !== this.currentFrame) {
				this.currentFrame = nextFrame;
				this.renderThrottled(this.currentFrame);
			}
		}

		handlePointerEnd(e) {
			if (!this.isDragging) return;
			this.isDragging = false;
			if (e.pointerId !== undefined) {
				this.canvas.releasePointerCapture(e.pointerId);
			}
		}

		handleResize() {
			this.setCanvasSize();
			this.render(this.currentFrame);
		}

		throttle(func, limit) {
			let inThrottle;
			return function (...args) {
				if (!inThrottle) {
					func.apply(this, args);
					inThrottle = true;
					setTimeout(() => (inThrottle = false), limit);
				}
			};
		}

		goToFrame(index) {
			if (index >= 0 && index < this.config.frameCount) {
				this.currentFrame = index;
				this.render(this.currentFrame);
			}
		}

		getCurrentFrame() {
			return this.currentFrame;
		}

		destroy() {
			if (this.intersectionObserver) {
				this.intersectionObserver.disconnect();
			}

			window.removeEventListener("resize", this.resizeThrottled);

			this.canvas.removeEventListener("pointerdown", this.handlePointerDown);
			this.canvas.removeEventListener("pointermove", this.handlePointerMove);
			this.canvas.removeEventListener("pointerup", this.handlePointerEnd);
			this.canvas.removeEventListener("pointerleave", this.handlePointerEnd);
			this.canvas.removeEventListener("pointercancel", this.handlePointerEnd);

			this.images.clear();
			this.loadingPromises.clear();
		}
	}

	new FrameAnimation();
})();
