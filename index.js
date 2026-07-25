import express from "express";
import puppeteer from "puppeteer";
import fs from "fs";

const app = express();
app.use(express.json());

const PORT = 3000;

// mapping profile
const profileConfig = {
  "2k": {
    url: "2k-12j",
    time: "12h",
    data: "2",
  },
  "3k": {
    url: "3k-24j",
    time: "1d",
    data: "3",
  },
  "10k": {
    url: "10k-1mg",
    time: "7d",
    data: "8",
  },
  "30k": {
    url: "30k-1bl",
    time: "4w3d",
    data: "100",
  },
};

app.post("/generate", async (req, res) => {
  const { user, pass, profile, lembar } = req.body;

  if (!user || !pass || !profile || !lembar) {
    return res.status(400).json({ error: "Parameter tidak lengkap" });
  }

  const config = profileConfig[profile];
  if (!config) {
    return res.status(400).json({ error: "Profile tidak valid" });
  }

  const qty = lembar * 36;

  // format nama file
  const now = new Date();
  const tanggal = now.toISOString().slice(2, 10).replace(/-/g, ""); // contoh: 250726

  const fileName = `${profile}-${lembar}lbr-${tanggal}.pdf`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  try {
    // LOGIN
    await page.goto("https://mikhmon.jacobjs.my.id/admin.php?id=login", {
      waitUntil: "networkidle2",
    });

    await page.type('input[name="user"]', user);
    await page.type('input[name="pass"]', pass);

    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click('input[name="login"]'),
    ]);

    // GENERATE PAGE
    const genUrl = `https://mikhmon.jacobjs.my.id/?hotspot-user=generate&genprof=${config.url}&session=AgungWifi`;

    await page.goto(genUrl, { waitUntil: "networkidle2" });

    // qty (clear dulu)
    await page.waitForSelector('input[name="qty"]');
    await page.click('input[name="qty"]', { clickCount: 3 });
    await page.keyboard.press("Backspace");
    await page.type('input[name="qty"]', String(qty));

    await page.select('select[name="server"]', "all");

    await page.select('select[name="user"]', "vc");
    await page.waitForSelector('select[name="userl"]');
    await page.select('select[name="userl"]', "8");

    // timelimit
    await page.click('input[name="timelimit"]', { clickCount: 3 });
    await page.keyboard.press("Backspace");
    await page.type('input[name="timelimit"]', config.time);

    // datalimit
    await page.click('input[name="datalimit"]', { clickCount: 3 });
    await page.keyboard.press("Backspace");
    await page.type('input[name="datalimit"]', config.data);

    // mbgb
    const mbgb = await page.$('select[name="mbgb"]');

    if (mbgb) {
      await page.$eval('select[name="mbgb"]', (el) => {
        el.value = "1073741824";
        el.dispatchEvent(new Event("change", { bubbles: true }));
      });
    }

    // submit generate
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click('button[name="save"]'),
    ]);

    // ambil batch terakhir
    await page.goto(
      "https://mikhmon.jacobjs.my.id/?hotspot=users&profile=all&session=AgungWifi",
      { waitUntil: "networkidle2" },
    );

    const lastComment = await page.evaluate(() => {
      const select = document.querySelector("#comment");
      return select.options[select.options.length - 1].value;
    });

    // buka print page
    const printUrl = `https://mikhmon.jacobjs.my.id/voucher/print.php?id=${lastComment}&qr=yes&session=AgungWifi`;

    await page.goto(printUrl, { waitUntil: "networkidle2" });

    await page.evaluate(() => {
      window.print = () => {};
    });

    // save PDF
    await page.pdf({
      path: fileName,
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    // kirim file ke client
    res.download(fileName, fileName, (err) => {
      if (!err) fs.unlinkSync(fileName); // hapus setelah kirim
    });
  } catch (err) {
    await browser.close();
    console.error(err);
    res.status(500).json({ error: "Gagal generate voucher" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API jalan di http://localhost:${PORT}`);
});
