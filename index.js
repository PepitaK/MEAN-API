// index.js
// load the things we need
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var date = new Date();
const MongoClient = require("mongodb").MongoClient;
// Connection URL
const url = "mongodb://123456A:123456A@ds026018.mlab.com:26018/testitietokanta";
// Database Name
const dbName = "testitietokanta";

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
  extended: true
}));
// use res.render to load up an ejs view file

// index page
app.get("/", function(req, res) {
  var numero = 0;
  var result = getAll(function(err, result2) {
    //handle err, then you can render your view
    //console.log(result);
    res.render("pages/index1", {
      collection2: result2,
      numero: numero
    });
  });
});

// index page
app.post("/", function(req, res) {
  var result = getAll(function(err, result2) {
    var result = getResult(function(err, result) {
      //handle err, then you can render your view
      //console.log(result)
      res.render("pages/index", {
        collection: result,
        collection2: result2,
        numero: numero,
        lanttu: lanttu
      });
    });

    function getResult(callback) {
      MongoClient.connect(url, {
          useNewUrlParser: true
        },
        function(err, client) {
          if (err) {
            console.log("Unable to connect to the mongoDB server. Error:", err);
          } else {
            console.log("Connection established to", url);

            const db = client.db(dbName);
            var query = {};
            db.collection("reaktorpop").aggregate([{
                $match: {
                  CountryCode: lanttu
                }
              },
              {
                $lookup: {
                  from: "reaktorco2",
                  localField: "CountryCode",
                  foreignField: "CountryCode",
                  as: "test"
                }
              }
            ]).toArray(function(err, result) {
              if (err) throw err;
              console.log(result);
              client.close();

              callback(err, result);
            });
          }
        });
    }
    var numero = 0;
    var lanttu = req.body.valitse;
    console.log(lanttu);
  });
});


function getAll(callback) {
  MongoClient.connect(url, {
      useNewUrlParser: true
    },
    function(err, client) {
      if (err) {
        console.log("Unable to connect to the mongoDB server. Error:", err);
      } else {
        console.log("Connection established to", url);

        const db = client.db(dbName);
        var query = {};
        db.collection("reaktorpop").aggregate([{
          $lookup: {
            from: "reaktorco2",
            localField: "CountryCode",
            foreignField: "CountryCode",
            as: "test"
          }
        }]).toArray(function(err, result) {
          if (err) throw err;
          console.log(result);
          client.close();

          callback(err, result);
        });
      }
    });
}


//////////////////// API KUTSUT
// Sivu, joka näyttää id:llä "docId"
app.get("/get/:CC", function(req, res) {
  var result = getDocId(function(err, result) {
    res.send(result);
    //handle err, then you can render your view
    //console.log(result);
  });

  ////////// hakee tietyllä ID:llä (docId)
  function getDocId(callback) {
    MongoClient.connect(url, {useNewUrlParser: true},
      function(err, client) {
        if (err) {} else {
          console.log("Connection established to", url);
          const db = client.db(dbName);
          var query = {CountryCode:req.params.CC};

// taulusta reaktorpop johon yhdistetään reaktorco2, yhdistävänä kenttänä CountryCode
          db.collection("reaktorpop").aggregate([{
              $match: {
                CountryCode: req.params.CC
              }
            },
            {
              $lookup: {
                from: "reaktorco2",
                localField: "CountryCode",
                foreignField: "CountryCode",
                as: "test"
              }
            }
          ]).toArray(function(err, result) {
            if (err);
            console.log(req.params.CC);
            client.close();


            callback(err, result);
          });
        }
      });
  }
});

app.get("/getall", function(req, res) {
  var result = getAll(function(err, result2) {
    //handle err, then you can render your view
    //console.log(result);
    res.send(result2);
  });
});


app.listen(process.env.PORT || 8080)
console.log('8080 is the magic port');

