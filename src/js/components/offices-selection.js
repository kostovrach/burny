(function () {
	class OfficeSelector {
		constructor() {
			this.offices = [];
			this.filteredOffices = [];
			this.currentSort = "default";
			this.debounceTimer = null;
			this.domCache = {};

			this.filters = {
				floor: { min: 1, max: 20 },
				area: { min: 50, max: 200 },
				capacity: { min: 2, max: 50 },
			};

			this.defaultFilters = { ...this.filters };

			this.sortOptions = {
				default: "По умолчанию",
				"price-asc": "По возрастанию цены",
				"price-desc": "По убыванию цены",
			};

			this.init();
		}

		getElement(selector) {
			if (!this.domCache[selector]) {
				this.domCache[selector] = document.querySelector(selector);
			}
			return this.domCache[selector];
		}

		getElements(selector) {
			if (!this.domCache[selector]) {
				this.domCache[selector] = document.querySelectorAll(selector);
			}
			return this.domCache[selector];
		}

		async init() {
			try {
				await this.loadOfficesData();
				this.validateData();
				this.calculateDefaultRanges();
				this.initializeFilters();
				this.bindEvents();
				this.applyFilters();
			} catch (error) {
				console.error("Ошибка при инициализации:", error);
				this.showError("Ошибка загрузки данных");
			}
		}

		async loadOfficesData() {
			try {
				const response = await fetch("./data/offices/offices-list.json");
				if (!response.ok) {
					throw new Error(`HTTP error. status: ${response.status}`);
				}
				this.offices = await response.json();
				this.filteredOffices = [...this.offices];
			} catch (error) {
				console.warn("Не удалось загрузить данные из JSON, используются тестовые данные:", error);
				this.offices = [{ id: 1, floor: 1, area: 1, capacity: 1, price: 1 }];
				this.filteredOffices = [...this.offices];
			}
		}

		validateData() {
			this.offices = this.offices.filter((office) => {
				return typeof office.id === "number" && typeof office.floor === "number" && typeof office.area === "number" && typeof office.capacity === "number" && typeof office.price === "number";
			});

			if (this.offices.length === 0) {
				throw new Error("Нет корректных данных для отображения");
			}
		}

		showError(message) {
			const resultsContainer = this.getElement("[data-results]");
			if (resultsContainer) {
				resultsContainer.innerHTML = `<div class="selection__no-results">${message}</div>`;
			}
		}

		calculateDefaultRanges() {
			if (this.offices.length === 0) return;

			const ranges = {
				floor: this.offices.map((office) => office.floor),
				area: this.offices.map((office) => office.area),
				capacity: this.offices.map((office) => office.capacity),
			};

			Object.keys(ranges).forEach((key) => {
				const values = ranges[key];
				this.filters[key].min = Math.min(...values);
				this.filters[key].max = Math.max(...values);
			});

			this.defaultFilters = JSON.parse(JSON.stringify(this.filters));
		}

		initializeFilters() {
			["floor", "area", "capacity"].forEach((range) => {
				const minInput = this.getElement(`.selection__range-input[data-range="${range}"][data-type="min"]`);
				const maxInput = this.getElement(`.selection__range-input[data-range="${range}"][data-type="max"]`);

				const { min, max } = this.filters[range];

				if (minInput) {
					minInput.min = this.defaultFilters[range].min;
					minInput.max = this.defaultFilters[range].max;
					minInput.value = min;
				}
				if (maxInput) {
					maxInput.min = this.defaultFilters[range].min;
					maxInput.max = this.defaultFilters[range].max;
					maxInput.value = max;
				}

				this.updateRangeDisplay(range);
			});
		}

		bindEvents() {
			const resetBtn = this.getElement(".selection__reset-btn");
			resetBtn?.addEventListener("click", this.resetFilters.bind(this));

			this.bindSortEvents();

			const rangeInputs = this.getElements(".selection__range-input");
			rangeInputs.forEach((input) => {
				input.addEventListener("input", () => {
					const range = input.dataset.range;
					const type = input.dataset.type;
					const isArea = range === "area";

					const parsedValue = parseFloat(input.value);
					const value = isArea ? parsedValue : Math.ceil(parsedValue);
					this.filters[range][type] = value;

					const otherType = type === "min" ? "max" : "min";
					const otherInput = this.getElement(`.selection__range-input[data-range="${range}"][data-type="${otherType}"]`);
					const otherParsedValue = parseFloat(otherInput.value);
					const otherValue = isArea ? otherParsedValue : Math.ceil(otherParsedValue);

					if (type === "min" && this.filters[range].min > otherValue) {
						this.filters[range].min = otherValue;
						input.value = otherValue;
					}
					if (type === "max" && this.filters[range].max < otherValue) {
						this.filters[range].max = otherValue;
						input.value = otherValue;
					}

					this.updateRangeDisplay(range);
					this.debounceFilter();
				});
			});
		}

		bindSortEvents() {
			const sortContainer = this.getElement("[data-sort]");
			const sortCurrent = this.getElement(".selection__sort-current");
			const sortItems = this.getElements(".selection__sort-item");

			if (!sortContainer || !sortCurrent) return;

			sortCurrent.addEventListener("click", (e) => {
				e.stopPropagation();
				this.toggleSortDropdown();
			});

			sortItems.forEach((item) => {
				item.addEventListener("click", (e) => {
					e.stopPropagation();
					const value = item.getAttribute("value");
					this.handleSortChange(value);
					this.closeSortDropdown();
				});
			});

			document.addEventListener("click", (e) => {
				if (!sortContainer.contains(e.target)) {
					this.closeSortDropdown();
				}
			});
		}

		toggleSortDropdown() {
			const sortContainer = this.getElement("[data-sort]");
			sortContainer?.classList.toggle("active");
		}

		closeSortDropdown() {
			const sortContainer = this.getElement("[data-sort]");
			sortContainer?.classList.remove("active");
		}

		updateRangeDisplay(range) {
			const min = this.filters[range].min;
			const max = this.filters[range].max;
			const defaultMin = this.defaultFilters[range].min;
			const defaultMax = this.defaultFilters[range].max;

			const minPercentage = ((min - defaultMin) / (defaultMax - defaultMin)) * 100;
			const maxPercentage = ((max - defaultMin) / (defaultMax - defaultMin)) * 100;

			const fill = this.getElement(`.selection__range-fill[data-range="${range}"]`);
			if (fill) {
				fill.style.left = `${minPercentage}%`;
				fill.style.width = `${Math.max(0, maxPercentage - minPercentage)}%`;
			}

			const minValueEl = this.getElement(`[data-value="${range}-min"]`);
			const maxValueEl = this.getElement(`[data-value="${range}-max"]`);

			if (minValueEl) minValueEl.textContent = range === "area" ? min : Math.ceil(min);
			if (maxValueEl) maxValueEl.textContent = range === "area" ? max : Math.ceil(max);
		}

		debounceFilter() {
			if (this.debounceTimer) {
				clearTimeout(this.debounceTimer);
			}
			this.debounceTimer = setTimeout(() => {
				this.applyFilters();
			}, 150);
		}

		applyFilters() {
			this.filteredOffices = this.offices.filter((office) => {
				const floorMatch = office.floor >= this.filters.floor.min && office.floor <= this.filters.floor.max;
				const areaMatch = office.area >= this.filters.area.min && office.area <= this.filters.area.max;
				const capacityMatch = office.capacity >= this.filters.capacity.min && office.capacity <= this.filters.capacity.max;
				return floorMatch && areaMatch && capacityMatch;
			});

			this.sortOffices();
			this.renderResults();
		}

		handleSortChange(value) {
			this.currentSort = value;
			this.updateSortDisplay();
			this.sortOffices();
			this.renderResults();
		}

		sortOffices() {
			const sortFunctions = {
				"price-asc": (a, b) => a.price - b.price,
				"price-desc": (a, b) => b.price - a.price,
				default: (a, b) => a.id - b.id,
			};
			const sortFunction = sortFunctions[this.currentSort] || sortFunctions.default;
			this.filteredOffices.sort(sortFunction);
		}

		renderResults() {
			const resultsContainer = this.getElement("[data-results]");
			const countElement = this.getElement("[data-count]");

			if (countElement) countElement.textContent = this.filteredOffices.length;
			if (!resultsContainer) return;

			if (this.filteredOffices.length === 0) {
				resultsContainer.innerHTML = '<div class="selection__no-results">Совпадений не найдено</div>';
				return;
			}

			const fragment = document.createDocumentFragment();
			this.filteredOffices.forEach((office) => {
				const listItem = this.createOfficeListItem(office);
				fragment.appendChild(listItem);
			});

			resultsContainer.innerHTML = "";
			resultsContainer.appendChild(fragment);
		}

		createOfficeListItem(office) {
			const div = document.createElement("div");
			div.className = "selection__list-item";
			div.innerHTML = `
        		<a class="selection__list-item-wrapper" href="${office.image}" data-fancybox="offices-plan">
        			<div class="selection__list-item-plan">
        				<div class="selection__list-item-plan-overlay icon-zoom"></div>
        				<picture class="selection__list-item-image-container">
        					<img class="selection__list-item-image" src="${office.image}" alt="Офис № ${office.id}">
        				</picture>
        			</div>
        			<div class="selection__list-item-param">${office.id}</div>
        			<div class="selection__list-item-param">${office.floor}</div>
        			<div class="selection__list-item-param">${Math.round(office.area)}</div>
        			<div class="selection__list-item-param">${office.capacity} чел.</div>
        			<div class="selection__list-item-param">от ${office.price.toLocaleString()} ₽</div>
        		</a>
        		<div class="selection__list-item-button-container">
        			<button class="selection__list-item-button" type="button" data-modal="office-${office.id}">
        				<span>Выбрать</span>
        				<i class="selection__list-item-button--icon icon-arrow"></i>
        			</button>
        		</div>
      		`;
			return div;
		}

		updateSortDisplay() {
			const sortCurrent = this.getElement(".selection__sort-current");
			if (sortCurrent) {
				sortCurrent.textContent = this.sortOptions[this.currentSort];
			}
		}

		resetFilters() {
			this.filters = JSON.parse(JSON.stringify(this.defaultFilters));

			["floor", "area", "capacity"].forEach((range) => {
				const minInput = this.getElement(`.selection__range-input[data-range="${range}"][data-type="min"]`);
				const maxInput = this.getElement(`.selection__range-input[data-range="${range}"][data-type="max"]`);

				if (minInput) minInput.value = this.filters[range].min;
				if (maxInput) maxInput.value = this.filters[range].max;

				this.updateRangeDisplay(range);
			});

			this.currentSort = "default";
			this.updateSortDisplay();
			this.applyFilters();
		}

		destroy() {
			if (this.debounceTimer) {
				clearTimeout(this.debounceTimer);
			}
			this.domCache = {};
		}
	}

	new OfficeSelector();
})();
