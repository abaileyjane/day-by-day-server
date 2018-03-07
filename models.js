const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = mongoose.Schema({
	firstName: {type:String, required: true},
	lastName: {type:String, required: true},
	email: {type:String, required: true, unique:true},
	password: {type:String, required: true},
	habits: [{title: String}],
	dailyRecord:[
		{date: String,
			 log:[
				{habit:String, completed: Boolean}
				]
		}
	]
	
});

userSchema.methods.serialize = function(){
	return{
		id: this._id,
		firstName: this.firstName,
		lastName: this.lastName,
		email: this.email,
	}
}

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};
 
userSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 1);
};


const User = mongoose.model('User', userSchema);

module.exports = {User}