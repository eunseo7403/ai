const recommendCodiCards = document.querySelectorAll(".recommend-codi-card");
const selectedCodiSaveButton = document.querySelector(
  ".selected-codi-save-button",
);
const newCodiButton = document.querySelector(".new-codi-card");

const selectRecommendCodiCard = (selectedCard) => {
  recommendCodiCards.forEach((card) => {
    const isSelected = card === selectedCard;

    card.classList.toggle("active", isSelected);
    card.setAttribute("aria-pressed", isSelected ? "true" : "false");
  });
};

recommendCodiCards.forEach((card) => {
  card.addEventListener("click", () => {
    selectRecommendCodiCard(card);
  });

  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    selectRecommendCodiCard(card);
  });
});

selectedCodiSaveButton.addEventListener("click", () => {
  const activeCard = document.querySelector(".recommend-codi-card.active");

  if (!activeCard) {
    window.location.href = "./codi-save.html?mode=new";
    return;
  }

  const codiId = activeCard.dataset.codiId;

  window.location.href = `./codi-save.html?mode=save&codi=${codiId}`;
});

newCodiButton.addEventListener("click", () => {
  window.location.href = "./codi-save.html?mode=new";
});
