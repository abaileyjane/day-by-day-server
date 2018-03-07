const express = require("express");
const app = express();
const bodyParser=require('body-parser');
const jsonParser=bodyParser.json();
const formParser= bodyParser.urlencoded({extended: false});
const mongoose=require('mongoose');
const path = require('path');
const cors = require('cors');
const passport = require('passport')
mongoose.Promise=global.Promise;

app.use(jsonParser);
app.use(cors());

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

const {PORT, DATABASE_URL} = require('./config');

const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');

passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', { session: false });


const {User} = require('./models');

app.get('/', (req,res)=>{
	res.status(200)
})

app.get('/users',  (req, res) =>{
	User
		.find()
		.then(users => {
			res.json({
				users: users.map(
					(user)=>user.serialize())
			});
		})
		.then(res.status(201))
		.catch(err=>{
			console.error(err);
			res.status(500).json({message:"Internal Server Error"})
		})
})

app.get('/users/:userEmail', jwtAuth, (req,res) =>{
	User
	.findOne({email:req.params.userEmail})
	.then(user=>{
		res.json(user)
	})
	.then(res.status(201))
	.catch(err=>{
		console.error(err);
		res.status(500).json({message:'Internal Server Error'})
	});
})


app.post('/users', jsonParser, (req,res)=>{
	const requiredFields = ['email', 'password','firstName', 'lastName'];
  	const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  const stringFields = ['email', 'password', 'firstName', 'lastName'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }
  const explicityTrimmedFields = ['email', 'password'];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  let {email, password, firstName = '', lastName = ''} = req.body;
  firstName = firstName.trim();
  lastName = lastName.trim();

	return User
		.find({email})
		.count()
		.then(count => {
      		if (count > 0) {
        		return Promise.reject({
          			code: 422,
          			reason: 'ValidationError',
          			message: 'email already taken',
          			location: 'email'
        });
      }
      return User.hashPassword(password);
    })
		.then(hash=>{
			return User.create({
				firstName,
				lastName,
				email,
				password:hash
			})
			.then (user => res.status(201).json(user))
			.catch(err =>{
				console.log(err);
				res.status(500).json({message: 'Internal Server Error'})
			})
		})
	})


app.put('/users/:userEmail', jwtAuth, jsonParser, (req, res)=>{
	const toUpdate = {};
	const updatableFields = ['firstName', 'lastName', 'email', 'password', 'habits', 'dailyRecord'];

	updatableFields.forEach(field => {
		if(field in req.body){
			toUpdate[field] = req.body[field];
		}
	})

	User
		.findOne({email:req.params.userEmail})
		.update({$set: toUpdate})
		.then(user => res.status(204).json(user))
		.catch(err=> {
			console.log(err);
			res.status(500).json({message:"Internal Server Error"})})
})

app.delete('/users/:userEmail', (req, res)=>{
	User
		.findOne({email: req.params.userEmail})
		.remove()
		.then(user=>res.status(204).end())
		.catch(err=>{
			console.log(err);
			res.status(500).json({message: 'Internal Server Error'})})
})

function runServer(databaseUrl, port=PORT){
	return new Promise((resolve, reject)=>{
		mongoose.connect(databaseUrl, {useMongoClient: true}, err=>{
			if (err){
				return reject(err);
			}
			server=app.listen(port,()=>{
				console.log(`your app is listening on port ${port}`);
				resolve();
			})
			.on('error', err=>{
				mongoose.disconnect();
				reject(err);
			});
		});
	});
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };

