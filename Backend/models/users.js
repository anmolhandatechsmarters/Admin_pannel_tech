const mongoose = require('mongoose');

// Define the User schema
const UserSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    emp_id: {
        type: String,
        unique: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    street1: {
        type: String,
        required: true
    },
    street2: {
        type: String
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    role: {
        type: Number,
        ref: Role,
    },
    status: {
        type: String,
        enum: ['0', '1'],
        default: '0'
    },
    last_login: {
        type: Date,
        required: true
    },
    user_agent: {
        type: String,
        required: true
    },
    ip: {
        type: String,
        required: true
    },
    created_on: {
        type: Date
    },
    update_on: {
        type: Date
    },
    create_by: {
        type: String
    }
}, { timestamps: { createdAt: 'created_on', updatedAt: 'updated_on' } });



UserSchema.pre()




// Create the User model
const UserModel = mongoose.model('User', UserSchema);




module.exports = UserModel;
