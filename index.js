import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // 1. Buka halaman login
  await page.goto("https://mikhmon.jacobjs.my.id/admin.php?id=login", {
    waitUntil: "networkidle2",
  });

  // 2. Isi login
  await page.type('input[name="user"]', "jacob157-rgb");
  await page.type('input[name="pass"]', "J4cobjokey!");

  // 3. Klik login
  await page.waitForSelector('input[name="login"]');
  await page.click('input[name="login"]');

  // 4. Tunggu redirect ke sessions
  await page.waitForNavigation({ waitUntil: "networkidle2" });

  console.log("Login berhasil");

  // ====== PILIH PROFILE ======
  const profile = "2k"; // ubah: 2k / 3k / 10k / 30k

  let urlGenerate = "";

  if (profile === "2k") {
    urlGenerate =
      "https://mikhmon.jacobjs.my.id/?hotspot-user=generate&genprof=2k-12j&session=AgungWifi";
  } else if (profile === "3k") {
    urlGenerate =
      "https://mikhmon.jacobjs.my.id/?hotspot-user=generate&genprof=3k-24j&session=AgungWifi";
  } else if (profile === "10k") {
    urlGenerate =
      "https://mikhmon.jacobjs.my.id/?hotspot-user=generate&genprof=10k-1mg&session=AgungWifi";
  } else if (profile === "30k") {
    urlGenerate =
      "https://mikhmon.jacobjs.my.id/?hotspot-user=generate&genprof=30k-1bl&session=AgungWifi";
  }

  // 5. Buka halaman generate
  await page.goto(urlGenerate, { waitUntil: "networkidle2" });

  console.log("Halaman generate terbuka");

  // ====== SET FORM ======

  await page.select('select[name="server"]', "all");
  await page.type('input[name="qty"]', "36");

  await page.type('input[name="user"]', "vc");
  await page.select('select[name="user1"]', "8");

  // timelimit & datalimit
  let timelimit = "";
  let datalimit = "";

  if (profile === "2k") {
    timelimit = "12h";
    datalimit = "2";
  } else if (profile === "3k") {
    timelimit = "1d";
    datalimit = "3";
  } else if (profile === "10k") {
    timelimit = "7d";
    datalimit = "8";
  } else if (profile === "30k") {
    timelimit = "4w3d";
    datalimit = "100";
  }

  await page.evaluate(
    (timelimit, datalimit) => {
      document.querySelector('input[name="timelimit"]').value = timelimit;
      document.querySelector('input[name="datalimit"]').value = datalimit;
      document.querySelector('input[name="mbgb"]').value = "1073741824";
    },
    timelimit,
    datalimit,
  );

  console.log("Form sudah diisi");

  // 6. Klik generate
  await page.click('button[name="save"]');

  console.log("Klik generate");

  // optional: tunggu hasil muncul
  await page.waitForTimeout(5000);

  // DEBUG screenshot
  await page.screenshot({ path: "result.png", fullPage: true });

  await browser.close();
})();
