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
  },
  ips: []
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
      // Get users IP Address
      var xf = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      var ip = xf.split(",")[0];
      // Using temp variable to return data from asyn function
      var tempData = {};
    
      // Get data from iex
      const quote = async (sym) => {
        const quoteData = await iex.quote(sym);
        
        // Get user input
        var stock = sym;
        stock = stock.toUpperCase();
        var like = req.query.like;

        // Build object to update
        var update = {};
        update.stock = quoteData.symbol;
        if(like){
          update.$addToSet = {
            ips: ip
          }
        }
        // Create new entry or update one if it exists
        const dataBaseUpdate = await Stock.findOneAndUpdate({stock: stock}, update, {upsert: true, new: true}, function(err, addedStock){
          if(err){
            console.log(err)
          } else {
            console.log("Stock " + addedStock.stock + " added or updated");
            
            // Clear variable to make way for next stock
            tempData = {};
            // Build object to return
            tempData.stock = addedStock.stock;
            tempData.price = quoteData.latestPrice;
            // Count unique IP address' of people who liked the stock
            tempData.likes = addedStock.ips.length;
            // Respond with object containing relevant data
            console.log("tempData 1", tempData)
            return tempData;
          }
        });
        console.log("tempData outside function", tempData);
        return await tempData;
      }
      // Run async function
      async function start(quote){
        if(typeof req.query.stock == "string"){
          // Single
          var result = {"stockData": {}};
          result.stockData = await quote(req.query.stock);
          res.json(result);
        } else {
          // Multiple
          var result = {"stockData": []};
          var result1 = await quote(req.query.stock[0]);
          result.stockData.push(result1);
          
          var result2 = await quote(req.query.stock[1]);
          result.stockData.push(result2);
          result.stockData[0].rel_likes = result.stockData[0].likes - result.stockData[1].likes;
          result.stockData[1].rel_likes = result.stockData[1].likes - result.stockData[0].likes;
          delete result.stockData[0].likes;
          delete result.stockData[1].likes;
          res.json(result);
        }
        
        
      }
    
      start(quote);
    });
  
};
