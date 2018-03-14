const express = require("express");
const app = express();
const bodyParser=require('body-parser');
const jsonParser=bodyParser.json();
const formParser= bodyParser.urlencoded({extended: false});
const mongoose=require('mongoose');
const path = require('path');
const cors = require('cors');
const config = require('./config');
var jwt = require('express-jwt');
var jwks = require('jwks-rsa');
mongoose.Promise=global.Promise;
 
const {PORT, DATABASE_URL,CLIENT_ORIGIN} = require('./config');

app.use(jsonParser);
app.use(cors({origin: CLIENT_ORIGIN}));

mongoose.connect(DATABASE_URL);

var jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: "https://day-by-day.auth0.com/.well-known/jwks.json"
    }),
    audience: 'https://day-by-day-api.herokuapp.com',
    issuer: "https://day-by-day.auth0.com/",
    algorithms: ['RS256']
});

// app.use(jwtCheck);

const {User} = require('./models');

app.get('/users/:userIdMeta',  (req, res) =>{

	console.log('get requestRan', req.params.userIdMeta)
	if(User.findOne({'userId': req.params.userIdMeta}).count()===0){
		res.json({habits:[],
				dailyLog:[]}
				)
		.then(res.status(201))
		.catch(err=>{
			console.error(err);
			res.status(500).json({message:"Internal Server Error"})
		})
	}
	else {User.findOne({'userId': req.params.userIdMeta})
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
}})



app.post('/users', jsonParser, (req, res)=>{
	if(User.findOne({'userId': req.body.userId}).count()===0){
		User
		.create({
			'userId': req.body.userId,
			'habits': req.body.habits,
			'dailyLog': req.body.dailyLog
		})
		.then(res.status(201))
		.catch(err=>{
			console.error(err);
			res.status(500).json({message:"Internal Server Error"})
		})
	}
	else{
	User
		.findOne({'userId': req.body.userId})
		.remove()
		.then( User
			.create({
				'userId': req.body.userId,
				'habits': req.body.habits,
				'dailyLog': req.body.dailyLog
			})
			.then(user=> res.status(201).json(user))
			.catch(err=>{
				console.error(err);
				res.status(500).json({message:"Internal Server Error"})
			}))
		.catch(err=> {
			console.log(err);
			res.status(500).json({message:"Internal Server Error"})})
	}
})

app.delete('/users/:userEmail', jwtCheck, (req, res)=>{
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

