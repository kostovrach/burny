(function () {
	const inputs = document.querySelectorAll('input[type="tel"]');
	const mask = "+_ (___) ___-__-__";
	const def = mask.replace(/\D/g, "");
	const matrix = mask;

	inputs.forEach((input) => {
		const label = input.closest('[class*="__inputbox"]')?.querySelector('[class*="__label"]');

		function checkFilled() {
			const val = input.value.replace(/\D/g, "");
			const isFilled = val.length > def.length;
			input.classList.toggle("filled", isFilled);
			if (label) label.classList.toggle("filled", isFilled);
		}

		function setCursorPosition(pos, el) {
			el.focus();
			if (el.setSelectionRange) {
				el.setSelectionRange(pos, pos);
			} else if (el.createTextRange) {
				const range = el.createTextRange();
				range.collapse(true);
				range.moveEnd("character", pos);
				range.moveStart("character", pos);
				range.select();
			}
		}

		function maskInput(event) {
			let val = input.value.replace(/\D/g, "");
			if (val.length === 0 && event.type === "blur") {
				input.value = "";
				checkFilled();
				return;
			}

			let i = 0;
			const newValue = matrix.replace(/./g, (char) => {
				return /[_\d]/.test(char) && i < val.length ? val.charAt(i++) : i >= val.length ? "" : char;
			});

			input.value = newValue;
			checkFilled();

			if (event.type !== "blur") {
				setCursorPosition(input.value.length, input);
			}
		}

		input.addEventListener("input", maskInput, false);
		input.addEventListener("focus", maskInput, false);
		input.addEventListener("blur", maskInput, false);

		input.addEventListener("click", () => {
			if (input.selectionStart < 4) {
				setCursorPosition(4, input);
			}
		});

		if (input.value.length > 0) {
			maskInput({ type: "input" });
		}
	});
})();
