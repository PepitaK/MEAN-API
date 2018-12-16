// server.js
// load the things we need
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var date = new Date();

const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://123456A:123456A@ds026018.mlab.com:26018/testitietokanta";
const dbName = "testitietokanta";


// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
  extended: true
}));



// use res.render to load up an ejs view file
app.get("/", function(req, res) {
  var result = getAll(function(err, result) {
    res.send("Toiminnot: <br>/getall - Näytä kaikki ponit <br> /get/:id - Näytä poni, jolla on tietty ID (1-5) <br>/post - Lisää  uusi poni<br>/put/:id - Muokkaa ponia <br> /delete/:id - Poista lisätty poni");

    //handle err, then you can render your view
    //console.log(result);
  });
});


// Sivu joka palauttaa kaiken (osoite suoraan tehtävänannosta....)
app.get("/getall", function(req, res) {
  var result = getAll(function(err, result) {
    res.send(result);
    //handle err, then you can render your view
    //console.log(result);
  });
  // funktio alhaalla, koska ei tarvita req.params ...
});



// Sivu, joka näyttää id:llä "docId"
app.get("/get/:id", function(req, res) {
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
          var query = {id:req.params.id};

          db.collection("poneja").find(query).limit(50).sort({
            "_id": -1
          }).toArray(function(err, result) {
            if (err);
            console.log(req.params.id);
            client.close();


            callback(err, result);
          });
        }
      });
  }
});

app.post('/post', function(req, res){

// mitä lisätään
var uusiponi = {Nimi:"Tappi",
                Väri:"Musta",
                Säkäkorkeus:"120 cm",
                Syntymävuosi:"2015",
                Syntymäpäivä:"10.lokakuuta",
                Rotu:"Kanadanponi",
                Lempi_herkku:"Omena",
                Sukupuoli:"Ruuna",
                id:"6"};


    MongoClient.connect(url, {useNewUrlParser: true},
      function(err, client) {
        if (err) {} else {
          console.log("Connection established to", url);
          const db = client.db(dbName);
          var query = {};

  // itse lisäys
          db.collection("poneja").insertOne(uusiponi);
        }
      });

//convert the response in JSON format
res.send("Poni seuraavilla tiedoilla lisätty tietokantaan! Hurraa uusi poni!<br>" + (JSON.stringify(uusiponi)));

});


// Sivu, joka päivittää annetun ID:n lempiherkuksi Joulunamit!
app.put("/put/:id", function(req, res) {
  res.send("Ponin, jonka ID on " + req.params.id + ", lempiherkuksi päivitetty Joulunamit! :)");
  var result = putDocId(function(err, result) {
    res.send(result);
    //handle err, then you can render your view
    //console.log(result);
  });
  ////////// hakee tietyllä ID:llä (docId)
  function putDocId(callback) {

    MongoClient.connect(url, {useNewUrlParser: true},
      function(err, client) {
        if (err) {} else {
          console.log("Connection established to", url);
          const db = client.db(dbName);
          var query = {id:req.params.id};


          db.collection("poneja").updateOne({ id:req.params.id },{ $set: { Lempi_herkku : "Joulunamit" } });
            client.close();


            callback(err, result);
        }
      });
  }
});

// Sivu, joka näyttää id:llä "docId"
app.delete("/delete/:id", function(req, res) {
  res.send("Poni, jonka ID on " + req.params.id + " on poistettu tietokannasta :(");
  var result = putDocId(function(err, result) {
    res.send(result);
    //handle err, then you can render your view
    //console.log(result);
  });
  ////////// hakee tietyllä ID:llä (docId)
  function putDocId(callback) {

    MongoClient.connect(url, {useNewUrlParser: true},
      function(err, client) {
        if (err) {} else {
          console.log("Connection established to", url);
          const db = client.db(dbName);
          var query = {id:req.params.id};


          db.collection("poneja").deleteOne({ id:req.params.id });
            client.close();


            callback(err, result);
        }
      });
  }
});


//////// Hakee kaiken
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

        db.collection("poneja").find(query).limit(50).sort({
          "_id": -1
        }).toArray(function(err, result) {
          if (err) throw err;
          console.log(result);
          client.close();

          callback(err, result);
        });
      }
    });
}


app.listen(process.env.PORT || 8080)
console.log('8080 is the magic port');
