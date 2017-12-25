'use strict';

const config = require('../config/config.json');

const mongoose = require('mongoose');
const organization = require('../models/organization');

const Schema = mongoose.Schema;

const userSchema = mongoose.Schema({ 

	name: String,
	email: String, 
	hashed_password: String,
	created_at: String,
	temp_password: String,
	temp_password_time: String,
	refresh_token: String

});

mongoose.Promise = global.Promise;
mongoose.connect(config.db);
module.exports = mongoose.model('user', userSchema);