const express = require('express');

const path = require('path');

const bodyParser = require('body-parser');

const app = express();

const mongoose = require('mongoose');

const routes = require('./routes/routes');

const helmet = require('helmet');

const morgan = require('morgan');

const compression = require('compression');

const fs = require('fs');

const MONGO_URI = process.env.MONGODB_URI;

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, token, _id');
    next();
});

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});

app.use(helmet());
app.use(compression());
app.use(morgan('combined', {stream: accessLogStream}));

app.use(routes);

app.use((error, req, res, next) => {
    res.status(500).json({message: 'Server error.'});
});

mongoose
    .connect(
        MONGO_URI,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    )
    .then(result => {
        console.log('Connected');
        app.listen(process.env.PORT || 3000);
    })
    .catch(err => {
        console.log(err);
    });