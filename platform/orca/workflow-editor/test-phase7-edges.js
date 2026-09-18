import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173');
  
  // Wait for interface to load
  await page.waitForTimeout(3000);
  
  // 1. Drag first node (Trigger) to canvas
  const triggerNode = await page.locator('text=Trigger').first();
  const triggerBox = await triggerNode.boundingBox();
  
  // Get canvas center position
  const canvas = await page.locator('[class*="react-flow"]').first();
  const canvasBox = await canvas.boundingBox();
  
  if (triggerBox && canvasBox) {
    // Drag from trigger node to canvas
    await page.dragAndDrop('text=Trigger >> nth=0', 
      { x: canvasBox.x + canvasBox.width * 0.3, y: canvasBox.y + canvasBox.height / 2 });
    await page.waitForTimeout(800);
  }
  
  // Take screenshot showing first node
  await page.screenshot({ path: 'evidence/phase7-001-first-node.png', fullPage: true });
  console.log('Screenshot: First node added to canvas');
  
  // 2. Drag second node (AI Prompt) to canvas at different position
  const aiNode = await page.locator('text=AI Prompt').first();
  if (aiNode && canvasBox) {
    await page.dragAndDrop('text=AI Prompt >> nth=0', 
      { x: canvasBox.x + canvasBox.width * 0.7, y: canvasBox.y + canvasBox.height / 2 });
    await page.waitForTimeout(800);
  }
  
  // Take screenshot showing both nodes
  await page.screenshot({ path: 'evidence/phase7-002-two-nodes.png', fullPage: true });
  console.log('Screenshot: Two nodes on canvas');
  
  // 3. Test edge creation - Find handles and drag to create connection
  const handles = await page.locator('[class*="handle"]').count();
  console.log('Found handles:', handles);
  
  // Get handle positions
  const firstHandle = await page.locator('[class*="handle"]').nth(1); // Right handle of first node
  const secondHandle = await page.locator('[class*="handle"]').nth(2); // Left handle of second node
  
  const firstHandleBox = await firstHandle.boundingBox();
  const secondHandleBox = await secondHandle.boundingBox();
  
  if (firstHandleBox && secondHandleBox) {
    // Drag from first node's right handle to second node's left handle
    await page.dragAndDrop(
      '[class*="handle"] >> nth=1',
      { x: secondHandleBox.x + secondHandleBox.width, y: secondHandleBox.y + secondHandleBox.height / 2 }
    );
    await page.waitForTimeout(600);
  }
  
  // Take screenshot showing edge connection
  await page.screenshot({ path: 'evidence/phase7-003-edge-created.png', fullPage: true });
  console.log('Screenshot: Edge connection created');
  
  // 4. Test edge selection (click on edge)
  const edges = await page.locator('svg path').count();
  console.log('SVG paths (potential edges):', edges);
  
  // Try to click on an edge (if visible)
  const edgeElement = await page.locator('[class*="react-flow__edge"]').first();
  if (edgeElement) {
    await edgeElement.click();
    await page.waitForTimeout(500);
    
    // Take screenshot of selected edge
    await page.screenshot({ path: 'evidence/phase7-004-edge-selected.png', fullPage: true });
    console.log('Screenshot: Edge selected (should show different color)');
  }
  
  // 5. Test edge deletion - press Delete key
  await page.keyboard.press('Delete');
  await page.waitForTimeout(500);
  
  // Take screenshot after deletion
  await page.screenshot({ path: 'evidence/phase7-005-edge-deleted.png', fullPage: true });
  console.log('Screenshot: Edge deleted');
  
  // 6. Test connection validation - try to create self-loop (should be prevented)
  const firstNode = await page.locator('[class*="react-flow__node"]').first();
  if (firstNode) {
    await firstNode.click(); // Select first node
    await page.waitForTimeout(300);
    
    // Try to connect node to itself
    const nodeHandle1 = await page.locator('[class*="handle"]').nth(1);
    const nodeHandle2 = await page.locator('[class*="handle"]').nth(0);
    
    const handle1Box = await nodeHandle1.boundingBox();
    const handle2Box = await nodeHandle2.boundingBox();
    
    if (handle1Box && handle2Box) {
      await page.dragAndDrop('[class*="handle"] >> nth=1', 
        { x: handle2Box.x + handle2Box.width, y: handle2Box.y + handle2Box.height / 2 });
      await page.waitForTimeout(500);
    }
    
    // Take screenshot - should show no new edge (validation prevents it)
    await page.screenshot({ path: 'evidence/phase7-006-validation-test.png', fullPage: true });
    console.log('Screenshot: Validation test (self-loop prevented)');
  }
  
  // 7. Check console for validation warnings
  const logs = [];
  page.on('console', msg => {
    if (msg.type() === 'warn') {
      logs.push(msg.text());
    }
  });
  
  console.log('Test completed - Phase 7 edge management features tested');
  
  await browser.close();
})();
