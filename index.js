require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

let shortUrlId = 1;
let urlDatabase = new Map();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.route('/api/shorturl/:id?').get((req, res) => {
  const shortUrl = req.params.id;
  const originalUrl = urlDatabase.get(shortUrl);
  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.status(404).json({ error: 'URL not found' });
  }
}).post((req, res) => {
  const originalUrl = req.body.url;
  if (dns.lookup(new URL(originalUrl).hostname, (err) => {
    if (err) {
      res.status(400).json({ error: 'invalid url' });
      return;
    }
    const shortUrl = `url${shortUrlId++}`;
    urlDatabase.set(shortUrl, originalUrl);
    res.json({ original_url: originalUrl, short_url: shortUrl });
  }));
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
