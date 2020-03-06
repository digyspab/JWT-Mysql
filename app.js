require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors =  require('cors');
const ejs = require('ejs');
const cookieParser = require('cookie-parser');

const keys = require('./config/keys');
const user = require('./routes/user');
const indexPage = require('./routes/index');




const app = express();


// Middleware
// Configure middleware
app.use(express.static('./public'));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

app.use(cors());
app.use(cookieParser());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


// routes
app.get('/', indexPage);

app.use('/user', user);


app.listen(keys.PORT, () => {
    console.log(`Server is runnig on PORT: ${keys.PORT}`);
});