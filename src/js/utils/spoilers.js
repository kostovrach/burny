(function () {
  const containers = document.querySelectorAll(".js-spoiler-container");
  if (!containers.length) return;

  const spoilerData = new WeakMap();

  containers.forEach((container) => {
    const items = container.querySelectorAll(".js-spoiler-item");
    items.forEach(item => {
      const content = item.querySelector(".js-spoiler-content");
      if (content) {
        spoilerData.set(item, { content, isAnimating: false });
      }
    });

    container.addEventListener("click", handleSpoilerClick);
  });

  function handleSpoilerClick(e) {
    const item = e.target.closest(".js-spoiler-item");
    const data = spoilerData.get(item);
    
    if (!data || data.isAnimating) return;

    e.preventDefault();
    
    const { content } = data;
    const isActive = item.classList.contains("active");
    
    data.isAnimating = true;
    
    if (isActive) {
      collapseWithAnimation(item, content, data);
    } else {
      expandWithAnimation(item, content, data);
    }
  }

  function expandWithAnimation(item, content, data) {
    item.classList.add("active");
    
    const startHeight = content.offsetHeight;
    const endHeight = content.scrollHeight;
    
    const animation = content.animate([
      { height: startHeight + "px", opacity: "0" },
      { height: endHeight + "px", opacity: "1" }
    ], {
      duration: 300,
      easing: "linear",
      fill: "forwards"
    });

    animation.addEventListener("finish", () => {
      content.style.height = "auto";
      data.isAnimating = false;
    });
  }

  function collapseWithAnimation(item, content, data) {
    const startHeight = content.offsetHeight;
    content.style.height = startHeight + "px";
    
    requestAnimationFrame(() => {
      const animation = content.animate([
        { height: startHeight + "px", opacity: "1" },
        { height: "0px", opacity: "0" }
      ], {
        duration: 300,
        easing: "linear",
        fill: "forwards"
      });

      animation.addEventListener("finish", () => {
        item.classList.remove("active");
        content.style.height = "";
        data.isAnimating = false;
      });
    });
  }
})();