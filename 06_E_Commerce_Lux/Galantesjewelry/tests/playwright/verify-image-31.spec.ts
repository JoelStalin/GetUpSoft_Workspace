import { test, expect } from '@playwright/test';

test('verify product image for watche', async ({ page }) => {
  // Go to the specific product page
  await page.goto('https://galantesjewelry.com/shop/watche');
  
  // Wait for the main image to be visible
  const mainImage = page.locator('img[alt="watche"]').first();
  await expect(mainImage).toBeVisible();
  
  // Verify the image source is our proxy
  const src = await mainImage.getAttribute('src');
  console.log('Image Source:', src);
  expect(src).toContain('/api/products/image?id=31');
  
  // Check if the image loaded correctly (naturalWidth > 0)
  const isLoaded = await mainImage.evaluate((img) => {
    return img.complete && img.naturalWidth > 0;
  });
  
  console.log('Image Loaded Correctly:', isLoaded);
  expect(isLoaded).toBe(true);
});
