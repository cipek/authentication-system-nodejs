'use strict';

const auth = require('basic-auth');
const jwt = require('jsonwebtoken');

const backPath = './';
const config = require(backPath + 'config/config.json');
const user = require(backPath + 'models/user');

const register = require(backPath + 'functions/register');
const login = require(backPath + 'functions/login');
const profile = require(backPath + 'functions/profile');
const password = require(backPath + 'functions/password');
const checkingTokens = require(backPath + 'functions/checkTokens');

module.exports = router => {

	//for non path
	router.get('/', (req, res) => res.end('Works!'));

	//user login operation
	router.post('/users/login', (req, res) => {

		const credentials = auth(req);

		if (!credentials) {

			res.status(400).json({ message: 'Invalid Request !' });

		} else {

			login.loginUser(credentials.name, credentials.pass, req.body.fcm_token)

			.then(result => {

				const token = jwt.sign(result, config.secret, { expiresIn: 20 });
				res.status(result.status).json({ message: result.message, token: token, refresh_token: result.refresh_token });

			})

			.catch(err => res.status(err.status).json({ message: err.message }));
		}
	});

	//relogin
	router.post('/users/relogin', (req, res) => {

		var ob = JSON.stringify(req.body);

		checkingTokens.checkTokens(req)

			.then(result => {

				let response = { message: result.message};

				response = createResponse(result, response);

				res.status(result.status).json(response);
			})

			.catch(err => res.status(err.status).json({ message: err.message }));

	});

	//add a new user 
	router.post('/users/signup', (req, res) => {

		const name = req.body.name;
		const email = req.body.email;
		const password = req.body.password;

		if (!name || !email || !password || !name.trim() || !email.trim() || !password.trim()) {

			res.status(400).json({message: 'Invalid Request !'});

		} else {

			register.registerUser(req)

			.then(result => {

				res.setHeader('Location', '/users/'+email);
				res.status(result.status).json({ message: result.message})
			})

			.catch(err => res.status(err.status).json({ message: err.message }));
		}
	});

	//get the user profile details
	router.get('/users/:email', (req,res) => {

		checkingTokens.checkTokens(req)

			.then(result => {

				profile.getProfile(req.params.email)

				.then(result1 =>{ 

					result1 = createResponse(result, result1);

					res.status(result.status).json(result1);
				})

				.catch(err1 => res.status(err1.status).json({ message: err1.message }));
	
			})

			.catch(err => res.status(err.status).json({ message: err.message }));

	});

	//editer user profile details
	router.post('/users/edit/:email', (req,res) => {

		checkingTokens.checkTokens(req)

			.then(result => {

				profile.editProfile(req)

				.then(result1 =>{ 

					result1 = createResponse(result, result1);

					res.status(result.status).json(result1);
				})

				.catch(err1 => res.status(err1.status).json({ message: err1.message }));
	
			})

			.catch(err => res.status(err.status).json({ message: err.message }));

	});

	//change the password
	router.put('/users/:email', (req,res) => {

		checkingTokens.checkTokens(req)

			.then(result => {

				const oldPassword = req.body.password;
				const newPassword = req.body.newPassword;

				if (!oldPassword || !newPassword || !oldPassword.trim() || !newPassword.trim()) {

					res.status(400).json({ message: 'Invalid Request !' });

				} else {

					password.changePassword(req.params.email, oldPassword, newPassword)

					.then(result1 =>{

						let response = { message: result1.message, refresh_token: result1.refresh_token};

						response = createResponse(result, response);

						res.status(result.status).json(response);

					})

					.catch(err1 => res.status(err1.status).json({ message: err1.message }));

				}

			})

			.catch(err => res.status(err.status).json({ message: err.message }));

	});

	//reset password
	router.post('/users/:email/password', (req,res) => {

		const email = req.params.email;
		const token = req.body.token;
		const newPassword = req.body.password;

		if (!token || !newPassword || !token.trim() || !newPassword.trim()) {

			password.resetPasswordInit(email)

			.then(result => res.status(result.status).json({ message: result.message }))

			.catch(err => res.status(err.status).json({ message: err.message }));

		} else {

			password.resetPasswordFinish(email, token, newPassword)

			.then(result => res.status(result.status).json({ message: result.message }))

			.catch(err => res.status(err.status).json({ message: err.message }));
		}
	});

	//Checks if emial is already used
	router.post('/users/checkEmail/:email', (req,res) => {

		register.checkEmail(req.params.email)

			.then(result => {

				res.status(result.status).json({ message: result.message, isAvailable: result.isAvailable })
			})

			.catch(err => res.status(err.status).json({ message: err.message}));

	});	

	//Generates new access token if needed
	function createResponse(result, response){
		//203 means that new access token has been generated
		if(result.status == 203){
			response.token = jwt.sign(result, config.secret, { expiresIn: 20 });
			return response;
		}
		else
			return response;

	}

}