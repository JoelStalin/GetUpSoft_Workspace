import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🚀 Navegando a http://localhost:5182...');
  await page.goto('http://localhost:5182', { waitUntil: 'networkidle' });

  // Esperar a que cargue
  await page.waitForTimeout(2000);

  // Limpiar localStorage
  console.log('🧹 Limpiando localStorage...');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // Recargar
  console.log('🔄 Recargando página...');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Buscar el categoryBar
  console.log('🔍 Buscando CollapsedCategoryBar...');
  const categoryBarExists = await page.locator('[style*="position: fixed"][style*="width: 56px"]').isVisible().catch(() => false);
  console.log(`   CollapsedCategoryBar visible: ${categoryBarExists}`);

  if (categoryBarExists) {
    // Contar botones
    const buttons = await page.locator('[style*="position: fixed"][style*="width: 56px"] button').count();
    console.log(`   ✅ Encontré ${buttons} botones de categoría`);

    // Hacer click en el primer botón
    console.log('👆 Haciendo click en el primer icono (Triggers)...');
    const firstButton = page.locator('[style*="position: fixed"][style*="width: 56px"] button').first();
    await firstButton.click();

    // Esperar un poco
    await page.waitForTimeout(1000);

    // Verificar si el FloatingWindow del componentes es visible
    console.log('🔍 Verificando si el panel de componentes está visible...');
    const componentsPanelVisible = await page.locator('div:has(> h3:has-text("COMPONENTS"))').isVisible().catch(() => false);
    console.log(`   Panel visible: ${componentsPanelVisible}`);

    // Capturar screenshot
    console.log('📸 Capturando screenshot...');
    await page.screenshot({ path: 'test-screenshot-after-click.png' });
    console.log('   Guardado: test-screenshot-after-click.png');

    if (!componentsPanelVisible) {
      // Debugear el estado de windows en localStorage
      console.log('🐛 DEBUGGING: Estado de windows en localStorage');
      const windowsState = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('orca_windows_state_v3') || '[]');
      });
      console.log('   Windows state:', JSON.stringify(windowsState, null, 2));

      // Verificar el DOM
      console.log('🐛 DEBUGGING: Estado del DOM');
      const domState = await page.evaluate(() => {
        const componentsPanelHeader = document.querySelector('h3');
        return {
          componentsPanelHeaderText: componentsPanelHeader?.textContent || 'NO ENCONTRADO',
          floatingWindowsCount: document.querySelectorAll('[style*="position: fixed"]').length,
          categoryBarVisible: document.querySelector('[style*="position: fixed"][style*="width: 56px"]')?.offsetParent !== null,
        };
      });
      console.log('   DOM state:', domState);
    }
  } else {
    console.log('❌ No encontré CollapsedCategoryBar');
  }

  console.log('✅ Test completado');
  await browser.close();
})();
