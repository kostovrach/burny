(function () {
	const burger = document.querySelector(".burger");

	if (!burger) return;

    burger.addEventListener('click', () => {
        burger.classList.toggle('active')
    })
})();