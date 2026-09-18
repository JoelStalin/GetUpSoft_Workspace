const ODOO_URL = 'http://odoo:8069/jsonrpc';
const DB = 'galantes_db';
const USER = 'admin';
const PASS = 'Galantesjewelry#33036';

async function check() {
  const dbRes = await fetch(ODOO_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'call',
      params: { service: 'db', method: 'list', args: [] },
      id: 0
    })
  });
  const dbList = await dbRes.json();
  console.log('Available Databases:', dbList.result);
  
  const authRes = await fetch(ODOO_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'call',
      params: { service: 'common', method: 'login', args: [DB, USER, PASS] },
      id: 1
    })
  });
  const auth = await authRes.json();
  const uid = auth.result;

  const fs = require('fs');
  const DB_PROD = 'galantes_prod';
  console.log('\n--- Fetching and saving image from galantes_prod ---');
  const authResProd = await fetch(ODOO_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'call',
      params: { service: 'common', method: 'login', args: [DB_PROD, USER, PASS] },
      id: 40
    })
  });
  const authProd = await authResProd.json();
  const uidProd = authProd.result;

  const dataResProd = await fetch(ODOO_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'object',
        method: 'execute_kw',
        args: [DB_PROD, uidProd, PASS, 'product.template', 'read', [[31], ['name', 'image_1920']]]
      },
      id: 41
    })
  });
  const dataProd = await dataResProd.json();
  if (dataProd.result && dataProd.result.length > 0) {
    const p = dataProd.result[0];
    if (p.image_1920) {
      const buf = Buffer.from(p.image_1920, 'base64');
      fs.writeFileSync('/tmp/real_img_31.png', buf);
      console.log('Saved image for ID 31. Size:', buf.length, 'bytes');
    } else {
      console.error('No image data in result');
    }
  }
}

check().catch(console.error);
