document.addEventListener("DOMContentLoaded", function () {
  const chips = Array.from(document.querySelectorAll(".s2-pg-cat"));
  const cards = Array.from(document.querySelectorAll(".s2-pg-insight"));
  if (!chips.length || !cards.length) return;

  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      const cat = chip.dataset.cat;
      chips.forEach((c) => {
        c.classList.toggle("is-active", c === chip);
        c.setAttribute("aria-pressed", String(c === chip));
      });
      cards.forEach((card) => {
        card.hidden = cat !== "all" && card.dataset.cat !== cat;
        card.classList.add("is-visible");
      });
    })
  );
});
