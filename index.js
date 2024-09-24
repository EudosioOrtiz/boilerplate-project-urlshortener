require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const urlparser = require('url');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI);

const urlSchema = new mongoose.Schema({
  original_url : String,
  short_url: String
});

const Url = mongoose.model('Url', urlSchema);



app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res) {
  console.log(req.body);
  const url = req.body.url
  const dnsLookup = dns.lookup(urlparser.parse(url).hostname,
  async (err, address) => {
    if (!address) {
      res.json({ error: 'invalid url' });
    } else {
      const urlCount = await Url.countDocuments({})
      const urlDoc = {
        original_url : url,
        short_url: urlCount
      }
      var saveUrl = new Url(urlDoc);

      await saveUrl.save();
      res.json({ 
        original_url : req.body.url,
        short_url: urlCount 
      });

    }
    
  })
  
});

app.get('/api/shorturl/:short_url', async (req, res) => {
  const shorturl = req.params.short_url;
  const urlDoc = await Url.findOne({short_url: +shorturl})
  res.redirect(urlDoc.original_url)
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

/*
1. You should provide your own project, not the example URL.
Waiting:2. You can POST a URL to /api/shorturl and get a JSON response 
with original_url and short_url properties. 
Here's an example: { original_url : 'https://freeCodeCamp.org', short_url : 1}
Waiting:3. When you visit /api/shorturl/<short_url>, you will be redirected 
to the original URL.
Waiting:4. If you pass an invalid URL that doesn't follow 
the valid http://www.example.com format, the JSON response 
will contain { error: 'invalid url' }
*/
