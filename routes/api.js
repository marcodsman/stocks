/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

// ==========
//  MONGOOSE
// ==========
const mongoose = require('mongoose');
mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true }, function(err, db){
  if(err){
    console.log(err)
  } else {
    console.log("Connected to database " +db.name);
  }
});

// ========
//  MODELS
// ========
var stockSchema = new mongoose.Schema({
  stock: {
    type: String,
    unique: true
  }
    ,
  likes: {
    type: Number,
    default: 0
  }
});
var Stock = mongoose.model("Stock", stockSchema);

// IEX Cloud
const iex = require('iexcloud_api_wrapper');
// IEX test
// const quote = async (sym) => {
//   const quoteData = await iex.quote(sym);
//   console.log(quoteData);
// }
// quote("GOOG");
  

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
      var stock = req.query.stock;
      stock = stock.toUpperCase();
      var like = req.query.like;
      var update = {};
      // Get data from iex
      const quote = async (sym) => {
        const quoteData = await iex.quote(sym);
        // Build object to update
        update.stock = quoteData.symbol;
        // update.price = quoteData.latestPrice;
        if(like){
          update.$inc = {
            likes: 1
          }
        }
        // Create new entry or update one if it exists
        Stock.findOneAndUpdate({stock: stock}, update, {upsert: true, new: true}, function(err, addedStock){
          if(err){
            console.log(err)
          } else {
            console.log("Stock " + addedStock.stock + " added or updated");
            // Build object to return
            var stockData = {};
            stockData.stock = addedStock.stock;
            stockData.price = quoteData.latestPrice;
            stockData.likes = addedStock.likes;
            // Respond with object containing relevant data
            res.json(stockData);
          }
        })
      }
      // Run async function
      quote(stock);
    });
  
};
