(function () {
	class BuildingModel {
		constructor() {
			this.container = document.getElementById("index-buildingContainer");
			this.model = document.getElementById("index-buildingModel");
			this.modelImage = document.getElementById("index-buildingModelImage");
			this.infoPanel = document.getElementById("index-building-infoPanel");
			this.panelTitle = document.getElementById("index-building-panelTitle");
			this.panelContent = document.getElementById("index-building-panelContent");
			this.closeBtn = document.getElementById("index-building-closeBtn");

			this.activePoint = null;
			this.isMouseInside = false;
			this.parallaxOffset = { x: 0, y: 0 };
			this.maxOffset = 10;

			this.pointsData = {};
			this.points = [];

			this.init();
		}

		async init() {
			await this.loadPointsData();
			this.bindEvents();
			this.setupParallax();
		}

		async loadPointsData() {
			try {
				const response = await fetch("./js/building-info.json");
				const json = await response.json();

				json.forEach((item) => {
					if (item.id) {
						this.pointsData[item.id] = item;
						this.generatePoint(item);
					}
				});

				this.points = document.querySelectorAll(".index-demo__building-point");
			} catch (error) {
				console.error(error);
			}
		}

		generatePoint(data) {
			if (!data.position || !data.position.top || !data.position.left) return;

			const point = document.createElement('a');
			point.id = data.id;
			point.className = 'index-demo__building-point';
			point.setAttribute('data-point', data.id);
			point.style.top = data.position.top;
			point.style.left = data.position.left;

			const img = document.createElement('img');
			img.className = 'index-demo__building-point-image';
			img.src = data.image;
			img.alt = '#';

			point.appendChild(img);
			this.model.appendChild(point);
		}

		bindEvents() {
			this.model.addEventListener("click", (e) => {
				const point = e.target.closest(".index-demo__building-point");
				if (point) {
					e.stopPropagation();
					this.handlePointClick(point);
				}
			});

			this.closeBtn.addEventListener("click", () => this.closePanel());

			document.addEventListener("click", (e) => {
				if (!this.infoPanel.contains(e.target) && this.infoPanel.classList.contains("active")) {
					this.closePanel();
				}
			});
		}

		setupParallax() {
			this.container.addEventListener("mouseenter", () => {
				this.isMouseInside = true;
			});

			this.container.addEventListener("mouseleave", () => {
				this.isMouseInside = false;
				this.resetParallax();
			});

			this.container.addEventListener("mousemove", (e) => {
				if (this.isMouseInside) this.updateParallax(e);
			});

			this.container.addEventListener("touchmove", (e) => {
				e.preventDefault();
				const touch = e.touches[0];
				this.updateParallax(touch);
			});

			this.container.addEventListener("touchend", () => {
				this.resetParallax();
			});
		}

		updateParallax(event) {
			const rect = this.container.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;

			const deltaX = (event.clientX - centerX) / rect.width;
			const deltaY = (event.clientY - centerY) / rect.height;

			this.parallaxOffset.x = deltaX * this.maxOffset;
			this.parallaxOffset.y = deltaY * this.maxOffset;

			this.applyParallax();
		}

		applyParallax() {
			const transform = `translate(${this.parallaxOffset.x}px, ${this.parallaxOffset.y}px)`;
			this.modelImage.style.transform = transform;
		}

		resetParallax() {
			this.parallaxOffset = { x: 0, y: 0 };
		}

		handlePointClick(point) {
			const pointId = point.dataset.point;

			if (this.activePoint === pointId && this.infoPanel.classList.contains("active")) {
				this.closePanel();
				return;
			}

			this.points.forEach((p) => p.classList.remove("active"));
			point.classList.add("active");
			this.activePoint = pointId;

			this.showPanel(pointId);
		}

		showPanel(pointId) {
			const data = this.pointsData[pointId];

			if (!data) {
				this.panelTitle.textContent = "Информация";
				this.panelContent.innerHTML = `
					<div class="info-text">Информация отсутствует, обратитесь к владельцу сайта.</div>
				`;
			} else {
				this.panelTitle.textContent = data.title;
				this.panelContent.innerHTML = `
					<div class="index-demo__info-panel-text">${data.description}</div>
					<a class="index-demo__info-panel-image-container" data-fancybox="index-demo" href="${data.image}">
						<img src="${data.image}" alt="${data.title}" class="index-demo__info-panel-image">
						<div class="index-demo__info-panel-image-icon">
							<span class="index-demo__info-panel-image-icon-corner"></span>
							<span class="index-demo__info-panel-image-icon-corner"></span>
							<span class="index-demo__info-panel-image-icon-corner"></span>
							<span class="index-demo__info-panel-image-icon-corner"></span>
						</div>
					</a>
				`;
			}

			this.infoPanel.classList.add("active");
			this.model.classList.add("active");
		}

		closePanel() {
			this.infoPanel.classList.remove("active");
			this.model.classList.remove("active");
			this.points.forEach((p) => p.classList.remove("active"));
			this.activePoint = null;
		}
	}

	document.addEventListener("DOMContentLoaded", () => {
		if (!document.getElementById("index-buildingContainer")) return;
		new BuildingModel();
	});
})();