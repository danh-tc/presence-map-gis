// Track currently open dropdown
let openDropdown = null;

class DropdownComponent {
  constructor(selector, data) {
    this.dropdownElement = document.querySelector(selector);
    if (!this.dropdownElement) {
      throw new Error("Dropdown element not found");
    }

    this.button = this.dropdownElement.querySelector(".dropdown-button");
    this.content = this.dropdownElement.querySelector(".dropdown-content");
    this.searchInput = this.dropdownElement.querySelector(".dropdown-search");
    this.optionsContainer =
      this.dropdownElement.querySelector(".dropdown-options");

    // Populate the dropdown with initial data
    this.populateDropdown(data);

    this.initialize();
  }

  populateDropdown(data) {
    // Clear existing content
    this.optionsContainer.innerHTML = "";

    // Populate with new options
    this.options = data.map((item) => {
      const anchor = document.createElement("a");
      anchor.href = "#";
      anchor.textContent = item.text;
      anchor.setAttribute("data-value", item.value);
      this.optionsContainer.appendChild(anchor);
      return anchor;
    });
  }

  updateOptions(data) {
    this.populateDropdown(data);
  }

  initialize() {
    this.button.addEventListener("click", () => this.toggleDropdown());
    document.addEventListener("click", (event) =>
      this.handleOutsideClick(event)
    );
    this.optionsContainer.addEventListener("click", (event) =>
      this.handleOptionClick(event)
    );
    this.searchInput.addEventListener("input", () => this.filterOptions());
  }

  toggleDropdown() {
    if (openDropdown && openDropdown !== this) {
      openDropdown.close();
    }

    const isDisplayed = this.content.style.display === "block";
    this.content.style.display = isDisplayed ? "none" : "block";

    if (!isDisplayed) {
      this.searchInput.focus(); // Focus on the search input when dropdown opens
      openDropdown = this; // Set the current dropdown as the open dropdown
    } else {
      openDropdown = null; // Reset openDropdown if the dropdown is being closed
    }
  }

  close() {
    this.content.style.display = "none";
    openDropdown = null;
  }

  handleOutsideClick(event) {
    if (!event.target.closest(".dropdown")) {
      this.close();
    }
  }

  handleOptionClick(event) {
    if (event.target.tagName === "A") {
      this.button.textContent = event.target.textContent;
      this.content.style.display = "none";
      const selectedValue = event.target.getAttribute("data-value");
      if (this.onChangeCallback) {
        this.onChangeCallback(selectedValue);
      }
      openDropdown = null; // Close dropdown after selection
    }
  }

  filterOptions() {
    const searchText = this.searchInput.value.toLowerCase();
    this.options.forEach((option) => {
      const text = option.textContent.toLowerCase();
      option.style.display = text.includes(searchText) ? "block" : "none";
    });
  }

  onChange(callback) {
    this.onChangeCallback = callback;
  }
}

export default DropdownComponent;
