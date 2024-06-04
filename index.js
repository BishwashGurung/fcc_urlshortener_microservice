require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const bodyParser = require("body-parser");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// Added Code

let urlCounter = 1;
const urlMap = new Map();

app.post("/api/shorturl", (req, res) => {
  const { url: inputUrl } = req.body;
  const urlPattern = new RegExp(/^(http|https):\/\/[^ "]+$/);
  if (!urlPattern.test(inputUrl)) {
    return res.json({ error: "invalid url" });
  }
  const hostname = new URL(inputUrl).hostname;
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: "invalid url" });
    }
  });
  for (const [shortUrl, originalUrl] of urlMap) {
    if (originalUrl === inputUrl) {
      return res.json({ original_url: inputUrl, short_url: shortUrl });
    }
  }
  urlMap.set(urlCounter, inputUrl);
  res.json({ original_url: inputUrl, short_url: urlCounter });
  urlCounter++;
});

app.get("/api/shorturl/:shortUrl", (req, res) => {
  const shortUrl = parseInt(req.params.shortUrl);
  if (!urlMap.has(shortUrl)) return res.status(404).json("No URL found");
  res.redirect(urlMap.get(shortUrl));
});


app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
