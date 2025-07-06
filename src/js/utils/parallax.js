(function () {
  if (window.innerWidth <= 768) return;

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  const elements = document.querySelectorAll("[data-parallax]");

  elements.forEach((el) => {
    const axis = el.dataset.axis || "y";
    const start = parseFloat(el.dataset.start) || 200;
    const end = parseFloat(el.dataset.end) || 0;
    const duration = parseFloat(el.dataset.duration);
    const scrub = el.dataset.scrub !== "false";

    const fromVars = {};
    const toVars = {};

    if (axis === "x") {
      fromVars.x = start;
      toVars.x = end;
    } else {
      fromVars.y = start;
      toVars.y = end;
    }

    const base = {
      ...toVars,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub,
        toggleActions: scrub ? "play none none none" : "play reverse play reverse",
      },
    };

    if (!scrub && duration) base.duration = duration;

    gsap.fromTo(el, fromVars, base);
  });
})();
