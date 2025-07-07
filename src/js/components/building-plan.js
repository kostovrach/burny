(function () {
	class InteractiveBuilding {
		constructor() {
			this.tooltip = document.getElementById("building-plan-tooltip");
			this.infoPanel = document.getElementById("building-plan-info");
			this.activeFloor = null;

			this.floorData = {
				9: {
					area: "1283.83",
					offices: "12",
					floor: "24",
				},
				8: {
					area: "1456.22",
					offices: "15",
					floor: "30",
				},
				7: {
					area: "1502.15",
					offices: "18",
					floor: "36",
				},
				3: {
					area: "1445.67",
					offices: "16",
					floor: "32",
				},
				2: {
					area: "1389.45",
					offices: "14",
					floor: "28",
				},
			};

			this.init();
		}

		init() {
			this.bindEvents();
			this.showInfoPanel();
		}

		adjustMarkerPosition(markerId, deltaX, deltaY) {
			const marker = document.querySelector(`[data-floor="${markerId}"]`);
			const currentTransform = marker.getAttribute("transform") || "translate(0, 0)";

			const match = currentTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);
			const currentX = match ? parseFloat(match[1]) : 0;
			const currentY = match ? parseFloat(match[2]) : 0;

			marker.setAttribute("transform", `translate(${currentX + deltaX}, ${currentY + deltaY})`);
		}

		// Функция для получения центра маркера
		getMarkerCenter(marker) {
			const svg = marker.closest('svg');
			const rect = marker.getBoundingClientRect();
			const svgRect = svg.getBoundingClientRect();
			
			// Получаем центр маркера относительно SVG
			const centerX = rect.left + rect.width / 2 - svgRect.left;
			const centerY = rect.top + rect.height / 2 - svgRect.top;
			
			return { x: centerX, y: centerY };
		}

		// Функция для получения правой границы маркера
		getMarkerRightEdge(marker) {
			const svg = marker.closest('svg');
			const rect = marker.getBoundingClientRect();
			const svgRect = svg.getBoundingClientRect();
			
			// Получаем правую границу маркера относительно SVG
			const rightEdge = rect.right - svgRect.left;
			const centerY = rect.top + rect.height / 2 - svgRect.top;
			
			return { x: rightEdge, y: centerY };
		}

		// Функция для позиционирования тултипа справа от маркера
		positionTooltipRightOfMarker(marker) {
			const planContainer = marker.closest('.building-plan__plan');
			const planRect = planContainer.getBoundingClientRect();
			
			// Получаем правую границу маркера
			const markerRightEdge = this.getMarkerRightEdge(marker);
			
			// Вычисляем позицию тултипа относительно контейнера плана
			const tooltipX = markerRightEdge.x + 100; // 60px отступ справа
			const tooltipY = markerRightEdge.y - 32; // Центрируем по вертикали (-20px для компенсации высоты тултипа)
			
			this.tooltip.style.left = `${tooltipX}px`;
			this.tooltip.style.top = `${tooltipY}px`;
		}

		bindEvents() {
			const markers = document.querySelectorAll(".building-plan__marker");

			markers.forEach((marker) => {
				marker.addEventListener("mouseenter", (e) => this.handleMouseEnter(e));
				marker.addEventListener("mouseleave", (e) => this.handleMouseLeave(e));
				marker.addEventListener("click", (e) => this.handleClick(e));
			});
		}

		handleMouseEnter(e) {
			const floor = e.target.dataset.floor;
			const data = this.floorData[floor];

			if (data) {
				this.showTooltip(floor);
				this.positionTooltipRightOfMarker(e.target);
				this.updateInfoPanel(data);
				this.activeFloor = floor;
			}
		}

		handleMouseLeave(e) {
			this.hideTooltip();
			this.activeFloor = null;
		}


		handleClick(e) {
			const floor = e.target.dataset.floor;
			const data = this.floorData[floor];
		}

		showTooltip(floor) {
			this.tooltip.textContent = floor;
			this.tooltip.classList.add("show");
		}

		hideTooltip() {
			this.tooltip.classList.remove("show");
		}

		updateInfoPanel(data) {
			document.getElementById("building-plan-area").textContent = data.area;
			document.getElementById("building-plan-offices").textContent = data.offices;
			document.getElementById("building-plan-floor").textContent = data.floor;
		}

		showInfoPanel() {
			this.infoPanel.classList.add("show");
		}

		// showModal(data) {
		// 	document.getElementById("modal-title").textContent = data.title;
		// 	document.getElementById("modal-description").textContent = data.description;

		// 	const featuresList = document.getElementById("modal-features");
		// 	featuresList.innerHTML = "";

		// 	data.features.forEach((feature) => {
		// 		const li = document.createElement("li");
		// 		li.textContent = feature;
		// 		featuresList.appendChild(li);
		// 	});

		// 	this.modal.classList.add("show");
		// }

		// hideModal() {
		// 	this.modal.classList.remove("show");
		// }
	}

	new InteractiveBuilding();
})();