const express = require("express");
const app = express();
const bodyParser=require('body-parser');
const jsonParser=bodyParser.json();
const formParser= bodyParser.urlencoded({extended: false});
const mongoose=require('mongoose');
const path = require('path');
const cors = require('cors');
mongoose.Promise=global.Promise;

app.use(jsonParser);
app.use(cors());

const {PORT, DATABASE_URL} = require('./config');

const {User} = require('./models');

app.get('/users', (req, res) =>{
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

app.get('/users/:userEmail', (req,res) =>{
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
	User
		.create({
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
			password: req.body.password
		})
		.then (user => res.status(201).json(user))
		.catch(err =>{
			console.log(err);
			res.status(500).json({message: 'Internal Server Error'})
		})
})

app.put('/users/:userEmail', jsonParser, (req, res)=>{
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

