import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // LOGIN
  await page.goto("https://mikhmon.jacobjs.my.id/admin.php?id=login", {
    waitUntil: "networkidle2",
  });

  await page.type('input[name="user"]', "jacob157-rgb");
  await page.type('input[name="pass"]', "J4cobjokey!");

  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2" }),
    page.click('input[name="login"]'),
  ]);

  console.log("Login berhasil");

  // PROFILE
  const profile = "2k";

  const urlMap = {
    "2k": "https://mikhmon.jacobjs.my.id/?hotspot-user=generate&genprof=2k-12j&session=AgungWifi",
    "3k": "https://mikhmon.jacobjs.my.id/?hotspot-user=generate&genprof=3k-24j&session=AgungWifi",
    "10k":
      "https://mikhmon.jacobjs.my.id/?hotspot-user=generate&genprof=10k-1mg&session=AgungWifi",
    "30k":
      "https://mikhmon.jacobjs.my.id/?hotspot-user=generate&genprof=30k-1bl&session=AgungWifi",
  };

  await page.goto(urlMap[profile], { waitUntil: "networkidle2" });

  console.log("Halaman generate terbuka");

  // FORM
  await page.type('input[name="qty"]', "36");
  await page.select('select[name="server"]', "all");

  // user (dropdown)
  await page.select('select[name="user"]', "vc");

  // tunggu efek onchange
  await page.waitForSelector('select[name="userl"]');
  await page.select('select[name="userl"]', "8");

  // mapping limit
  const config = {
    "2k": { time: "12h", data: "2" },
    "3k": { time: "1d", data: "3" },
    "10k": { time: "7d", data: "8" },
    "30k": { time: "4w3d", data: "100" },
  };

  const { time, data } = config[profile];

  // timelimit
  await page.waitForSelector('input[name="timelimit"]');
  await page.click('input[name="timelimit"]', { clickCount: 3 });
  await page.type('input[name="timelimit"]', time);

  // datalimit
  await page.waitForSelector('input[name="datalimit"]');
  await page.click('input[name="datalimit"]', { clickCount: 3 });
  await page.type('input[name="datalimit"]', data);

  // mbgb
  const mbgb = await page.$('input[name="mbgb"]');
  if (mbgb) {
    await page.$eval('input[name="mbgb"]', (el) => (el.value = "1073741824"));
  }

  // SUBMIT
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2" }),
    page.click('button[name="save"]'),
  ]);

  console.log("Generate berhasil");

  // screenshot hasil
  await page.screenshot({ path: "result.png", fullPage: true });

  await browser.close();
})();
