require('dotenv').config();

//import the necessary modules
const path = require('path');
const express = require('express');
const hbs = require('hbs');
const handlebars_helper = require(`./views/hbs-helper.js`);
const routes = require('./routes/routes.js');
const db = require('./models/db.js');
const repl = require('./models/replicator.js');
const { ping_node } = require('./models/nodes.js');
const { select_query } = require('./models/db.js');
const app = express();

//parse incoming requests with urlencoded payloads
app.use(express.urlencoded({ extended: false }));
//parse incoming json payload
app.use(express.json());

var port = process.env.PORT;
var hostname = process.env.HOSTNAME;

//set the file path containing the static assets
app.use(express.static(path.join(__dirname, 'public')));
//set hbs as the view engine
app.set('view engine', 'hbs');
//set the file path containing the hbs files
app.set('views', path.join(__dirname, 'views'));
//set the file path containing the partial hbs files
hbs.registerPartials(path.join(__dirname, 'views/partials'));
/* The page should only be accessible once the database is connected. */
app.use('/', routes);
app.listen(process.env.PORT, process.env.HOSTNAME, function () {
    console.log(`Server is running at http://${hostname}:${port}`);
    repl.replicate();
});


module.exports = app;