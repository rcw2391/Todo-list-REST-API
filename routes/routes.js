const express = require('express')

const router = express.Router();

const toDoListController = require('../controllers/todoList');

const { body } = require('express-validator');

const isAuth = require('../middleware/is-auth');

router.get('/todo-list', isAuth, toDoListController.getToDoList);
router.post('/todo-list', isAuth, toDoListController.postNewToDoList);
router.post(
    '/signup',
    body('email', 'Must be a valid email address').isEmail().normalizeEmail().trim(),
    body('password', 'Must be a valid password.').isLength({min: 6, max: 18}).isAlphanumeric(),
    body('confirmPassword', 'Must be a valid password.').isLength({ min: 6, max: 18 }).isAlphanumeric(),
    toDoListController.postSignUp
);
router.post(
    '/login',
    body('email', 'Must be a valid email address').isEmail().normalizeEmail().trim(),
    body('password', 'Must be a valid password.').isLength({ min: 6, max: 18 }).isAlphanumeric(), 
    toDoListController.postLogin
);
router.post(
    '/resetpassword',
    body('email', 'Must be a valid email address').isEmail().normalizeEmail().trim(),
    toDoListController.postResetPassword
);
router.post(
    '/verifypasswordtoken',
    body('email', 'Must be a valid email address').isEmail().normalizeEmail().trim(),
    body('password', 'Must be a valid password.').isLength({ min: 6, max: 18 }).isAlphanumeric(),
    body('confirmPassword', 'Must be a valid password.').isLength({ min: 6, max: 18 }).isAlphanumeric(),
    toDoListController.postVerifyResetToken
);
router.post(
    '/validate',
    body('email', 'Must be a valid email address').isEmail().normalizeEmail().trim(),
    toDoListController.postValidate
);


module.exports = router;