var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost/Database', { useNewUrlParser: true });

var db = mongoose.connection;

// User Schema
var UserSchema = mongoose.Schema({
	name: {
		type: String,
		index: true
	},
	nameAuthor: {
		type: String
	},
	username: {
		type: String
	},
	email: {
		type: String
	}
});

var Book = module.exports = mongoose.model('Book', UserSchema);






module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.getBookByname = function(name, callback){
	var query = {name: name};
	Book.findOne(query, callback);
}

module.exports.getBookByAuthorname = function(nameAuthor, callback){
	var query = {nameAuthor: nameAuthor};
	Book.findOne(query, callback);
}

module.exports.getBookByEmail = function(email, callback){
	var query = {email: email};
	Book.findOne(query, callback);
}


module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	callback(null, isMatch);
	});
}

module.exports.createUser = function(newBook, callback){
   			newBook.save(callback);
    
}