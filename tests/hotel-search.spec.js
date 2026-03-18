const { test, expect } = require("@playwright/test");
const HomePage = require("../pages/homePage");
const bookingData = require("../test-data/bookingData");

test("Verify hotel price is displayed", async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.goto();
  await homePage.fillHotelName(bookingData.hotelName);
  await homePage.setDates(bookingData.checkIn, bookingData.checkOut);
  await homePage.setGuests(bookingData);

  await homePage.clickSearch();
  await page.waitForLoadState('domcontentloaded');

  // ✅ wait list
  const firstHotel = page.locator('[data-selenium="hotel-name"]').first();
  await firstHotel.waitFor({ state: 'visible', timeout: 15000 });

  const detailPagePromise = context.waitForEvent('page', { timeout: 15000 });
  await firstHotel.click();
  
  const detailPage = await detailPagePromise;
  await detailPage.waitForLoadState('domcontentloaded');
  const price = detailPage.locator('[data-element-name="final-price"]').first();
  await expect(price).toBeVisible({ timeout: 15000 });
});