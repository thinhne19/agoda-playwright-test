class HomePage {
  constructor(page) {
    this.page = page;
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

    const dropdownItem = this.page.locator('li[role="option"]').first();
    await dropdownItem.waitFor({ state: "visible", timeout: 10000 });
    await dropdownItem.click();

    await this.page.waitForLoadState("domcontentloaded");
  }

  async setDates(checkIn, checkOut) {
    const format = (date) => date.toISOString().split("T")[0];

    const calendar = this.page.locator('[class*="DayPicker"]').first();
    const isCalendarVisible = await calendar.isVisible().catch(() => false);

    if (!isCalendarVisible) {
      await this.page.locator('[data-selenium="checkin-box"]').click();
    }

    await calendar.waitFor({ state: "visible", timeout: 5000 });
    await this.page
      .locator(`[data-selenium-date="${format(checkIn)}"]`)
      .click();
    await this.page
      .locator(`[data-selenium-date="${format(checkOut)}"]`)
      .click();
  }

  async setGuests({ adults, children, rooms }) {
    // ===== ROOMS ===== (default = 1)
    for (let i = 1; i < rooms; i++) {
      await this.page
        .locator('[data-selenium="occupancyRooms"] button')
        .last()
        .click();
    }

    // ===== ADULTS ===== (default = 2)
    for (let i = 2; i < adults; i++) {
      await this.page
        .locator('[data-selenium="occupancyAdults"] button')
        .last()
        .click();
    }

    // ===== CHILDREN ===== (default = 0)
    for (let i = 0; i < children; i++) {
      await this.page
        .locator('[data-selenium="occupancyChildren"] button')
        .last()
        .click();
    }

    // chọn tuổi child (nếu có)
    for (let i = 0; i < children; i++) {
      const dropdown = this.page
        .locator('[data-element-name="occ-child-age-dropdown"]')
        .nth(i);

      await dropdown.click();

      const age = 10;

      await this.page
        .locator(`[data-testid="child-ages-dropdown-${i}-${age}"]`)
        .click();
    }

    // đóng box
    await this.page.keyboard.press("Escape");
  }

  // Helper: click một button N lần
  async _clickNTimes(selector, times) {
    if (times <= 0) return;
    const btn = this.page.locator(selector).first();
    await btn.waitFor({ state: "visible", timeout: 5000 });
    for (let i = 0; i < times; i++) {
      await btn.click();
      await this.page.waitForTimeout(300);
    }
  }

  async clickSearch() {
    await this.page.locator('[data-element-name="search-button"]').click();
  }
}

module.exports = HomePage;
