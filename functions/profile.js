'use strict';

const user = require('../models/user');
const organization = require('../models/organization');

exports.getProfile = email => 

	new Promise((resolve,reject) => {

		user.find({ email: email }, 
			{ 
				name: 1,
				hashed_password: 0,
				created_at: 0,
				temp_password: 0,
				temp_password_time: 0,
				refresh_token: 0,
				token: 0,
				is_registered: 0,
				fb_registered: 0,
				fcm_token: 0
			})

		.then(users => {

			resolve(users[0]);

		})

		.catch(err => reject({ status: 500, message: 'Internal Server Error !' }))

	});


exports.editProfile = req => 

	new Promise((resolve,reject) => {

		user.find({ email: req.params.email })

		.then(users => {
		
			if (users.length == 0) {

				reject({ status: 404, message: 'User Not Found !' });

			} else {

				return users[0];

			}
		})

		.then(user => {

			 if (req.body.name && req.body.name.trim())
				user.name = req.body.name;

			return user.save();

		})

		.then(user => resolve({ status: 201, message: 'User Updated Sucessfully !' }))

		.catch(err => reject({ status: 500, message: 'Internal Server Error !' }));

	});