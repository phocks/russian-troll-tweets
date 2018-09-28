// server.js
// where your node app starts

// init project
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
const request = require("request");
const csv = require("csvtojson");
var tall = require("tall").default;
var http = require("follow-redirects").http;
var https = require("follow-redirects").https;
var url = require("url");
var followRedirects = require("follow-redirects");

app.use(bodyParser.urlencoded({ extended: true }));

const streams = [
  "https://cdn.glitch.com/b55d6912-2066-451c-91fb-e57aa7fe4aa7%2FIRAhandle_tweets_1.csv?1538012690318",
  "https://cdn.glitch.com/b55d6912-2066-451c-91fb-e57aa7fe4aa7%2FIRAhandle_tweets_2.csv?1538013265449",
  "https://cdn.glitch.com/b55d6912-2066-451c-91fb-e57aa7fe4aa7%2FIRAhandle_tweets_3.csv?1538013332155",
  "https://cdn.glitch.com/b55d6912-2066-451c-91fb-e57aa7fe4aa7%2FIRAhandle_tweets_4.csv?1538013717376",
  "https://cdn.glitch.com/b55d6912-2066-451c-91fb-e57aa7fe4aa7%2FIRAhandle_tweets_5.csv?1538020205607",
  "https://cdn.glitch.com/b55d6912-2066-451c-91fb-e57aa7fe4aa7%2FIRAhandle_tweets_6.csv?1538020446976",
  "https://cdn.glitch.com/b55d6912-2066-451c-91fb-e57aa7fe4aa7%2FIRAhandle_tweets_7.csv?1538020503069",
  "https://cdn.glitch.com/b55d6912-2066-451c-91fb-e57aa7fe4aa7%2FIRAhandle_tweets_8.csv?1538020570580",
  "https://cdn.glitch.com/b55d6912-2066-451c-91fb-e57aa7fe4aa7%2FIRAhandle_tweets_9.csv?1538020618852",
  "https://cdn.glitch.com/b55d6912-2066-451c-91fb-e57aa7fe4aa7%2FIRAhandle_tweets_10.csv?1538020661530",
  "https://cdn.glitch.com/b55d6912-2066-451c-91fb-e57aa7fe4aa7%2FIRAhandle_tweets_11.csv?1538020717103",
  "https://cdn.glitch.com/b55d6912-2066-451c-91fb-e57aa7fe4aa7%2FIRAhandle_tweets_12.csv?1538020757426",
  "https://cdn.glitch.com/b55d6912-2066-451c-91fb-e57aa7fe4aa7%2FIRAhandle_tweets_13.csv?1538006860276"
];

let i = 0;

searchAddress(streams[i]);

function searchAddress(URL) {
  csv()
    .fromStream(request.get(URL))
    .subscribe(
      json => {
        return new Promise((resolve, reject) => {
          // long operation for each json e.g. transform / write into database.

          if (json.content.includes("t.co")) {
            // console.log(json.author + ": " + json.content);

            var matches = json.content.match(/\bhttps?:\/\/\S+/gi);
            // console.log(matches);
            // lengthen(matches[0]);

            matches.forEach(match => {
              request(
                {
                  followAllRedirects: true,
                  url: match
                },
                function(error, response, body) {
                  if (!error) {
                    console.log(response.request.uri.href);
                  }
                }
              );
            });

            // https.get(matches[0], function (response) {
            //   console.log(response.responseUrl);
            //   // response.on('data', function (chunk) {
            //   //   console.log(chunk);
            //   // });
            // }).on('error', function (err) {
            //   console.log("There was an error!........");
            //   console.error(err);
            // });

            // var options = url.parse(matches[0]);
            // options.maxRedirects = 21;
            // https.request(options, (response) => {
            //   console.log(response.responseUrl);
            // });

            // https.request({
            //   host: 'bitly.com',
            //   path: '/UHfDGO',
            // }, function (response) {
            //   console.log(response.responseUrl);
            //   // 'http://duckduckgo.com/robots.txt'
            // });

            setTimeout(() => {
              resolve();
            }, 5000);
          } else {
            resolve();
          }
        });
      },
      onError,
      onComplete
    );
}

function onError() {
  // Do error stuff
}

function onComplete() {
  // Do complete stuff
  i++;
  if (i < streams.length) {
    searchAddress(streams[i]);
  }

  console.log("File " + i + " complete... ");
}

function lengthen(url) {
  tall(url)
    .then(unshortenedUrl => {
      if (
        unshortenedUrl.includes("bit.ly") ||
        unshortenedUrl.includes("ow.ly") ||
        unshortenedUrl.includes("goo.gl") ||
        unshortenedUrl.includes("t.co") ||
        unshortenedUrl.includes("buff.ly") ||
        unshortenedUrl.includes("ift.tt") ||
        unshortenedUrl.includes("tinyurl.com") ||
        unshortenedUrl.includes("fxn.ws") ||
        unshortenedUrl.includes("huff.to") ||
        unshortenedUrl.includes("fb.me") ||
        unshortenedUrl.includes("dld.bz") ||
        unshortenedUrl.includes("intern.az") ||
        unshortenedUrl.includes("nyti.ms") ||
        unshortenedUrl.includes("trib.al") ||
        unshortenedUrl.includes("youtu.be")
      ) {
        lengthen(unshortenedUrl);
      } else {
        console.log(unshortenedUrl);
      }
    })
    .catch(err => console.error("AAAW 👻", err));
}

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// init sqlite db
var fs = require("fs");
var dbFile = "./.data/sqlite.db";
var exists = fs.existsSync(dbFile);
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(dbFile);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function() {
  if (!exists) {
    db.run("CREATE TABLE Dreams (dream TEXT)");
    console.log("New table Dreams created!");

    // insert default dreams
    db.serialize(function() {
      db.run(
        'INSERT INTO Dreams (dream) VALUES ("Find and count some sheep"), ("Climb a really tall mountain"), ("Wash the dishes")'
      );
    });
  } else {
    // console.log('Database "Dreams" ready to go!');
    db.each("SELECT * from Dreams", function(err, row) {
      if (row) {
        console.log("record:", row);
      }
    });
  }
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

// endpoint to get all the dreams in the database
// currently this is the only endpoint, ie. adding dreams won't update the database
// read the sqlite3 module docs and try to add your own! https://www.npmjs.com/package/sqlite3
app.get("/getDreams", function(request, response) {
  db.all("SELECT * from Dreams", function(err, rows) {
    response.send(JSON.stringify(rows));
  });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
