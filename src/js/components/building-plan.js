(function () {
	class InteractiveBuilding {
		static instances = new Map();

		static fallbackData = {
			area: "-",
			count: "-",
			floor: "-",
		};

		constructor(options = {}) {
			const required = ['jsonPath', 'baseId'];
			const missing = required.filter(param => !(param in options));
			
			if (missing.length > 0) {
				throw new Error(`Missing required parameters: ${missing.join(', ')}`);
			}

			if (InteractiveBuilding.instances.has(options.baseId)) {
				console.warn(`InteractiveBuilding with baseId "${options.baseId}" already exists. Ignoring new instance creation.`);
				return InteractiveBuilding.instances.get(options.baseId);
			}

			this.config = {
				...options
			};

			this.elements = {
				container: document.getElementById(this.config.baseId),
				tooltip: document.getElementById(`${this.config.baseId}-tooltip`),
				infoPanel: document.getElementById(`${this.config.baseId}-info`),
				area: document.getElementById(`${this.config.baseId}-area`),
				count: document.getElementById(`${this.config.baseId}-count`),
				floor: document.getElementById(`${this.config.baseId}-floor`),
				marker: document.getElementById(`${this.config.baseId}-marker`)
			};

			if (!this.elements.tooltip || !this.elements.infoPanel || !this.elements.marker) return;

			this.activeFloor = null;
			this.floorData = {};

			InteractiveBuilding.instances.set(this.config.baseId, this);

			this.init();
		}

		async init() {
			await this.loadFloorData();
			this.bindEvents();
		}

		async loadFloorData() {
			try {
				const response = await fetch(this.config.jsonPath);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				this.floorData = await response.json();
				console.log(`Floor data loaded successfully for ${this.config.baseId}`);
			} catch (error) {
				console.warn(`Failed to load floor data from ${this.config.jsonPath}. Using fallback data.`, error);
				this.floorData = InteractiveBuilding.fallbackData;
			}
		}

		adjustMarkerPosition(markerId, deltaX, deltaY) {
			const marker = this.elements.marker.querySelector(`[data-floor="${markerId}"]`);
			if (!marker) return;

			const currentTransform = marker.getAttribute("transform") || "translate(0, 0)";

			const match = currentTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);
			const currentX = match ? parseFloat(match[1]) : 0;
			const currentY = match ? parseFloat(match[2]) : 0;

			marker.setAttribute("transform", `translate(${currentX + deltaX}, ${currentY + deltaY})`);
		}

		getMarkerCenter(marker) {
			const svg = marker.closest("svg");
			if (!svg) return { x: 0, y: 0 };

			const rect = marker.getBoundingClientRect();
			const svgRect = svg.getBoundingClientRect();

			const centerX = rect.left + rect.width / 2 - svgRect.left;
			const centerY = rect.top + rect.height / 2 - svgRect.top;

			return { x: centerX, y: centerY };
		}

		getMarkerRightEdge(marker) {
			const svg = marker.closest("svg");
			if (!svg) return { x: 0, y: 0 };

			const rect = marker.getBoundingClientRect();
			const svgRect = svg.getBoundingClientRect();

			const rightEdge = rect.right - svgRect.left;
			const centerY = rect.top + rect.height / 2 - svgRect.top;

			return { x: rightEdge, y: centerY };
		}

		positionTooltipRightOfMarker(marker) {
			const planContainer = marker.closest("path");
			if (!planContainer) return;

			const markerRightEdge = this.getMarkerRightEdge(marker);

			const tooltipX = markerRightEdge.x + 100; // <----- 
			const tooltipY = markerRightEdge.y - 32; // <----- 

			this.elements.tooltip.style.left = `${tooltipX}px`;
			this.elements.tooltip.style.top = `${tooltipY}px`;
		}

		bindEvents() {
			if (!this.elements.marker) return;

			const markers = this.elements.marker.querySelectorAll("path");

			markers.forEach((marker) => {
				marker.addEventListener("mouseenter", (e) => this.handleMouseEnter(e));
				marker.addEventListener("mouseleave", (e) => this.handleMouseLeave(e));
				marker.addEventListener("click", (e) => this.handleClick(e));
			});
		}

		handleMouseEnter(e) {
			const floor = e.target.dataset.floor;
			const data = this.floorData[floor] || InteractiveBuilding.fallbackData;

			this.showTooltip(data);
			this.positionTooltipRightOfMarker(e.target);
			this.updateInfoPanel(data);
			this.activeFloor = floor;
			this.showInfoPanel();
		}

		handleMouseLeave(e) {
			this.hideTooltip();
			this.hideInfoPanel();
			this.activeFloor = null;
		}

		handleClick(e) {
			const floor = e.target.dataset.floor;
			const data = this.floorData[floor] || InteractiveBuilding.fallbackData;
		}

		showTooltip(data) {
			this.elements.tooltip.textContent = data.floor;
			this.elements.tooltip.classList.add("show");
		}

		hideTooltip() {
			this.elements.tooltip.classList.remove("show");
		}

		updateInfoPanel(data) {
			if (this.elements.area) {
				this.elements.area.textContent = data.area;
			}
			if (this.elements.count) {
				this.elements.count.textContent = data.count;
			}
			if (this.elements.floor) {
				this.elements.floor.textContent = data.floor;
			}
		}

		showInfoPanel() {
			this.elements.infoPanel.classList.add("show");
		}

		hideInfoPanel() {
			this.elements.infoPanel.classList.remove("show");
		}

		getFloorData(floor) {
			return this.floorData[floor] || null;
		}

		getAllFloors() {
			return Object.keys(this.floorData);
		}

		destroy() {
			if (this.elements.marker) {
				const markers = this.elements.marker.querySelectorAll(".building-plan__marker");
				markers.forEach((marker) => {
					marker.removeEventListener("mouseenter", this.handleMouseEnter);
					marker.removeEventListener("mouseleave", this.handleMouseLeave);
					marker.removeEventListener("click", this.handleClick);
				});
			}

			InteractiveBuilding.instances.delete(this.config.baseId);
		}

		static getAllInstances() {
			return Array.from(InteractiveBuilding.instances.values());
		}

		static destroyAll() {
			InteractiveBuilding.instances.forEach(instance => instance.destroy());
			InteractiveBuilding.instances.clear();
		}
	}

	window.InteractiveBuilding = InteractiveBuilding;

	new InteractiveBuilding({
		baseId: "building-plan-offices",
		jsonPath: "./js/offices-plan.json"
	});
	
	new InteractiveBuilding({
		baseId: "building-plan-conference",
		jsonPath: "./js/conference-plan.json"
	});
	
	new InteractiveBuilding({
		baseId: "floor-parking-1",
		jsonPath: "./js/parking-plan.json"
	});
	
	new InteractiveBuilding({
		baseId: "floor-parking-2",
		jsonPath: "./js/parking-plan.json"
	});
	
	new InteractiveBuilding({
		baseId: "floor-parking-3",
		jsonPath: "./js/parking-plan.json"
	});
	
	new InteractiveBuilding({
		baseId: "floor-helipad",
		jsonPath: "./js/helipad-plan.json"
	});

	
	// <div id="building-plan-offices">
	// 	<div class="building-plan__plan">
	// 		<svg id="building-plan-offices-marker">
	// 			<g class="building-plan__marker" data-floor="9">...</g>
	// 			<g class="building-plan__marker" data-floor="8">...</g>
	// 			<!-- ... -->
	// 		</svg>
	// 	</div>
	// 	<div id="building-plan-offices-tooltip"></div>
	// 	<div id="building-plan-offices-info">
	// 		<span id="building-plan-offices-area"></span>
	// 		<span id="building-plan-offices-count"></span>
	// 		<span id="building-plan-offices-floor"></span>
	// 	</div>
	// </div>
	
})();