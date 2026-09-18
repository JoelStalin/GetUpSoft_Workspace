import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(5000);
  
  // Get SVG elements
  const svgElements = await page.locator('svg').count();
  console.log(`SVG elements found: ${svgElements}`);
  
  // Get g elements (groups in SVG where nodes are typically rendered)
  const gElements = await page.locator('svg g').count();
  console.log(`SVG group elements: ${gElements}`);
  
  // Get actual node divs
  const nodeDivs = await page.locator('[class*="react-flow__node"]').count();
  console.log(`Node div elements: ${nodeDivs}`);
  
  // Check node visibility
  const nodeElement = await page.locator('[class*="react-flow__node"]').first();
  if (nodeElement) {
    const isVisible = await nodeElement.isVisible();
    console.log(`First node visible: ${isVisible}`);
    
    // Get computed style
    const style = await nodeElement.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        display: computed.display,
        visibility: computed.visibility,
        opacity: computed.opacity,
        position: computed.position,
        zIndex: computed.zIndex,
        transform: computed.transform,
      };
    });
    console.log('Node computed style:', JSON.stringify(style, null, 2));
    
    // Get bounding box
    const box = await nodeElement.boundingBox();
    console.log(`Node bounding box: ${JSON.stringify(box)}`);
  }
  
  // Check canvas SVG
  const canvasSvg = await page.locator('[class*="react-flow"] svg').first();
  if (canvasSvg) {
    const svgBox = await canvasSvg.boundingBox();
    console.log(`Canvas SVG bounds: ${JSON.stringify(svgBox)}`);
    
    // Get SVG viewBox
    const viewBox = await canvasSvg.evaluate(el => el.getAttribute('viewBox'));
    console.log(`SVG viewBox: ${viewBox}`);
  }
  
  await browser.close();
})();
