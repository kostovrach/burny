const VideoModalManager = (() => {
	const videoControllers = {};
	let observer = null;
	let isInitialized = false;

	function initModalVideoFunctionality(modal) {
		const video = modal.querySelector(".modal-media__video");
		const videoButton = modal.querySelector(".modal-media__video-button");
		const videoButtonIcon = modal.querySelector(".modal-media__video-button-icon");
		const container = modal.querySelector(".modal-media__container");
		const closeButton = modal.querySelector(".modal-media__button");

		if (!video || !videoButton || !videoButtonIcon || !container) return null;

		let isVideoPlaying = false;
		let isMuted = false;
		let mouseX = 0;
		let mouseY = 0;
		let buttonAnimationId = null;
		let iconAnimationId = null;
		let isMouseOverContainer = false;
		let isMouseOverCloseButton = false;

		function animateButton() {
			const containerRect = container.getBoundingClientRect();

			const targetX = mouseX - containerRect.left - 64;
			const targetY = mouseY - containerRect.top - 64;

			const currentX = parseFloat(videoButton.style.left) || 0;
			const currentY = parseFloat(videoButton.style.top) || 0;

			const newX = currentX + (targetX - currentX) * 0.1; // <----- 
			const newY = currentY + (targetY - currentY) * 0.1; // <----- 

			videoButton.style.left = `${newX}px`;
			videoButton.style.top = `${newY}px`;

			buttonAnimationId = requestAnimationFrame(animateButton);
		}

		function animateIcon() {
			const containerRect = container.getBoundingClientRect();

			const targetX = (mouseX - containerRect.left - parseFloat(videoButton.style.left || 0) - 64) * 0.2;
			const targetY = (mouseY - containerRect.top - parseFloat(videoButton.style.top || 0) - 64) * 0.2;

			const currentTransform = videoButtonIcon.style.transform;
			const currentX = parseFloat(currentTransform.match(/translateX\(([^)]+)px\)/) || [0, 0])[1] || 0;
			const currentY = parseFloat(currentTransform.match(/translateY\(([^)]+)px\)/) || [0, 0])[1] || 0;

			const newX = currentX + (targetX - currentX) * 0.7; // <----- 
			const newY = currentY + (targetY - currentY) * 0.7; // <----- 

			videoButtonIcon.style.transform = `translateX(${newX}px) translateY(${newY}px)`;

			iconAnimationId = requestAnimationFrame(animateIcon);
		}

		async function playVideoWithSound() {
			try {
				video.muted = false;
				video.volume = 0.4;
				video.currentTime = 0;
				await video.play();
				isVideoPlaying = true;
				isMuted = false;
				updateVolumeIcon();
			} catch (error) {
				try {
					video.muted = true;
					video.volume = 0.4;
					video.currentTime = 0;
					await video.play();
					isVideoPlaying = true;
					isMuted = true;
					updateVolumeIcon();
				} catch (fallbackError) {
				}
			}
		}

		function updateVolumeIcon() {
			if (isMuted) {
				videoButtonIcon.classList.remove("icon-volume-on");
				videoButtonIcon.classList.add("icon-volume-off");
			} else {
				videoButtonIcon.classList.remove("icon-volume-off");
				videoButtonIcon.classList.add("icon-volume-on");
			}
		}

		function toggleMute() {
			if (isVideoPlaying) {
				isMuted = !isMuted;
				video.muted = isMuted;
				updateVolumeIcon();
			}
		}

		function updateButtonVisibility() {
			if (isMouseOverContainer && !isMouseOverCloseButton) {
				videoButton.style.opacity = "1";
			} else {
				videoButton.style.opacity = "0";
			}
		}

		function handleContainerMouseMove(e) {
			mouseX = e.clientX;
			mouseY = e.clientY;

			if (!isMouseOverContainer) {
				isMouseOverContainer = true;
				updateButtonVisibility();
			}
		}

		function handleContainerMouseLeave() {
			isMouseOverContainer = false;
			updateButtonVisibility();
		}

		function handleContainerMouseEnter() {
			isMouseOverContainer = true;
			updateButtonVisibility();
		}

		function handleVideoClick(e) {
			e.preventDefault();
			toggleMute();
		}

		function handleCloseButtonMouseEnter() {
			isMouseOverCloseButton = true;
			updateButtonVisibility();
		}

		function handleCloseButtonMouseLeave() {
			isMouseOverCloseButton = false;
			updateButtonVisibility();
		}

		function stopAnimations() {
			if (buttonAnimationId) {
				cancelAnimationFrame(buttonAnimationId);
				buttonAnimationId = null;
			}
			if (iconAnimationId) {
				cancelAnimationFrame(iconAnimationId);
				iconAnimationId = null;
			}
		}
		function resetState() {
			stopAnimations();
			video.pause();
			video.currentTime = 0;
			video.muted = false;
			isVideoPlaying = false;
			isMuted = false;
			isMouseOverContainer = false;
			isMouseOverCloseButton = false;

			videoButton.style.left = "0px";
			videoButton.style.top = "0px";
			videoButton.style.opacity = "0";
			videoButtonIcon.style.transform = "translateX(0px) translateY(0px)";

			updateVolumeIcon();
		}

		function initVideo() {
			resetState();

			videoButton.style.pointerEvents = "none";

			setTimeout(() => {
				playVideoWithSound();

				animateButton();
				animateIcon();
			}, 600);
		}

		container.addEventListener("mousemove", handleContainerMouseMove);
		container.addEventListener("mouseleave", handleContainerMouseLeave);
		container.addEventListener("mouseenter", handleContainerMouseEnter);
		video.addEventListener("click", handleVideoClick);

		if (closeButton) {
			closeButton.addEventListener("mouseenter", handleCloseButtonMouseEnter);
			closeButton.addEventListener("mouseleave", handleCloseButtonMouseLeave);
		}

		return {
			init: initVideo,
			reset: resetState,
			destroy: () => {
				stopAnimations();
				container.removeEventListener("mousemove", handleContainerMouseMove);
				container.removeEventListener("mouseleave", handleContainerMouseLeave);
				container.removeEventListener("mouseenter", handleContainerMouseEnter);
				video.removeEventListener("click", handleVideoClick);

				if (closeButton) {
					closeButton.removeEventListener("mouseenter", handleCloseButtonMouseEnter);
					closeButton.removeEventListener("mouseleave", handleCloseButtonMouseLeave);
				}
			},
		};
	}

	function createVideoController(modal) {
		const modalId = modal.id;
		if (!modalId) return;

		const controller = initModalVideoFunctionality(modal);
		if (controller) {
			videoControllers[modalId] = controller;
		}
	}
	function handleModalOpen(modal) {
		const modalId = modal.id;
		if (!modalId) return;

		if (!videoControllers[modalId]) {
			createVideoController(modal);
		}

		const controller = videoControllers[modalId];
		if (controller) {
			controller.init();
		}
	}

	function handleModalClose(modal) {
		const modalId = modal.id;
		if (!modalId) return;

		const controller = videoControllers[modalId];
		if (controller) {
			controller.reset();
		}
	}

	function setupModalObserver() {
		observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.type === "attributes" && mutation.attributeName === "open") {
					const modal = mutation.target;

					if (modal.classList.contains("modal-media")) {
						if (modal.hasAttribute("open")) {
							handleModalOpen(modal);
						} else {
							handleModalClose(modal);
						}
					}
				}
			});
		});

		const mediaModals = document.querySelectorAll(".modal-media");
		mediaModals.forEach((modal) => {
			observer.observe(modal, {
				attributes: true,
				attributeFilter: ["open"],
			});
		});
	}

	return {
		init() {
			if (isInitialized) {
				return;
			}

			setupModalObserver();
			isInitialized = true;
		},

		destroy() {
			if (observer) {
				observer.disconnect();
				observer = null;
			}

			Object.values(videoControllers).forEach((controller) => {
				controller.destroy();
			});

			Object.keys(videoControllers).forEach((key) => {
				delete videoControllers[key];
			});

			isInitialized = false;
		},

		getInfo() {
			return {
				isInitialized,
				controllersCount: Object.keys(videoControllers).length,
				controllerIds: Object.keys(videoControllers),
			};
		},
	};
})();

window.VideoModalManager = VideoModalManager;

document.addEventListener("DOMContentLoaded", () => {
	VideoModalManager.init();
});

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => {
		VideoModalManager.init();
	});
} else {
	VideoModalManager.init();
}
