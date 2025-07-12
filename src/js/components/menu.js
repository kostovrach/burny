(function () {
	let scrollPosition = 0;
	let wheelHandler = null;
	let menuLenis = null;
	let menuRafId = null;
	let mainLenis = null;

	function setMainLenis() {
		if (window.lenis) {
			mainLenis = window.lenis;
		}
	}

	function handleScrollReturn() {
		document.body.classList.remove("menu-lock");
		document.body.style.removeProperty("top");
		document.body.style.removeProperty("position");
		window.scrollTo(0, scrollPosition);

		if (wheelHandler) {
			document.removeEventListener("wheel", wheelHandler, { passive: false });
			wheelHandler = null;
		}

		if (menuLenis) {
			menuLenis.destroy();
			menuLenis = null;
		}

		if (menuRafId) {
			cancelAnimationFrame(menuRafId);
			menuRafId = null;
		}

		if (mainLenis) {
			mainLenis.start();
		}
	}

	function handleScrollBlock() {
		scrollPosition = window.pageYOffset;
		document.body.style.position = "fixed";
		document.body.style.top = `-${scrollPosition}px`;
		document.body.classList.add("menu-lock");

		if (mainLenis) {
			mainLenis.stop();
		}

		const menuContainer = document.querySelector(".menu__container");
		if (menuContainer && typeof Lenis !== "undefined") {
			menuLenis = new Lenis({
				wrapper: menuContainer,
				content: menuContainer.querySelector(".menu__body") || menuContainer.firstElementChild,
				duration: 1.6,
				easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
				smooth: true,
				smoothTouch: false,
				direction: "vertical",
				gestureDirection: "vertical",
			});

			function menuRaf(time) {
				menuLenis.raf(time);
				menuRafId = requestAnimationFrame(menuRaf);
			}
			menuRafId = requestAnimationFrame(menuRaf);

			wheelHandler = function (e) {
				const menuElement = document.querySelector("#menu");
				if (menuElement && menuElement.contains(e.target)) e.preventDefault();
			};

			document.addEventListener("wheel", wheelHandler, { passive: false });
		}
	}

	function initModal(modalId, dataAttr) {
		const modal = document.querySelector(modalId);
		const burger = document.querySelector(`[${dataAttr}]`);

		if (!modal || !burger) return;

		setMainLenis();

		burger.addEventListener("click", function () {
			const isOpen = modal.classList.toggle("open");
			burger.classList.toggle("active");
			document.activeElement?.blur();
			modal.setAttribute("aria-hidden", !isOpen);

			if (isOpen) {
				handleScrollBlock();
			} else {
				handleScrollReturn();
			}
		});

		document.addEventListener("keydown", function (e) {
			if (e.key === "Escape" && modal.classList.contains("open")) {
				modal.classList.remove("open");
				burger.classList.remove("active");
				modal.setAttribute("aria-hidden", "true");
				handleScrollReturn();
			}
		});
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", function () {
			setTimeout(function () {
				initModal("#menu", "data-menu-open");
			}, 100);
		});
	} else {
		setTimeout(function () {
			initModal("#menu", "data-menu-open");
		}, 100);
	}
})();

(function () {
	class CursorFollower {
		constructor() {
			this.elements = document.querySelectorAll(".soon");
			this.activeMarkers = new Map();
			this.animationFrames = new Map();
			this.init();
		}

		init() {
			if (this.elements.length === 0 || window.innerWidth <= 768) return;

			this.elements.forEach((element) => {
				element.addEventListener("mouseenter", this.handleMouseEnter.bind(this));
				element.addEventListener("mouseleave", this.handleMouseLeave.bind(this));
			});
		}

		handleMouseEnter(e) {
			const element = e.currentTarget;
			const marker = this.createMarker();

			element.appendChild(marker);
			this.activeMarkers.set(element, marker);

			const rect = element.getBoundingClientRect();
			const x = (e.clientX - rect.left);
			const y = (e.clientY - rect.top);
			this.updateMarkerPosition(marker, x, y, element);

			const mouseMoveHandler = (e) => this.handleMouseMove(e, element, marker);
			element.addEventListener("mousemove", mouseMoveHandler);

			marker._mouseMoveHandler = mouseMoveHandler;
		}

		handleMouseLeave(e) {
			const element = e.currentTarget;
			const marker = this.activeMarkers.get(element);

			if (marker) {
				element.removeEventListener("mousemove", marker._mouseMoveHandler);

				const animationId = this.animationFrames.get(element);
				if (animationId) {
					cancelAnimationFrame(animationId);
					this.animationFrames.delete(element);
				}

				marker.remove();
				this.activeMarkers.delete(element);
			}
		}

		handleMouseMove(e, element, marker) {
			const prevAnimationId = this.animationFrames.get(element);
			if (prevAnimationId) {
				cancelAnimationFrame(prevAnimationId);
			}

			const animationId = requestAnimationFrame(() => {
				const rect = element.getBoundingClientRect();
				const x = e.clientX - rect.left;
				const y = e.clientY - rect.top;
				this.updateMarkerPosition(marker, x, y, element);
				this.animationFrames.delete(element);
			});

			this.animationFrames.set(element, animationId);
		}

		createMarker() {
			const marker = document.createElement("div");
			marker.className = "soon__marker";
			marker.textContent = "Открытие в\u00A02025";
			return marker;
		}

		updateMarkerPosition(marker, x, y, element) {
			marker.style.left = `${x}px`;
			marker.style.top = `${y}px`;
		}
	}

	document.addEventListener("DOMContentLoaded", () => {
		new CursorFollower();
	});
})();
