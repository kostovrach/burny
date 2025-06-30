(function () {
  const inputs = document.querySelectorAll("[data-input-tel]");
  const mask = "+7 (___) ___-__-__";
  const def = mask.replace(/\D/g, "");
  const matrix = mask;

  inputs.forEach((input) => {
    const label = input.closest('[class*="__inputbox"]')?.querySelector('[class*="__label"]');

    function checkFilled() {
      const val = input.value.replace(/\D/g, "");
      const isFilled = val.length > 1;

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
      let i = 0;
      let val = input.value.replace(/\D/g, "");
      if (def.length >= val.length) val = def;

      input.value = matrix.replace(/./g, (char) => {
        return /[_\d]/.test(char) && i < val.length
          ? val.charAt(i++)
          : i >= val.length
          ? ""
          : char;
      });

      checkFilled();

      if (event.type === "blur" && input.value.length < 5) {
        input.value = "";
      } else {
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

    checkFilled();
  });
})();
