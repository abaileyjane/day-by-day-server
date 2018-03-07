const chai = require('chai');
const mocha = require('mocha');
const chaiHttp=require('chai-http');
const mongoose = require('mongoose');
const faker = require('faker');

const expect = chai.expect;
const Assertion=chai.Assertion;

chai.use(chaiHttp);

const{User}=require('../models');
const{runServer, closeServer, server, app}=require('../server');
const{TEST_DATABASE_URL, TEST_PORT}=require('../config');



function tearDownDb(){
  console.warn('Deleting Database');
  return mongoose.connection.dropDatabase();
}

function seedUserData(){
  let userData=[];
  for (let i=0; i<5; i++){
    let newTestUser = {
      firstName: faker.Name.firstName(),
      LastName: faker.Name.firstName(),
      email: faker.Internet.email(),
      password: faker.random.word()
    };
    userData.push(newTestUser);
  }

  return User.insertMany(charData);
}

describe('API Function', function(){
	before (function(){
    return runServer(TEST_DATABASE_URL, TEST_PORT);
  })
  after(function(){
		return closeServer();
	})
  beforeEach(function(){
    return seedUserData()
  })

  afterEach(function(){
    return tearDownDb();
  })

  describe("get requests", function(){

    it('should return a status of 200 on user get request', function(){
      return chai.request(app)
      .get('/users')
      .then(function(res){
        expect(res).to.have.status(200);
      })
    })

    it('should return list of users', function(){
      return chai.request(app)
      .get('/users')
       .then(function(res){
        expect(res.body.users[0]).to.be.a('object');
        expect(res.body.users[0].firstName).to.have.lengthOf.at.least(1);
        expect(res.body.users[0].lastName).to.have.lengthOf.at.least(1);
        expect(res.body.users[0].email).to.have.lengthOf.at.least(1);
        expect(res.body.users[0]).to.include.keys('firstName','lastName','email');
        })
        expect(res).to.have.status(201)
      })
    it('should return one user', function(){
      User
        .findOne
        .then(function(user){
          let email=user.email;
          return chai.request(app)
            .get(`users/${email}`)
            .then(function(res){
              expect(res.body).to.include.keys('firstName','lastName','email','habits','dailyLog');
              expect(res.body).to.be.a('object');
              expect(res.body).to.be.json;
              expect(res).to.have.status(201)
            })})
    })
  })


  describe('Post Requests', function(){
    it('should create new user on post', function(){
     let newTestUser = {
      firstName: faker.Name.firstName(),
      LastName: faker.Name.firstName(),
      email: faker.Internet.email(),
      password: faker.random.word()
    };
      return chai.request(app)
        .post('/users')
        .send(newTestUser)
        .then(function(res){
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('firstName','lastName','email','habits','dailyLog')
          expect(res.body.firstName).to.equal(newTestUser.firstName);
          expect(res.body.lastName).to.equal(newTestUser.lastName);
          expect(res.body.email).to.equal(newTestUser.email);
          expect(res.body.password).to.equal(newTestUser.password);

        })

    })
  })

  describe('Put requests', function(){
    it('should update user', function(){
      const updatedUser = {
        habits:[{title: "feed Cat"}]
      }
      return User
        .findOne()
        .then(function(user){
          updatedUser.email=user.email;
          return chai.request(app)
          .put(`/users/${updatedUser.email}`)
          .send(updatedUser);
        })
        .then(function(res){
          expect(res).to.have.status(204);
          return User.findOne({email: `updatedUser.email`});
        })
        .then(function(user){
          expect(user.habits).to.have.lengthOf(1);
          expect(user.dailyLog).to.have.lengthOf(0);
          expect(user).to.include.keys('firstName','lastName','email','habits','dailyLog')
        })
    })
  })

  describe('delete endpoint', function(){
    it('should delete user', function(){
      return User
      .findOne()
      .then(function(user){
        let userToDeleteEmail = user.email;
        return chai.request(app)
        .delete(`/users/${userToDeleteEmail}`)
        .then(function(res){
          expect(res).to.have.status(204)
        })
      })
    })
  })
	})


