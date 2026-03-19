const { test, expect } = require("@playwright/test");
const HomePage = require("../pages/homePage");
const bookingData = require("../test-data/bookingData");

// Wait for Agoda's loading overlay to disappear and return the first hotel result
async function waitForSearchResults(page) {
  await page.locator('text=Just a moment').waitFor({ state: "hidden", timeout: 45000 }).catch(() => {});
  const firstHotel = page.locator('[data-selenium="hotel-name"]').first();
  await firstHotel.waitFor({ state: "visible", timeout: 30000 });
  return firstHotel;
}

// Test case: Verify search results are displayed after submitting a hotel search
test("Search results are displayed after submitting search", async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.goto();
  await homePage.fillHotelName(bookingData.hotelName);
  await homePage.setDates(bookingData.checkIn, bookingData.checkOut);
  await homePage.setGuests(bookingData);
  await homePage.clickSearch();

  //Verify at least one hotel result is visible
  const firstHotel = await waitForSearchResults(page);
  await expect(firstHotel).toBeVisible();
});

// Test case: Verify hotel price is displayed on the detail page
test("Hotel price is displayed on detail page", async ({ page, context }) => {
  const homePage = new HomePage(page);

  await homePage.goto();
  await homePage.fillHotelName(bookingData.hotelName);
  await homePage.setDates(bookingData.checkIn, bookingData.checkOut);
  await homePage.setGuests(bookingData);
  await homePage.clickSearch();

  //Click on the first available hotel result
  const firstHotel = await waitForSearchResults(page);
  const detailPagePromise = context.waitForEvent("page", { timeout: 30000 });
  await firstHotel.click();

  // Wait for the hotel detail page to load
  const detailPage = await detailPagePromise;
  await detailPage.waitForLoadState("domcontentloaded");
  await detailPage.locator('text=Just a moment').waitFor({ state: "hidden", timeout: 45000 }).catch(() => {});

  // Verify the hotel price is displayed
  const price = detailPage.locator('[data-element-name="final-price"]').first();
  await expect(price).toBeVisible({ timeout: 30000 });
});