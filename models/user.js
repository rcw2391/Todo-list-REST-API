const ToDoListItem = require('./todolistitem');

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    todoLists: [{
        date: {
                date: {
                    type: Number,
                    required: true
                },
                day: {
                    type: Number,
                    required: true
                },
                month: {
                    type: Number,
                    required: true
                },
                year: {
                    type: Number,
                    required: true
                }
            },
            items: [{
                item: {
                    type: String
                },
                completed: {
                    type: Boolean
                }
            }]
        }],
        registrationToken: {
            type: String,
            required: true
        },
        isValidated: {
            type: Boolean,
            required: true
        },
        resetToken: {
            type: String
        }
});

module.exports = mongoose.model('User', UserSchema);