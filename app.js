const express = require('express');
const ejs = require('ejs');
const aws = require('aws-sdk');
const bodyParser = require('body-parser');
const path = require('path');
const { json } = require('body-parser');
const { Buffer } = require('buffer');
const app = express();
const fs = require('fs');


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.set('view engine','ejs');
// Update aws with object store secret
//  do this with a get request in env file.
aws.config.update({
    accessKeyId: "AKIAQT4HBU7563FD4N6E",
    secretAccessKey: "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",
    region: 'eu-central-1'
});

// instantiate s3 with the above aws config  
   var s3 = new aws.S3();

  app.post('/', function(req,res){
var session = '21052021';
var myBucket = "hcp-8da2bd2a-eb08-4998-baf0-3ceae565e40d" + "/" + session;
var myKey = 'abcd.txt';
//for text file
//fs.readFile('demo.txt', function (err, data) {
//for Video file
//fs.readFile('demo.avi', function (err, data) {
//for image file                
fs.readFile('abcd.txt', function (err, data) {
  if (err) { throw err; }
console.log(data);
     params = {Bucket: myBucket, Key: myKey, Body: data };
     s3.putObject(params, function(err, data) {
         if (err) {
             console.log(err)
         } else {
             console.log("Successfully uploaded data to myBucket/myKey");
         }
      });
  });
});

  app.get('/',function(req,res){
    res.render('home');
  });
  app.listen(3002,function(req,res){
    console.log('Aws Get and List object app running at port 3002');

  });
