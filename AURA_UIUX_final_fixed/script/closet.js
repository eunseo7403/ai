const closetTabs = document.querySelectorAll(".closet-tab");
const closetItems = document.querySelectorAll(".closet-item");
const closetMoreButton = document.querySelector(".closet-more-button");
const currentCategoryText = document.querySelector(".current-category-text");
const closetTotalCount = document.querySelector(".closet-total-count");

let currentCategory = "전체";
let isExpanded = false;

const getFilteredItems = () => {
  if (currentCategory === "전체") {
    return Array.from(closetItems);
  }

  return Array.from(closetItems).filter((item) => {
    return item.dataset.category === currentCategory;
  });
};

const updateClosetList = () => {
  const filteredItems = getFilteredItems();

  currentCategoryText.textContent = currentCategory;
  closetTotalCount.textContent = filteredItems.length;

  closetItems.forEach((item) => {
    item.classList.add("hidden");
  });

  filteredItems.forEach((item, index) => {
    if (currentCategory === "전체" && !isExpanded && index >= 10) {
      item.classList.add("hidden");
      return;
    }

    item.classList.remove("hidden");
  });

  if (currentCategory === "전체" && !isExpanded && filteredItems.length > 10) {
    closetMoreButton.classList.remove("hidden");
  } else {
    closetMoreButton.classList.add("hidden");
  }
};

closetTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    closetTabs.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-selected", "false");
    });

    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");

    currentCategory = tab.dataset.category;
    isExpanded = false;

    updateClosetList();
  });
});

closetMoreButton.addEventListener("click", () => {
  isExpanded = true;
  updateClosetList();
});

updateClosetList();
