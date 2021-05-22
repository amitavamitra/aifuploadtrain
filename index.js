// import npm packages
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const app = express();
const https = require('https');
const request = require('request');
const rfcClient = require("node-rfc").Client; 
require('dotenv').config();

//  define the app on express middleware
//  we set public to be our static resources 
//  folder for the project
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
// we use ejs as rendering engine
// for this package we need a views folder 
// we define all ui/html pages in this folder
app.set('view engine' , 'ejs');
// we define constants for the project
// this file should be part of .env 
// and part of .gitignore
// credential for ai core instance
const service_key = require('./enablement-sk.json');
// const { request } = require('node:http');
const { func } = require('assert-plus');
const { head } = require('request');
const { TIMEOUT } = require('dns');
const { resolve } = require('path');
const { rejects } = require('assert');
const { config } = require('dotenv');
// clientID acts as username in requests 
const clientId = service_key['clientid'];
//  secretkey acts as password
const secretkey = service_key['clientsecret'];
// base_url to ai instance
const base_url = service_key['serviceurls']['ML_API_URL'] + '/v2' ;
// url to be used to fetch the auth token
var url = service_key['url'] + '/oauth/token?grant_type=client_credentials' ;
// global definition of token variable
var token = "";
//  global definition of serving url for inference
var serving = "";
var alive = "Please log in!";
// get onto the logon page renders the home page
var yourArray = [];
var ent = "";
var val = "";
var text = "";
var entity = [];
var value = [];
var artifactID = "";
var conf_id = "";
var new_artifact = {};
var new_config = {};

app.get('/login', function(req,res){
  res.render('login');
})
app.get('/', function(req,res){
  res.render('home',{alive:alive , new_artifact:new_artifact, entity:entity,value:value , text:text});
})
entity =[];
value = [];
// 1. Function - get JwT token. Button Login press.
//  done through a post route.
// called from Login button in a  form in home.ejs post action .
app.post('/login' , function(req,res){
// use Basic Auth  with clientID and secretkey to base64.
// we use this to auth in the header to fetch the token 
// along with the url prepared earlier.
              var auth = "Basic " + new Buffer(clientId + ":" + secretkey).toString("base64");
              request.get( {
                url : url,
                headers : {
                    "Authorization" : auth
                }
              }, function(error, response, body) {
                  token = JSON.parse(body)['access_token'];
                  console.log(token);
                //    JWT token 
                if (token !== '') {
                   alive = 'You are in'
                  console.log(alive)
                }
              });
                res.redirect('/');
                // Create headers  with AI Resource Group and Bearer token
  });

// Register -> Configure -> Execute
//  Function chaining is required here.
// https://medium.com/technofunnel/javascript-function-chaining-8b2fbef76f7f
// https://javascript.info/promise-chaining
app.post('/', function(req,res){

    var headers = {'AI-Resource-Group': 'default','Authorization': 'Bearer '+ token}
    // console.log(headers);
           const payload = { 
            'name': 'materialbasicdata',
            'kind': 'dataset',
            'url': 'ai://default/spacy/',
            // 'url': 'ai://default/'+ 'spacy/',
            'description': 'A meaningful Description',
            'scenarioId': 'materialbasicdata'
          }   
var conf_payload = {
            "name": "materialbasicdata",
            "executableId": "materialbasicdata",
            "scenarioId": "materialbasicdata",
            "parameterBindings": [
              {
                "key": "training-epochs",
                "value": "1"
              }
            ],
            "inputArtifactBindings": [
              {
                "key": "training-data",
                "artifactId": new_artifact.id
              }
            ]
          }

const art = () => {

            return new Promise((resolve,reject) => {
                  
              const artifact  = base_url + '/lm/artifacts';
        var headers = {'AI-Resource-Group': 'default','Authorization': 'Bearer '+ token}
        const payload = { 
          'name': 'materialbasicdata',
          'kind': 'dataset',
          'url': 'ai://default/spacy/',
          // 'url': 'ai://default/'+ 'spacy/',
          'description': 'A meaningful Description',
          'scenarioId': 'materialbasicdata'
        }   


        request.post({ url:artifact,
                       headers:headers,
                       json: payload}, function(error, response, artbody){
                                               
        new_artifact = artbody;
         resolve(new_artifact);
  
                    });
        
              


            })
}
          
art().then(new_artifact => {
  console.log('Promised Artifact:' ,new_artifact)
  return create_configuration(new_artifact);
}).then(new_config => {
  console.log('Promised Config:' ,new_config)
  return trigger_execution(new_config);
 }).then(new_exec => {
  console.log('Promised Config:' ,new_exec)
 })

    res.redirect('/');
})


function create_configuration(new_artifact){
    const configuration  = base_url + '/lm/configurations';
    var headers = {'AI-Resource-Group': 'default','Authorization': 'Bearer '+ token}
    console.log('*********Artifact Passed for Config********************');
    console.log('Artifact : ', new_artifact);
    console.log('*********Artifact Passed for Config********************');
    var conf_payload = {
      "name": "materialbasicdata",
      "executableId": "materialbasicdata",
      "scenarioId": "materialbasicdata",
      "parameterBindings": [
        {
          "key": "training-epochs",
          "value": "1"
        }
      ],
      "inputArtifactBindings": [
        {
          "key": "training-data",
          "artifactId": new_artifact.id
        }
      ]
    }
    
    request.post({url:configuration,
                    headers:headers,
                json: conf_payload},function(error, response, confbody){
                    console.log('***********************Configuration*************************');
                    console.log('Configuration : ', confbody);
    new_config = confbody;
    resolve(new_config)
    });
    
}

function trigger_execution(new_config) {
 
var conf_id = new_config.id;

const execUrl  = base_url + '/lm/configurations/' + conf_id + '/executions' ;


request.post({url: execUrl, headers: headers},function(error,response,body){
console.log('***********************Execution*************************');
console.log('Execution : ', body);
new_exec = body;
    resolve(new_exec)
})

}

app.listen(3003,function(){
    console.log('Aws Upload and AI Core Trigger Execution App running at port - 3003')
})