(function () {
	class OfficeSelector {
		constructor() {
			this.offices = [];
			this.filteredOffices = [];
			this.currentSort = "default";
			this.debounceTimer = null;
			this.isDragging = false;
			this.currentDragElement = null;

			this.domCache = {};

			this.filters = {
				floor: { min: 1, max: 20 },
				area: { min: 50, max: 200 },
				capacity: { min: 2, max: 50 },
			};

			this.defaultFilters = { ...this.filters };

			this.sortOptions = {
				"default": "По умолчанию",
				"price-asc": "По возрастанию цены",
				"price-desc": "По убыванию цены"
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
				const response = await fetch("./js/offices.json");
				if (!response.ok) {
					throw new Error(`HTTP error. status: ${response.status}`);
				}
				this.offices = await response.json();
				this.filteredOffices = [...this.offices];
			} catch (error) {
				console.warn("Не удалось загрузить данные из JSON, используются тестовые данные:", error);
				this.offices = [
					{
						id: 1,
						floor: 1,
						area: 1,
						capacity: 1,
						price: 1,
					}
				];
				this.filteredOffices = [...this.offices];
			}
		}

		validateData() {
			this.offices = this.offices.filter(office => {
				return typeof office.id === 'number' &&
					   typeof office.floor === 'number' &&
					   typeof office.area === 'number' &&
					   typeof office.capacity === 'number' &&
					   typeof office.price === 'number';
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
				floor: this.offices.map(office => office.floor),
				area: this.offices.map(office => office.area),
				capacity: this.offices.map(office => office.capacity)
			};

			Object.keys(ranges).forEach(key => {
				const values = ranges[key];
				this.filters[key].min = Math.min(...values);
				this.filters[key].max = Math.max(...values);
			});

			this.defaultFilters = JSON.parse(JSON.stringify(this.filters));
		}

		initializeFilters() {
			["floor", "area", "capacity"].forEach(range => {
				this.updateRangeDisplay(range);
			});
		}

		bindEvents() {
			document.addEventListener("mousedown", this.handleMouseDown.bind(this));
			document.addEventListener("mousemove", this.handleMouseMove.bind(this));
			document.addEventListener("mouseup", this.handleMouseUp.bind(this));

			const resetBtn = this.getElement(".selection__reset-btn");
			resetBtn?.addEventListener("click", this.resetFilters.bind(this));

			this.bindSortEvents();

			document.addEventListener("selectstart", (e) => {
				if (this.isDragging) e.preventDefault();
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

			sortItems.forEach(item => {
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

		handleMouseDown(e) {
			const thumb = e.target.closest(".selection__range-thumb");
			if (!thumb) return;

			this.isDragging = true;
			this.currentDragElement = thumb;
			thumb.classList.add("selection__range-thumb--dragging");

			document.body.style.userSelect = "none";
			e.preventDefault();
		}

		handleMouseMove(e) {
			if (!this.isDragging || !this.currentDragElement) return;

			const track = this.currentDragElement.closest(".selection__range-track");
			if (!track) return;

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
				this.currentDragElement.classList.remove("selection__range-thumb--dragging");
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

			const minThumb = this.getElement(`[data-range="${range}"][data-type="min"]`);
			const maxThumb = this.getElement(`[data-range="${range}"][data-type="max"]`);
			const fill = this.getElement(`[data-range="${range}"].selection__range-fill`);

			if (minThumb) minThumb.style.left = `${minPercentage * 100}%`;
			if (maxThumb) maxThumb.style.left = `${maxPercentage * 100}%`;
			if (fill) {
				fill.style.left = `${minPercentage * 100}%`;
				fill.style.width = `${(maxPercentage - minPercentage) * 100}%`;
			}

			const minValueEl = this.getElement(`[data-value="${range}-min"]`);
			const maxValueEl = this.getElement(`[data-value="${range}-max"]`);

			if (minValueEl) {
				minValueEl.textContent = Math.round(minValue);
			}
			if (maxValueEl) {
				maxValueEl.textContent = Math.round(maxValue);
			}
		}

		resetFilters() {
			this.filters = JSON.parse(JSON.stringify(this.defaultFilters));

			["floor", "area", "capacity"].forEach(range => {
				this.updateRangeDisplay(range);
			});

			this.currentSort = "default";
			this.updateSortDisplay();

			this.applyFilters();
		}

		updateSortDisplay() {
			const sortCurrent = this.getElement(".selection__sort-current");
			if (sortCurrent) {
				sortCurrent.textContent = this.sortOptions[this.currentSort];
			}
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
			this.filteredOffices = this.offices.filter(office => {
				const floorMatch = office.floor >= this.filters.floor.min && 
								  office.floor <= this.filters.floor.max;
				const areaMatch = office.area >= this.filters.area.min && 
								 office.area <= this.filters.area.max;
				const capacityMatch = office.capacity >= this.filters.capacity.min && 
									  office.capacity <= this.filters.capacity.max;

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
				"default": (a, b) => a.id - b.id
			};

			const sortFunction = sortFunctions[this.currentSort] || sortFunctions["default"];
			this.filteredOffices.sort(sortFunction);
		}

		renderResults() {
			const resultsContainer = this.getElement("[data-results]");
			const countElement = this.getElement("[data-count]");

			if (countElement) {
				countElement.textContent = this.filteredOffices.length;
			}

			if (!resultsContainer) return;

			if (this.filteredOffices.length === 0) {
				resultsContainer.innerHTML = '<div class="selection__no-results">Совпадений не найдено</div>';
				return;
			}

			const fragment = document.createDocumentFragment();
			
			this.filteredOffices.forEach(office => {
				const listItem = this.createOfficeListItem(office);
				fragment.appendChild(listItem);
			});

			resultsContainer.innerHTML = '';
			resultsContainer.appendChild(fragment);
		}

		createOfficeListItem(office) {
			const ul = document.createElement('ul');
			ul.className = 'selection__list-item';
			ul.innerHTML = `
				<li class="selection__list-item-plan">
					<a class="selection__list-item-image-container" href="${office.image || 'placeholder.jpg'}" data-fancybox="offices-plan">
						<img class="selection__list-item-image" src="${office.image || 'placeholder.jpg'}" alt="Офис № ${office.id}">
					</a>
				</li>
				<li class="selection__list-item-param">${office.id}</li>
				<li class="selection__list-item-param">${office.floor}</li>
				<li class="selection__list-item-param">${Math.round(office.area)}</li>
				<li class="selection__list-item-param">${office.capacity} чел.</li>
				<li class="selection__list-item-param">от ${office.price.toLocaleString()} ₽</li>
				<li class="selection__list-item-button-container">
					<button class="selection__list-item-button" type="button" data-modal="office-${office.id}">
						<span>Выбрать</span>
						<i class="selection__list-item-button--icon icon-arrow"></i>
					</button>
				</li>
			`;
			return ul;
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