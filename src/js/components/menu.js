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
		document.body.classList.remove("lock");
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
		document.body.classList.add("lock");

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
