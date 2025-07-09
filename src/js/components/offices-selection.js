(function () {
	class OfficeSelector {
		constructor() {
			this.offices = [];
			this.filteredOffices = [];
			this.currentSort = "default";
			this.debounceTimer = null;

			this.filters = {
				floor: { min: 1, max: 20 },
				area: { min: 50, max: 200 },
				capacity: { min: 2, max: 50 },
				dining: false,
			};

			this.defaultFilters = { ...this.filters };
			this.isDragging = false;
			this.currentDragElement = null;

			this.init();
		}

		async init() {
			try {
				await this.loadOfficesData();
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
				const response = await fetch("/js/offices.json");
				if (!response.ok) {
					throw new Error(`HTTP error. status: ${response.status}`);
				}
				this.offices = await response.json();
				this.filteredOffices = [...this.offices];
			} catch (error) {
				// Fallback данные если не удалось загрузить JSON
				console.warn("Не удалось загрузить данные из JSON, используются тестовые данные:", error);
				this.offices = [
					{
						id: 1,
						floor: 7,
						area: 78.5,
						hasDiningZone: true,
						capacity: 12,
						price: 5600,
						image: "office-1.png",
					},
					{
						id: 2,
						floor: 5,
						area: 86.7,
						hasDiningZone: false,
						capacity: 15,
						price: 4500,
						image: "office-2.png",
					},
					{
						id: 3,
						floor: 3,
						area: 45.2,
						hasDiningZone: true,
						capacity: 8,
						price: 3200,
						image: "office-3.png",
					},
					{
						id: 4,
						floor: 12,
						area: 125.4,
						hasDiningZone: true,
						capacity: 25,
						price: 8900,
						image: "office-4.png",
					},
					{
						id: 5,
						floor: 2,
						area: 65.8,
						hasDiningZone: false,
						capacity: 10,
						price: 4100,
						image: "office-5.png",
					},
					{
						id: 6,
						floor: 9,
						area: 92.3,
						hasDiningZone: true,
						capacity: 18,
						price: 6700,
						image: "office-6.png",
					},
					{
						id: 7,
						floor: 15,
						area: 156.2,
						hasDiningZone: false,
						capacity: 30,
						price: 11200,
						image: "office-7.png",
					},
					{
						id: 8,
						floor: 1,
						area: 38.5,
						hasDiningZone: false,
						capacity: 6,
						price: 2800,
						image: "office-8.png",
					},
				];
				this.filteredOffices = [...this.offices];
			}
		}

		showError(message) {
			const resultsContainer = document.querySelector("[data-results]");
			if (resultsContainer) {
				resultsContainer.innerHTML = `<div class="office-select__no-results">${message}</div>`;
			}
		}

		calculateDefaultRanges() {
			const floors = this.offices.map((office) => office.floor);
			const areas = this.offices.map((office) => office.area);
			const capacities = this.offices.map((office) => office.capacity);

			this.filters.floor.min = Math.min(...floors);
			this.filters.floor.max = Math.max(...floors);
			this.filters.area.min = Math.min(...areas);
			this.filters.area.max = Math.max(...areas);
			this.filters.capacity.min = Math.min(...capacities);
			this.filters.capacity.max = Math.max(...capacities);

			this.defaultFilters = JSON.parse(JSON.stringify(this.filters));
		}

		initializeFilters() {
			this.updateRangeDisplay("floor");
			this.updateRangeDisplay("area");
			this.updateRangeDisplay("capacity");
		}

		bindEvents() {
			// Range slider events
			document.addEventListener("mousedown", this.handleMouseDown.bind(this));
			document.addEventListener("mousemove", this.handleMouseMove.bind(this));
			document.addEventListener("mouseup", this.handleMouseUp.bind(this));

			// Checkbox events
			const checkbox = document.querySelector("#office-dining");
			checkbox?.addEventListener("change", this.toggleDiningFilter.bind(this));

			// Reset button
			const resetBtn = document.querySelector(".office-select__reset-btn");
			resetBtn?.addEventListener("click", this.resetFilters.bind(this));

			// Sort select
			const sortSelect = document.querySelector("[data-sort]");
			sortSelect?.addEventListener("change", this.handleSortChange.bind(this));

			// Prevent text selection during drag
			document.addEventListener("selectstart", (e) => {
				if (this.isDragging) e.preventDefault();
			});
		}

		handleMouseDown(e) {
			const thumb = e.target.closest(".office-select__range-thumb");
			if (!thumb) return;

			this.isDragging = true;
			this.currentDragElement = thumb;
			thumb.classList.add("office-select__range-thumb--dragging");

			document.body.style.userSelect = "none";
			e.preventDefault();
		}

		handleMouseMove(e) {
			if (!this.isDragging || !this.currentDragElement) return;

			const track = this.currentDragElement.closest(".office-select__range-track");
			const rect = track.getBoundingClientRect();
			const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

			const range = this.currentDragElement.dataset.range;
			const type = this.currentDragElement.dataset.type;

			this.updateRangeValue(range, type, percentage);
			this.updateRangeDisplay(range);

			this.debounceFilter();
		}

		handleMouseUp() {
			if (this.currentDragElement) {
				this.currentDragElement.classList.remove("office-select__range-thumb--dragging");
				this.currentDragElement = null;
			}
			this.isDragging = false;
			document.body.style.userSelect = "";
		}

		updateRangeValue(range, type, percentage) {
			const minValue = this.defaultFilters[range].min;
			const maxValue = this.defaultFilters[range].max;
			const value = minValue + (maxValue - minValue) * percentage;

			if (type === "min") {
				this.filters[range].min = Math.min(value, this.filters[range].max);
			} else {
				this.filters[range].max = Math.max(value, this.filters[range].min);
			}
		}

		updateRangeDisplay(range) {
			const minValue = this.filters[range].min;
			const maxValue = this.filters[range].max;
			const defaultMin = this.defaultFilters[range].min;
			const defaultMax = this.defaultFilters[range].max;

			const minPercentage = (minValue - defaultMin) / (defaultMax - defaultMin);
			const maxPercentage = (maxValue - defaultMin) / (defaultMax - defaultMin);

			// Update thumbs position
			const minThumb = document.querySelector(`[data-range="${range}"][data-type="min"]`);
			const maxThumb = document.querySelector(`[data-range="${range}"][data-type="max"]`);
			const fill = document.querySelector(`[data-range="${range}"].office-select__range-fill`);

			if (minThumb) minThumb.style.left = `${minPercentage * 100}%`;
			if (maxThumb) maxThumb.style.left = `${maxPercentage * 100}%`;
			if (fill) {
				fill.style.left = `${minPercentage * 100}%`;
				fill.style.width = `${(maxPercentage - minPercentage) * 100}%`;
			}

			// Update values
			const minValueEl = document.querySelector(`[data-value="${range}-min"]`);
			const maxValueEl = document.querySelector(`[data-value="${range}-max"]`);

			if (minValueEl) {
				minValueEl.textContent = range === "area" ? Math.round(minValue) : Math.round(minValue);
			}
			if (maxValueEl) {
				maxValueEl.textContent = range === "area" ? Math.round(maxValue) : Math.round(maxValue);
			}
		}

		toggleDiningFilter(e) {
			this.filters.dining = e.target.checked;
			this.debounceFilter();
		}

		resetFilters() {
			this.filters = JSON.parse(JSON.stringify(this.defaultFilters));
			this.filters.dining = false;

			this.updateRangeDisplay("floor");
			this.updateRangeDisplay("area");
			this.updateRangeDisplay("capacity");

			const checkbox = document.querySelector("#office-dining");
			if (checkbox) {
				checkbox.checked = false;
			}

			this.applyFilters();
		}

		debounceFilter() {
			if (this.debounceTimer) {
				clearTimeout(this.debounceTimer);
			}
			this.debounceTimer = setTimeout(() => {
				this.applyFilters();
			}, 300);
		}

		applyFilters() {
			this.filteredOffices = this.offices.filter((office) => {
				return office.floor >= this.filters.floor.min && office.floor <= this.filters.floor.max && office.area >= this.filters.area.min && office.area <= this.filters.area.max && office.capacity >= this.filters.capacity.min && office.capacity <= this.filters.capacity.max && (!this.filters.dining || office.hasDiningZone);
			});

			this.sortOffices();
			this.renderResults();
		}

		handleSortChange(e) {
			this.currentSort = e.target.value;
			this.sortOffices();
			this.renderResults();
		}

		sortOffices() {
			switch (this.currentSort) {
				case "price-asc":
					this.filteredOffices.sort((a, b) => a.price - b.price);
					break;
				case "price-desc":
					this.filteredOffices.sort((a, b) => b.price - a.price);
					break;
				case "default":
				default:
					this.filteredOffices.sort((a, b) => a.id - b.id);
					break;
			}
		}

		renderResults() {
			const resultsContainer = document.querySelector("[data-results]");
			const countElement = document.querySelector("[data-count]");

			if (countElement) {
				countElement.textContent = this.filteredOffices.length;
			}

			if (!resultsContainer) return;

			if (this.filteredOffices.length === 0) {
				resultsContainer.innerHTML = '<div class="office-select__no-results">Офисы не найдены</div>';
				return;
			}

			resultsContainer.innerHTML = this.filteredOffices
				.map(
					(office) => `
                    <div class="office-select__office-card">
                        <div class="office-select__office-image">
                            Схема ${office.id}
                        </div>
                        <div class="office-select__office-details">
                            <div class="office-select__office-param">
                                <span class="office-select__office-param-label">Офис</span>
                                <span class="office-select__office-param-value">${office.id}</span>
                            </div>
                            <div class="office-select__office-param">
                                <span class="office-select__office-param-label">Этаж</span>
                                <span class="office-select__office-param-value">${office.floor}</span>
                            </div>
                            <div class="office-select__office-param">
                                <span class="office-select__office-param-label">Площадь, м²</span>
                                <span class="office-select__office-param-value">${Math.round(office.area)}</span>
                            </div>
                            <div class="office-select__office-param">
                                <span class="office-select__office-param-label">Обеденная зона</span>
                                <span class="office-select__office-param-value">${office.hasDiningZone ? "Есть" : "Нет"}</span>
                            </div>
                            <div class="office-select__office-param">
                                <span class="office-select__office-param-label">Вместимость</span>
                                <span class="office-select__office-param-value">${office.capacity} чел.</span>
                            </div>
                            <div class="office-select__office-param">
                                <span class="office-select__office-param-label">Стоимость в день</span>
                                <span class="office-select__office-param-value">${office.price.toLocaleString()} ₽</span>
                            </div>
                        </div>
                        <button class="office-select__office-select-btn" type="button">
                            Выбрать
                        </button>
                    </div>
                `
				)
				.join("");
		}
	}

	new OfficeSelector();
})();
