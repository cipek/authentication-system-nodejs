'use strict';

const user = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config.json');

exports.checkTokens = req => 

	new Promise((resolve,reject) => {

		const token = req.headers['x-access-token'];

		const refreshToken = req.headers['refresh-token'];

		const email = req.headers['email'];

		if (token) {

			try {
				
  				var decoded = jwt.verify(token, config.secret);

  				if(decoded.message === email){

  					resolve({ status: 200, message: "Correct token"});
  				}
  				//if access token is not valid any more
  				else{
  					//Get refresh token from DB
  					user.find({ email: email }, { refresh_token: 1})

						.then(users => {

						if (users.length == 0) {

							reject({ status: 404, message: 'User Not Found !' });

						} else {
							//if refresh token is valid
							if(user[0].refresh_token === refreshToken){

								resolve({ status: 203, message: email });

							}
							//If not, user probably has changed the password, so the new refresh token has been generated
							else{

								reject({ status: 403, message: 'Wrong refresh token' })
							}

						}
					})

					.catch(err => reject({ status: 404, message: 'User Not Found !' }));

  				}

  			//if access token is not valid any more
			} catch(err) {
  				//Get refresh token from DB
				user.find({ email: email }, { refresh_token: 1})

					.then(users => {

						if (users.length == 0) {

							reject({ status: 404, message: 'User Not Found !' });

						} else {

							if(users[0].refresh_token === refreshToken){

								resolve({ status: 203, message: email });

							}
							else{

								reject({ status: 403, message: 'Wrong refresh token' });		

							}

						}
					})

					catch(err => reject({ status: 404, message: 'User Not Found !' }));
			}

		} else {
			
			reject({ status: 405, message: 'Invalid Credentials !'});
				
		}

	});
