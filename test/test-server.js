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
      habits: [{title:faker.random.word()}],
      dailyLog:  [],
      userId: faker.random.word()
    };
    userData.push(newTestUser);
  }

  return User.insertMany(userData);
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
    it('should return one user', function(){
      User
        .findOne()
        .then(function(user){
          let userId=user.userId;
          return chai.request(app)
            .get(`users/${userId}`)
            .then(function(res){
              expect(res.body).to.include.keys('habits','dailyLog');
              expect(res.body).to.be.a('object');
              expect(res.body).to.be.json;
              expect(res).to.have.status(201)
            })})
    })
  })


  describe('Post Requests', function(){
    it('should create new user on post', function(){
     let newTestUser = {
      userId: 'fhthe5ehd',
      habits: [{title:'feed cat'}],
      dailyLog:[{date: "", log: []}]
    };
      return chai.request(app)
        .post('/users')
        .send(newTestUser)
        .then(function(res){
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('userId','dailyLog','habits')
          expect(res.body.habits).to.be.a('array');
          expect(res.body.dailyLog).to.be.a('array');
        })

    })

    it('should update user on post request', function(){
     let updateTestUser = {
      userId: 'fhthe5ehd',
      habits: [{title:'do laundry'}],
      dailyLog:[{date: "", log: []}]
    };
      return chai.request(app)
        .post('/users')
        .send(updateTestUser)
        .then(function(res){
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('userId','dailyLog','habits')
          expect(res.body.habits[0]).to.have.property('title','do laundry');
          expect(res.body.dailyLog).to.be.a('array');
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


