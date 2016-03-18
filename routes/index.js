var express = require('express');
var router = express.Router();
var pg = require('pg');
var path = require('path');

function convertDecimalToBase62(decimal){
    var base = 64;
    var n = decimal;
    var result = "";

    while (n > 0) {
      d = n / base;
      r = n % base;

      charFormat = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(r);
      result = r.toString + result;
      n = d;
    }

    return result;
}

console.log("__dirname");
console.log(__dirname);

console.log(__dirname + '../' + '../' + 'config');

//var connectionString = require(path.join(__dirname, '../', '../', 'config'));

var connectionString = require(path.join(__dirname,  '../', 'config'));

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

// So when the end user hits the main endpoint,
// we send the index.html file.
// This file will contain our HTML and Angular templates.

router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views', 'index.html'));
});

// Lets keep it simple by adding all endpoints to the index.js file within the "routes" folder.

// Function  URL Action
// CREATE  /api/v1/urls Create an entry in database for single url and calculate its shortened form
// READ  /api/v1/urls Get all urls
// READ  http://localhost:3000/Ac587   Read a single url and get its original form from database and redirect to the long form
// DELETE  /api/v1/urls/:url_id  Delete a single url



// CREATE  /api/v1/urls Create an entry in database for single url and calculate its shortened form

router.post('/api/v1/urls', function(req, res) {

    console.log("inside router.post callback");

    var results = [];
    var results2 = [];

    // Grab data from http request
    var data = {original_url: req.body.original_url};

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Insert Data
        client.query("INSERT INTO myurls(original_url) values($1)", [data.original_url]);

        // SQL Query > Select Data
        // var query = client.query("SELECT * FROM myurls ORDER BY id ASC");
        var query = client.query("SELECT * FROM myurls WHERE original_url=($1)", [data.original_url]);

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            // done();

            // convert results[0].id to a a-z, A-Z, 0-9 string
            // ... this string is base 26 + 26 + 10 = 62

            // {"id":1,"url":"http://www.riipen.com"}

            // a = (32767).toString(16)  // result: "7fff"
            // b = (255).toString(8)     // result: "377"
            // c = (1295).toString(36)   // result: "zz"
            // d = (127).toString(2)     // result: "1111111"

            console.log("results.length = " + results.length);
            console.log("results[0]");
            console.log(results[0]);

            if (results.length > 0) {
              console.log("inside if (results.length > 0) { ");

              console.log("results[0].id.toString(36)");
              console.log(results[0].id.toString(36));

              results[0].base62Id = results[0].id.toString(36);


              // "UPDATE items SET text=($1), complete=($2) WHERE id=($3)", [data.text, data.complete, id]);

              // SQL Query > UPDATE Data
              client.query("UPDATE myurls SET short_url=($1) WHERE id=($2)", [results[0].base62Id, results[0].id]);

              // UPDATE table_name
              // SET column1 = value1, column2 = value2...., columnN = valueN
              // WHERE [condition];

                // SQL Query > Select Data
                var query2 = client.query("SELECT * FROM myurls ORDER BY id ASC");

                // Stream results back one row at a time
                query2.on('row', function(row) {
                    console.log("inside query2.on row for UPDATE");
                    results2.push(row);
                });

                // After all data is returned, close connection and return results
                query2.on('end', function() {
                   console.log("inside query2.on end for UPDATE");

                    done();
                    return res.json(results2);
                });

            }

            // return res.json(results);

        });


    });
});

// READ  /api/v1/urls Get all urls

function getAllUrls(req, res) {

    var results = [];

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM myurls ORDER BY id ASC;");

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });

    });

}


// given the short_url    get the original form of the url

router.get('/*', function(req, res) {

    var results = [];

    // Grab data from http request
    // var data = {short_url: req.body.original_url};

    console.log("inside router.get /*");
    console.log("req.url = " + req.url);

    if (req.url === "/api/v1/urls") {

        return getAllUrls(req, res);

    } else if (req.url === "/favicon.ico") {

        return res.json(results);

    } else {

            // Get a Postgres client from the connection pool
            pg.connect(connectionString, function(err, client, done) {
                // Handle connection errors
                if(err) {
                  done();
                  console.log(err);
                  return res.status(500).json({ success: false, data: err});
                }

                // strip leading "/" off req.url
                var short_url = req.url.substr(1);

                // SQL Query > Select Data
                var query = client.query("SELECT * FROM myurls WHERE short_url=($1)", [short_url]);

                // Stream results back one row at a time
                query.on('row', function(row) {
                    results.push(row);
                });

                // After all data is returned, close connection and return results
                query.on('end', function() {
                    done();

                    console.log("results");
                    console.log(results);
                    // return res.json(results);
                    if (results.length === 0) {
                        console.log("short_url = " + short_url);
                        console.log("... not found in database");
                        done();
                        return res.status(500).json({ success: false, data: 'short_url not found in database'});
                    }
                    console.log("about to redirect to " + results[0].original_url);
                    res.redirect(results[0].original_url);
                });

            });

   }
});
module.exports = router;
