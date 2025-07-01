(function () {
	const labelContainer = document.querySelector('.sider__label-container');
	if (!labelContainer) return;

	window.addEventListener('scroll', () => {
		const scrollTop = window.scrollY || window.pageYOffset;
		const docHeight = document.documentElement.scrollHeight - window.innerHeight;
		const progress = Math.min(scrollTop / docHeight, 1); // 0..1
		const fill = (progress * 100).toFixed(2) + '%';

		labelContainer.style.setProperty('--fill-height', fill);
	});
})();
