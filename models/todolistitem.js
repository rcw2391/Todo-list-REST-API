const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ToDoListSchema = new Schema({
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
    items: [
            {
            item: {
                type: String
            },
            completed: {
                type: Boolean
            }
        }
    ]    
});

module.exports = mongoose.model('ToDoList', ToDoListSchema);