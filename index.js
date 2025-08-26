var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var app = express();

var router = require('./router.js');

app.get('/', (req, res) => {
    res.send("Hello World!  Sign Up");
});

app.set('view engine', 'pug');
app.set('view', './views');

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: true}));

app.use(upload.array());
app.use(express.static('public'));

app.get('/Bye', (req, res) => {
    res.send("Goodbye World!");
});

app.all('/test', (req, res) => {
   res.send("HTTP method doesn't have any effect on this route!");
});

app.get('/things/:id', (req, res) => {
    const id = req.params.id;

    if (!/^\d{5}$/.test(id)) {
        return res.status(400).send('Invalid ID: must be exactly 5 digits');
    }

    res.send('id: ' + id);
});

app.use('/router', router);

app.use((req, res) => {
    res.status(404).send('Invalid URL');
});



app.listen(3000, () => {
    console.log("Server running on port 3000");
});