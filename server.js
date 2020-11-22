'use strict'
// -------------------------
// Application Dependencies
// -------------------------
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');
const { put } = require('superagent');

// -------------------------
// Environment variables
// -------------------------
require('dotenv').config();
// const HP_API_URL = process.env.HP_API_URL;

// -------------------------
// Application Setup
// -------------------------
const app = express();
const PORT = process.env.PORT || 3000;
// Express middleware
// Utilize ExpressJS functionality to pae the body of the request
app.use(express.urlencoded({ extended: true }));

// Application Middleware override
app.use(methodOverride('_method'));

// Specify a directory for static resources
app.use(express.static('./public'));
app.use(express.static('./img'));

// Database Setup


const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));

// Set the view engine for server-side templating

app.set('view engine', 'ejs');


// ----------------------
// ------- Routes -------
// ----------------------

app.get('/', homePage);
app.get('/character/:home', showCharacter);
app.post('/my-characters', setChart);
app.get('/my-characters', getChart);
app.post('/character/:id', details);
app.put('/character/:id', updating);
app.delete('/character/:id', deleting);
// --------------------------------
// ---- Pages Routes functions ----
// --------------------------------

function homePage(req,res){
    res.render('home-page');
}

function showCharacter(req,res){
    let house = req.params.home;
    let url = `http://hp-api.herokuapp.com/api/characters/house/${house}`;
    superagent.get(url).then(data=>{
        data.body.map(element=>{
           return new Story(element);
        })
        res.render('characters', {result:data.body});
    })
}


function setChart(req,res){
    let query = 'INSERT INTO story(name, patronus, alive, image) VALUES($1,$2,$3,$4);';
    let values = [req.body.name,req.body.patronus,req.body.alive,req.body.image];
    client.query(query,values).then(()=>{
        res.redirect('/my-characters')
    })
}

function getChart(req,res){
    let query = 'SELECT * FROM story;';
    client.query(query).then(data=>{
        res.render('my-characters', {result:data.rows})
    })
}  

function details(req,res){
    let query = 'SELECT * FROM story WHERE id=$1;';
    let value = [req.params.id];
    client.query(query,value).then(data=>{
        res.render('details', {result:data.rows[0]});
    })
}

function updating(req,res){
    let query = 'UPDATE story SET name=$1, patronus=$2, alive=$3 WHERE id=$4;';
    let values = [req.body.name,req.body.patronus,req.body.alive,req.params.id];
    client.query(query,values).then(()=>{
        res.redirect('/my-characters');
    })

}

function deleting(req,res){
    let query = 'DELETE FROM story WHERE id=$1;';
    let value = [req.params.id];
    client.query(query,value).then(()=>{
        res.redirect('/my-characters');
    })
}

function Story(data){
    this.name = data.name;
    this.patronus = data.patronus;
    this.alive = data.alive;
    this.image = data.image;
}

// -----------------------------------
// --- CRUD Pages Routes functions ---
// -----------------------------------


// Express Runtime
client.connect().then(() => {
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
}).catch(error => console.log(`Could not connect to database\n${error}`));
