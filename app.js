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

const rateLimiter = require('express-rate-limit');

const MONGO_URI = process.env.MONGODB_URI;

app.use(bodyParser.json());

// Rate limiter for authentication
const authLimiter = rateLimiter({
    windowMs: 1000 * 60 * 60,
    max: 5,
    skipSuccessfulRequests: true,
    message: 'Too many attempts, please try again in an hour.',
    handler: (req, res, next) => {
        res.status(429).json({ message: this.message });
    }
});

// Apply rate limiter middleware
app.use('/login', authLimiter);

// CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST','OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Authorization, token, _id');
    next();
});

// Logging stream
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});

// Add helmet and logging
app.use(helmet());
app.use(compression());
app.use(morgan('combined', {stream: accessLogStream}));

app.use(routes);

// Error handling middleware
app.use((error, req, res, next) => {
    res.status(500).json({message: 'Server error.'});
});

// Connect to MONGODB
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