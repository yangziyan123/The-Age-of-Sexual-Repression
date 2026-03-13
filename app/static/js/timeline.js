(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    return;
  }

  const groups = document.querySelectorAll(".timeline-group");
  groups.forEach((group, index) => {
    group.style.transitionDelay = `${index * 0.05}s`;
  });
})();

