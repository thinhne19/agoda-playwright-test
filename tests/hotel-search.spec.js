const { test, expect } = require("@playwright/test");
const HomePage = require("../pages/homePage");
const bookingData = require("../test-data/bookingData");

// Helper: chờ Agoda loading overlay biến mất
async function waitForSearchResults(page) {
  await page.locator('text=Just a moment').waitFor({ state: "hidden", timeout: 45000 }).catch(() => {});
  const firstHotel = page.locator('[data-selenium="hotel-name"]').first();
  await firstHotel.waitFor({ state: "visible", timeout: 30000 });
  return firstHotel;
}

// ─── Test 1: Kiểm tra search ra kết quả ─────────────────────────────────────
test("Search results are displayed after submitting search", async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.goto();
  await homePage.fillHotelName(bookingData.hotelName);
  await homePage.setDates(bookingData.checkIn, bookingData.checkOut);
  await homePage.setGuests(bookingData);
  await homePage.clickSearch();

  const firstHotel = await waitForSearchResults(page);
  await expect(firstHotel).toBeVisible();
});

// ─── Test 2: Kiểm tra giá hiển thị trên trang detail ────────────────────────
test("Hotel price is displayed on detail page", async ({ page, context }) => {
  const homePage = new HomePage(page);

  await homePage.goto();
  await homePage.fillHotelName(bookingData.hotelName);
  await homePage.setDates(bookingData.checkIn, bookingData.checkOut);
  await homePage.setGuests(bookingData);
  await homePage.clickSearch();

  const firstHotel = await waitForSearchResults(page);

  // Bắt sự kiện tab mới TRƯỚC khi click
  const detailPagePromise = context.waitForEvent("page", { timeout: 30000 });
  await firstHotel.click();

  // Lấy tab mới và chờ load xong
  const detailPage = await detailPagePromise;
  await detailPage.waitForLoadState("domcontentloaded");

  // Chờ loading overlay trên detail page nếu có
  await detailPage.locator('text=Just a moment').waitFor({ state: "hidden", timeout: 45000 }).catch(() => {});

  // Assert giá hiển thị
  const price = detailPage.locator('[data-element-name="final-price"]').first();
  await expect(price).toBeVisible({ timeout: 30000 });
});