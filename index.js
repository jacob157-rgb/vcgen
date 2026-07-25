const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true // ubah ke false kalau mau lihat browsernya
  });

  const page = await browser.newPage();

  await page.goto('https://mikhmon.jacobjs.my.id', {
    waitUntil: 'networkidle2'
  });

  const title = await page.title();
  console.log('Title:', title);

  await page.screenshot({ path: 'screenshot.png' });

  await page.pdf({
    path: 'output.pdf',
    format: 'A4'
  });

  await browser.close();
})();
