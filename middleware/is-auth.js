const User = require('../models/user');

const jwt = require('jsonwebtoken');

const TOKEN_KEY = process.env.TOKEN;

module.exports = (req, res, next) => {
    if (req.method === 'GET') {
        User.findById(req.headers._id)
            .then(user => {
                if (!user) {
                    return res.status(401).json({ message: 'Please login.' })
                } else {
                    jwt.verify(req.headers.token, TOKEN_KEY, response => {
                        if (response) {
                            return res.status(401).json({ message: 'Please login.' });
                        } else {
                            req.user = user;
                            next();
                        }
                    });
                }
            })
            .catch(err => {
                throw new Error(err);
            });
    } else {
        User.findById(req.body._id)
            .then(user => {
                if (!user) {
                    return res.status(401).json({ message: 'Please login.' })
                } else {
                    jwt.verify(req.body.token, TOKEN_KEY, response => {
                        if (response) {
                            return res.status(401).json({ message: 'Please login.' });
                        } else {
                            req.user = user;
                            next();
                        }
                    });
                }
            })
            .catch(err => {
                throw new Error(err);
            });
    }
}