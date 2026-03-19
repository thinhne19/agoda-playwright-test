class HomePage {
  constructor(page) {
    this.page = page;

    // Concentrating the selectors in one place — easier to maintain
    this.selectors = {
      searchBox: "placeholder=Enter a destination or property",
      dropdownOption: 'li[role="option"]',
      checkinBox: '[data-element-name="check-in-box"]',
      searchButton: '[data-element-name="search-button"]',
      occupancyRooms: '[data-selenium="occupancyRooms"]',
      occupancyAdults: '[data-selenium="occupancyAdults"]',
      occupancyChildren: '[data-selenium="occupancyChildren"]',
      childAgeDropdown: '[data-element-name="occ-child-age-dropdown"]',
    };
  }

  async goto() {
    await this.page.goto("https://www.agoda.com/");
    await this.page.keyboard.press("Escape");
  }

  async fillHotelName(hotelName) {
    const searchBox = this.page.getByPlaceholder(
      "Enter a destination or property",
    );
    await searchBox.click();
    await searchBox.fill(hotelName);

    const firstOption = this.page
      .locator(this.selectors.dropdownOption)
      .first();
    await firstOption.waitFor({ state: "visible", timeout: 10000 });
    await firstOption.click();
  }


  async setDates(checkIn, checkOut) {
    const format = (date) => date.toISOString().split("T")[0];

    const checkInCell = this.page.locator(
      `[data-selenium-date="${format(checkIn)}"]`,
    );
    await checkInCell.waitFor({ state: "visible", timeout: 10000 });
    await checkInCell.click();

    const checkOutCell = this.page.locator(
      `[data-selenium-date="${format(checkOut)}"]`,
    );
    await checkOutCell.waitFor({ state: "visible", timeout: 10000 });
    await checkOutCell.click();
  }

  async setGuests({ adults, children, childAges = [], rooms }) {
    // Rooms (default = 1)
    await this._adjustCounter(this.selectors.occupancyRooms, 1, rooms);

    // Adults (default = 2)
    await this._adjustCounter(this.selectors.occupancyAdults, 2, adults);

    // Children (default = 0)
    await this._adjustCounter(this.selectors.occupancyChildren, 0, children);

    // Pick child ages
    for (let i = 0; i < children; i++) {
      const age = childAges[i] ?? 10;

      // Open child age dropdown
      const dropdown = this.page
        .locator(this.selectors.childAgeDropdown)
        .nth(i);
      await dropdown.waitFor({ state: "visible", timeout: 10000 }); // tăng 5000 → 10000

      await dropdown.click();

      const ageOption = this.page.locator(
        `[data-testid="child-ages-dropdown-${i}-${age}"]`,
      );
      
      await ageOption.waitFor({ state: "visible", timeout: 10000 });
      await ageOption.click();

      // Wait for the page to load
      await this.page.waitForLoadState("domcontentloaded");
    }

    // close guest picker
    await this.page.keyboard.press("Escape");
  }

  async clickSearch() {
    await this.page.locator(this.selectors.searchButton).click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  // Increments a counter from its default value to the target value
  async _adjustCounter(sectionSelector, defaultValue, targetValue) {
    const times = targetValue - defaultValue;
    if (times <= 0) return;

    const incrementBtn = this.page.locator(`${sectionSelector} button`).last();
    await incrementBtn.waitFor({ state: "visible", timeout: 5000 });

    for (let i = 0; i < times; i++) {
      await incrementBtn.click();
    }
  }
}

module.exports = HomePage;
