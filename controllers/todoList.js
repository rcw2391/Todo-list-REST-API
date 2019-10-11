const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const RESET_KEY = process.env.RESET;
const VALIDATE_KEY = process.env.VALIDATE;
const TOKEN_KEY = process.env.TOKEN;

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: process.env.NODEMAILER_API_KEY
    }
}));

exports.postNewToDoList = (req, res, next) => {
    let todoLists = req.body.items;
    const regex = /[^\w\s]/g;
    todoLists = todoLists.filter(itemList => {
        return itemList.items.length > 0;
    });
    for(let i=0; i < todoLists.length; i++){
        for (let k=0; k < todoLists[i].items.length; k++) {
            if (todoLists[i].items[k].item.length > 50 || regex.test(todoLists[i].items[k].item)) {
                return res.status(406).json({message: 'Todo Items must be alphanumeric and can be no longer than 50 characters.'});
            } 
        }
    }
    req.user.todoLists = todoLists;
    console.log(todoLists);
    req.user.save()
    .then(result => {
        console.log(result);
        return res.status(201).json({message: 'Saved.'});
    })
    .catch(err => {
        console.log(err);
        throw new Error(err);
    });
}

exports.getToDoList = (req, res, next) => {
    res.status(200).json({todo: req.user.todoLists});
}

exports.postSignUp = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    if (password !== confirmPassword){
        res.status(406).json({message: 'Passwords do not match!'})
    }
    const hashed_password = bcrypt.hashSync(password, 12);
    User.findOne({email: email})
    .then(user => {
        if (!user){
            const token = jwt.sign({ email: email }, VALIDATE_KEY, { expiresIn: '1h' });
            const user = new User({
                email: email,
                password: hashed_password,
                todoLists: [],
                registrationToken: token,
                isValidated: false
            });
            user.save()
                .then(result => {
                    console.log(result);
                    transporter.sendMail({
                        to: email,
                        from: 'Registration@Rhino-Ware.com',
                        subject: 'Signup Succeeded',
                        html: `<h1>Congratulations on your account!</h1>
                                <p>Follow the link below to validate your email address. This link will only be valid for one hour.
                                <a href="https://rhino-ware-todolist-access.firebaseapp.com/validate/${token}">https://rhino-ware-todolist-access.firebaseapp.com/validate/${token}</a>`
                    });
                    return res.status(201).json({message: 'Successfully registered user.'});
                })
                .catch(err => {
                    throw new Error(err);
                });
        } else {
            return res.status(409).json({message: 'Email is already in use!'})
        }
    })
    .catch(err => {
        throw new Error(err);
    });
}

exports.postLogin = (req,res, next) => {
    User.findOne({email: req.body.email})
    .then(user => {
        if(!user){
            return res.status(401).json({message: 'Authentication failed.'});
        } else {
            if (bcrypt.compareSync(req.body.password, user.password)) {
                if (user.isValidated === false) {
                    return res.status(403).json({message: 'Please validate your email address. Follow the link provided in your signup email.'})
                }
                return res.status(202).json({
                    message: 'Login Success',
                    token: jwt.sign({email: user.email}, TOKEN_KEY, {expiresIn: '1h'}),
                    _id: user._id 
                });    
            } else {
                return res.status(401).json({message: 'Authentication failed.'});
            }
        }
    })
    .catch(err => {
        throw new Error(err);
    });
}

exports.postValidate = (req, res, next) => {
    const token = req.body.token;
    const email = req.body.email;
    User.findOne({email: email})
    .then(user => {
        if (!user) {
            return res.status(406).json({ message: 'Email not found.' });
        }
        jwt.verify(token, VALIDATE_KEY, response => {
            if (response) {
                console.log(response);
                return res.status(401).json({ message: 'Invalid token' });
            } else {
                if (!token === user.registrationToken) {
                    return res.status(401).json({message: 'Invalid token'});
                }
                user.isValidated = true;
                user.save()
                .then(result => {
                    return res.status(200).json({message: 'Validation succeeded, please login to continue.'});
                })
                .catch(err => {
                    throw new Error(err);
                })
            }
        })
    })
    .catch(err => {
        throw new Error(err);
    });
}

exports.postResetPassword = (req, res, next) => {
    const email = req.body.email;
    User.findOne({email: email})
    .then(user => {
        if (!user) {
            return res.status(406).json({message: 'A user with that e-mail does not exist.'});
        }
        const token = jwt.sign({email: email}, RESET_KEY, {expiresIn: '1h'});
        user.resetToken = token;
        user.save()
        .then(result => {
            transporter.sendMail({
                to: email,
                from: 'UserManager@Rhino-Ware.com',
                subject: 'Reset Password',
                html: `<h1>Password Reset</h1>
                                <p>Follow the link below to reset your password. This link will only be valid for one hour.
                                <a href="https://rhino-ware-todolist-access.firebaseapp.com/${token}">https://rhino-ware-todolist-access.firebaseapp.com/${token}</a>`
            });
            return res.status(200).json({message: 'Your token has been emailed.'});
        })
        .catch(err => {
            throw new Error(err);
        })
    })
    .catch(err => {
        throw new Error(err);
    });
}

exports.postVerifyResetToken = (req, res, next) => {
    const email = req.body.email;
    const token = req.body.token;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    User.findOne({email: email})
    .then(user => {
        if (!user) {
            return res.status(406).json({message: 'Email does not exist'});
        }
        jwt.verify(token, RESET_KEY, response => {
            if (response) {
                return res.status(401).json({ message: 'Invalid token' });
            }
        });
        if (!password === confirmPassword) {
            return res.status(406).json({message: 'Passwords do not match!'});
        }
        const hashed_password = bcrypt.hashSync(password, 12);
        user.password = hashed_password;
        user.resetToken = jwt.sign({email: email}, RESET_KEY, {expiresIn: '1s'});
        user.save()
        .then(result => {
           return res.status(200).json({message: 'Password reset, please login with your new password.'});
        })
        .catch(err => {
            throw new Error(err);
        });
    })
    .catch(err => {
        throw new Error(err);
    });
}