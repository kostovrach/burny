(function () {
	const sections = document.querySelectorAll('.map__info-item');
	if (sections.length !== 2) return;

	const [first, second] = sections;

	first.classList.toggle('active');

	[first, second].forEach((section, idx) => {
		const title = section.querySelector('.map__info-item-title');
		if (!title) return;


		title.addEventListener('click', () => {
			if (section.classList.contains('active')) {
				// Клик по активному → переключить на другую
				section.classList.remove('active');
				(sections[idx === 0 ? 1 : 0]).classList.toggle('active');
			}
		});
	});
})();
