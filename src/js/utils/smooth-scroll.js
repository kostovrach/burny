(function () {
	if (window.innerWidth <= 768) return;

	if (typeof Lenis === "undefined") return;

	const lenis = new Lenis({
		duration: 1.6,
		easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
		smooth: true,
		smoothTouch: false,
		// Исключаем все dialog элементы и их содержимое из smooth scroll
		prevent: (node) => {
			// Более строгая проверка - исключаем dialog и элементы с overflow
			return node.closest("dialog") || node.tagName === "DIALOG" || node.style.overflowY === "auto" || getComputedStyle(node).overflowY === "auto";
		},
	});

	window.lenis = lenis;

	function raf(time) {
		lenis.raf(time);
		requestAnimationFrame(raf);
	}

	requestAnimationFrame(raf);

	if (typeof ScrollTrigger !== "undefined") {
		lenis.on("scroll", ScrollTrigger.update);
		ScrollTrigger.scrollerProxy(document.body, {
			scrollTop(value) {
				return arguments.length ? lenis.scrollTo(value) : window.scrollY;
			},
			getBoundingClientRect() {
				return {
					top: 0,
					left: 0,
					width: window.innerWidth,
					height: window.innerHeight,
				};
			},
		});
	}
})();
