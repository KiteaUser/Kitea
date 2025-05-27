const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

// Accept cookie filename as a command-line argument or default to "cookies.json"
const cookieFile = process.argv[2] || "cookies.json";

async function run() {
  const cookiePath = path.join(__dirname, cookieFile);

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const context = await browser.newContext();

  if (fs.existsSync(cookiePath)) {
    const cookies = JSON.parse(fs.readFileSync(cookiePath, "utf-8"));
    await context.addCookies(cookies);
  } else {
    console.warn(`⚠️ Cookie file "${cookieFile}" not found.`);
  }

  const page = await context.newPage();
  await page.goto("https://www.discover.com/onlinebanking/bank-account/savings/");

  await page.waitForSelector(".apy", { timeout: 10000 });

  const apy = await page.$eval(".apy", el => el.textContent.trim());

  console.log(`[${cookieFile}] Current APY:`, apy);

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
