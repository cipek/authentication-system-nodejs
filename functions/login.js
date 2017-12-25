'use strict';

const user = require('../models/user');
const bcrypt = require('bcryptjs');

exports.loginUser = (email, password, fcm_token) => 

	new Promise((resolve,reject) => {

		user.find({ email: email })

		.then(users => {

			if (users.length == 0) {

				reject({ status: 404, message: 'User Not Found !' });

			} else {

				return users[0];

			}
		})

		.then(user => {

			const hashed_password = user.hashed_password;

			if (bcrypt.compareSync(password, hashed_password)) {

				resolve({ status: 200, message: email, refresh_token: user.refresh_token });

			} else {

				reject({ status: 401, message: 'Wrong Password !'});
			}
		})

		.catch(err => reject({ status: 500, message: 'Internal Server Error !' }));

	});

exports.reloginUser = email => 

	new Promise((resolve,reject) => {

		user.find({ email: email }, { refresh_token: 1})

		.then(users => resolve(users[0]))

		.catch(err => reject({ status: 500, message: 'Internal Server Error !' }))

	});