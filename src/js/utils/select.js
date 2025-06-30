(function () {
	const selects = document.querySelectorAll(".select");

	selects.forEach((select) => {
		const input = select.querySelector(".select__input");
		const dropdown = select.querySelector(".select__dropdown");
		const items = dropdown.querySelectorAll(".select__item");

		select.addEventListener("click", function (e) {
			select.classList.toggle("open");
		});

		items.forEach((item) => {
			item.addEventListener("click", function (e) {
				e.stopPropagation();
				select.classList.remove("open");
				if (!item.classList.contains("readonly")) {
					input.value = this.textContent;
				}
			});
			item.addEventListener("keydown", function (e) {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					e.stopPropagation();
					select.classList.remove("open");
					if (!item.classList.contains("readonly")) {
						input.value = this.textContent;
					}
				}
			});
		});

		document.addEventListener("click", function (e) {
			if (!select.contains(e.target)) {
				select.classList.remove("open");
			}
		});

		select.addEventListener("keydown", function (e) {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				select.classList.toggle("open");
			}
		});

		document.addEventListener("keydown", function (e) {
			if (e.key === "Escape") {
				select.classList.remove("open");
			}
		});
	});
})();
