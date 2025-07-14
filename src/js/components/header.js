(function () {
	const header = document.querySelector(".header");

	if (!header) return;

    const dropdown = header.querySelector(".header__links")
    const dropdownTitle = header.querySelector(".header__links-title")
    const dropdownList = header.querySelector(".header__links-title")

    dropdownTitle.addEventListener("click", () => {
        dropdown.classList.toggle("active");
    })

    window.addEventListener("scroll", () => {
        if (window.scrollY > 10 && dropdown.classList.contains("active")) {
            dropdown.classList.remove("active");
        }
    })
})();
