const express = require('express');
const axios = require('axios');
const puppeteer = require("puppeteer");
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello from Vercel!");
});

app.get("/scrape", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    await page.goto("https://example.com"); // Change URL as needed
    const content = await page.content();
    await browser.close();

    const $ = cheerio.load(content);
    const title = $("title").text();
    
    res.json({ title });
  } catch (error) {
    console.error("Scraping error:", error);
    res.status(500).json({ error: "Scraping failed" });
  }
});

module.exports = app;
