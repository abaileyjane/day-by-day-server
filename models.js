const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');


const userSchema = mongoose.Schema({
	userId: String,
	habits: [{title: String}],
	dailyLog:[
		{date: String,
			 log:[
				{habit:String, complete: Boolean}
				]
		}
	]
	
});

userSchema.methods.serialize = function(){
	return{
		habits: this.habits,
		dailyLog: this.dailyLog,

	}
}


const User = mongoose.model('User', userSchema);

module.exports = {User}