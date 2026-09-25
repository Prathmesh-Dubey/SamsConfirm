document.addEventListener("DOMContentLoaded", function () {
  const mainImage = document.getElementById("pdMainImage");
  const thumbs = document.getElementById("pdThumbs");
  const viewLabel = document.getElementById("pdViewLabel");
  if (!mainImage || !thumbs) return;

  const buttons = Array.from(thumbs.querySelectorAll(".s2-pd__thumb"));

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const src = btn.getAttribute("data-img");
      if (!src || mainImage.getAttribute("src") === src) return;

      buttons.forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-selected", String(b === btn));
      });

      const label = btn.getAttribute("data-label");
      mainImage.style.opacity = "0";
      window.setTimeout(() => {
        mainImage.src = src;
        mainImage.alt = "SAMS EX-04Z1 rugged smartphone — " + label.toLowerCase();
        if (viewLabel) viewLabel.textContent = label;
        mainImage.style.opacity = "1";
      }, 150);
    });
  });
});
