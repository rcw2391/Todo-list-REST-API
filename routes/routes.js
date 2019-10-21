const express = require('express')

const router = express.Router();

const toDoListController = require('../controllers/todoList');

const { body } = require('express-validator');

const isAuth = require('../middleware/is-auth');

// GET todo-list route
router.get('/todo-list', isAuth, toDoListController.getToDoList);
// POST todo-list route
router.post('/todo-list', isAuth, toDoListController.postNewToDoList);\
// POST signup route
router.post(
    '/signup',
    body('email', 'Must be a valid email address').isEmail().normalizeEmail().trim(),
    body('password', 'Must be a valid password.').isLength({min: 6, max: 18}).isAlphanumeric(),
    body('confirmPassword', 'Must be a valid password.').isLength({ min: 6, max: 18 }).isAlphanumeric(),
    toDoListController.postSignUp
);
// POST login route
router.post(
    '/login',
    body('email', 'Must be a valid email address').isEmail().normalizeEmail().trim(),
    body('password', 'Must be a valid password.').isLength({ min: 6, max: 18 }).isAlphanumeric(), 
    toDoListController.postLogin
);
// POST reset password route
router.post(
    '/resetpassword',
    body('email', 'Must be a valid email address').isEmail().normalizeEmail().trim(),
    toDoListController.postResetPassword
);
// POST verify password token route
router.post(
    '/verifypasswordtoken',
    body('email', 'Must be a valid email address').isEmail().normalizeEmail().trim(),
    body('password', 'Must be a valid password.').isLength({ min: 6, max: 18 }).isAlphanumeric(),
    body('confirmPassword', 'Must be a valid password.').isLength({ min: 6, max: 18 }).isAlphanumeric(),
    toDoListController.postVerifyResetToken
);
// POST validate e-mail route
router.post(
    '/validate',
    body('email', 'Must be a valid email address').isEmail().normalizeEmail().trim(),
    toDoListController.postValidate
);


module.exports = router;