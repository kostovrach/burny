(function () {
	const panoramaContainer = document.getElementById("panorama");

	if (!panoramaContainer || typeof pannellum === "undefined") return;

	const scenesPath = "./data/panorama-scenes.json";

	fetch(scenesPath)
		.then((res) => res.json())
		.then((scenes) => {
			pannellum.viewer("panorama", {
				default: {
					firstScene: "scene1",
					sceneFadeDuration: 1000,
					autoLoad: true,
					mouseZoom: false,
				},
				scenes: scenes,
			});
		})
		.catch((err) => {
			console.error(err);
		});
})();
