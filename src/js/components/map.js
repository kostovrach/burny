(function () {
	if (!document.getElementById('map')) return;

	const map = L.map("map", {
		center: [43.113632, 131.86954],
		zoom: 15,
		zoomControl: false,
		scrollWheelZoom: false,
		doubleClickZoom: false,
		touchZoom: true,
		dragging: true,
	});

	map.panBy([-200, 0], { animate: false });

	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

	L.control.zoom({ position: "topright" }).addTo(map);

	const markers = [];

	fetch("./js/map-points.json")
		.then((res) => res.json())
		.then((points) => {
			points.forEach((point) => {
				let markerHtml = "";

				if (point.isMain) {
					markerHtml = `
                        <div class="map__point--main">
                          <picture class="map__point-icon-container--main">
                            <img class="map__point-icon--main" src="assets/icons/map-points/${point.icon}" alt="${point.name}">
                          </picture>
                          <div class="map__point-spacer--main"></div>
                          <div class="map__point-label--main">${point.name}</div>
                        </div>
                    `;
				} else {
					markerHtml = `
                        <div class="map__point">
                            <picture class="map__point-icon-container">
                            <img class="map__point-icon" src="assets/icons/map-points/${point.icon}" alt="${point.name}">
                          </picture>
                          <div class="map__point-label">${point.name}</div>
                        </div>
                    `;
				}

				const icon = L.divIcon({
					html: markerHtml,
					className: "",
					iconSize: null,
				});

				const marker = L.marker([point.lat, point.lng], { icon });

				marker.isMain = !!point.isMain;

				marker.addTo(map);

				markers.push(marker);
			});

			function updateMarkersVisibility() {
				const zoom = map.getZoom();

				markers.forEach((marker) => {
					if (marker.isMain) {
						if (!map.hasLayer(marker)) marker.addTo(map);
					} else {
						if (zoom < 14) {
							if (map.hasLayer(marker)) map.removeLayer(marker);
						} else {
							if (!map.hasLayer(marker)) marker.addTo(map);
						}
					}
				});
			}

			updateMarkersVisibility();

			map.on("zoomend", updateMarkersVisibility);
		})
		.catch((err) => {
			console.error(err);
		});
})();
