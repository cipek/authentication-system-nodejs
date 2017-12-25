'use strict';

const user = require('../models/user');
const bcrypt = require('bcryptjs');
const randomstring = require("randomstring");

exports.registerUser = req => 

	new Promise((resolve,reject) => {

	    const salt = bcrypt.genSaltSync(10);
		const hash = bcrypt.hashSync(req.body.password, salt);
		const refreshToken = randomstring.generate();

		const newUser = new user({
			name: req.body.name,
			email: req.body.email,
			hashed_password: hash,
			created_at: new Date(),
			refresh_token: refreshToken
		});
		newUser.save()

		.then(() => resolve({ status: 201, message: 'User Registered Sucessfully !'}))


		.catch(err => {
			if (err.code == 11000) {

				reject({ status: 409, message: 'User Already Registered !' });

			} else {

				reject({ status: 500, message: 'Internal Server Error !' });
			}
		});
	});


exports.checkEmail = email => 

	new Promise((resolve,reject) => {

		user.find({ email: email }, { email: 1})

		.then(users => {

			if (users.length == 0) {

				resolve({ status: 200, message: 'User not registered yet', isAvailable: true });

			} else {

				resolve({ status: 201, message: 'User already registered !', isAvailable: false });

			}
		})

		.catch(err => reject({ status: 500, message: 'Internal Server Error !' }))

	});