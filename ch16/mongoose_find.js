// var mongoose = require('mongoose');

// setTimeout(function(){
//   console.log("Disconnecting db");
//   mongoose.disconnect();
// }, 10000);
// const MongoClient = require('mongodb').MongoClient;
// const assert = require('assert');

// // Connection URL
// const url = 'mongodb://localhost:27017';

// // Database Name
// const dbName = 'brokerme';

// // Use connect method to connect to the server
// MongoClient.connect(url, function(err, client) {
//   assert.equal(null, err);
//   console.log("Connected successfully to server");

//   const db = client.db(dbName);

//   client.close();
// });

var portfinder = require('portfinder');

portfinder.getPort({
  port: 27018,    // minimum port
  stopPort: 27019 // maximum port
}, function (err, port) {
  if (!err) {
     console.log("Err " + err);
   }
   if(port) {
  console.log("Found port " + port);
   } else {console.log("Port not free " + port);}
});

var mongoose = require('mongoose');
const dbURI = 'mongodb://localhost:8081/brokerme';
var db = mongoose.connect(dbURI);
var wordSchema = require('./word_schema.js').wordSchema;
var Words = mongoose.model('Words', wordSchema);
setTimeout(function(){
  console.log("Disconnecting db");

  mongoose.disconnect();
  process.exit(1);
}, 10000);
// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {  
  console.log('Mongoose default connection open to ' + dbURI);
}); 

mongoose.connection.on('connecting', function () {  
  console.log('Mongoose default connection is connecting ' + dbURI);
}); 

// If the connection throws an error
mongoose.connection.on('error',function (err) {  
  console.log('Mongoose default connection error: ' + err);
}); 

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {  
  console.log('Mongoose default connection disconnected'); 
});

// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', function() {  
  mongoose.connection.close(function () { 
    console.log('Mongoose default connection disconnected through app termination'); 
    process.exit(0); 
  }); 
}); 
mongoose.connection.once('open', function(){
  var query = Words.count().where('first').in(['a', 'e', 'i', 'o', 'u']);
  query.where('last').in(['a', 'e', 'i', 'o', 'u']);
  query.exec(function(err, count){
    console.log("\nThere are " + count +
                " words that start and end with a vowel");
  });
  query.find().limit(5).sort({size:-1});
  query.exec(function(err, docs){
    console.log("\nLongest 5 words that start and end with a vowel: ");
    for (var i in docs){
      console.log(docs[i].word);
    }
  });
  query = Words.find();
  query.mod('size',2,0);
  query.where('size').gt(6);
  query.limit(10);
  query.select({word:1, size:1});
  query.exec(function(err, docs){
    console.log("\nWords with even lengths and longer than 6 letters: ");
    for (var i in docs){
      console.log(JSON.stringify(docs[i]));
    }
  });
});
