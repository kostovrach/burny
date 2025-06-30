(function () {
	const videoBlocks = document.querySelectorAll(".player");

    if (!videoBlocks.length) return;

	videoBlocks.forEach((block) => {
		const video = block.querySelector(".player-video");
		const button = block.querySelector(".player-button");

		if (!video || !button) return;

		button.addEventListener("click", () => {
			if (video.paused) {
				video.play();
			} else {
				video.pause();
			}
		});

		video.addEventListener("play", () => {
			button.classList.remove("icon-play");
			button.classList.add("icon-pause");
		});

		video.addEventListener("pause", () => {
			button.classList.remove("icon-pause");
			button.classList.add("icon-play");
		});
	});
})();
