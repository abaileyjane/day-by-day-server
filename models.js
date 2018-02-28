const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
	firstName: {type:String, required: true},
	lastName: {type:String, required: true},
	email: {type:String, required: true},
	password: {type:String, required: true},
	habits: [{title: String}],
	dailyRecord:[
		{date: Date, log:[
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

const User = mongoose.model('User', userSchema);

module.exports = {User}