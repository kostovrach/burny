(function () {
	const container = document.querySelector(".location");
	if (!container) return;

	const output = container.querySelector(".location__item--time-value");
	const timezone = container.dataset.timezone || "Asia/Vladivostok";

	const hasIntl = typeof Intl === "object" && typeof Intl.DateTimeFormat === "function";
	const supportsTimeZone =
		hasIntl &&
		(() => {
			try {
				new Intl.DateTimeFormat("en-US", { timeZone: timezone });
				return true;
			} catch (e) {
				return false;
			}
		})();

	const isLowEndDevice = window.matchMedia("(max-width: 768px)").matches || !supportsTimeZone;

	function formatTime(date, includeSeconds = true) {
		const options = {
			hour: "2-digit",
			minute: "2-digit",
			second: includeSeconds ? "2-digit" : undefined,
			timeZone: timezone,
			hour12: false,
		};
		const formatter = new Intl.DateTimeFormat("ru-RU", options);
		const parts = formatter.formatToParts(date);

		const map = {};
		for (const part of parts) {
			if (part.type !== "literal") {
				map[part.type] = part.value;
			}
		}
		const timeString = includeSeconds ? `${map.hour} : ${map.minute} : ${map.second}` : `${map.hour} : ${map.minute}`;
		return timeString;
	}

	function getOffsetTime(offsetHours, includeSeconds = true) {
		const date = new Date();
		const utc = date.getTime() + date.getTimezoneOffset() * 60000;
		const local = new Date(utc + offsetHours * 3600000);
		const hours = local.getHours().toString().padStart(2, "0");
		const minutes = local.getMinutes().toString().padStart(2, "0");
		const seconds = local.getSeconds().toString().padStart(2, "0");
		return includeSeconds ? `${hours} : ${minutes} : ${seconds}` : `${hours} : ${minutes}`;
	}

	function updateClock() {
		const now = new Date();
		const includeSeconds = !isLowEndDevice;
		const text = supportsTimeZone ? formatTime(now, includeSeconds) : getOffsetTime(10, includeSeconds);
		output.textContent = text;
	}

	updateClock();
	const interval = isLowEndDevice ? 60000 : 1000;
	setInterval(updateClock, interval);
})();
