var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './uploads'});
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');

var User = require('../models/user');
var Book = require('../models/book');

/* GET users listing. */
router.get('/index', function(req, res, next) {
  res.render('/index',{title:'/Homepage'}, { username: req.user.username });
});

router.get('/register', function(req, res, next) {
  res.render('register',{title:'Register'});
});

router.get('/login', function(req, res, next) {
  res.render('login', {title:'Login'});
});



router.get('/addBook', function(req, res, next) {
  res.render('addBook');
});



router.get('/searchBook', function(req, res, next) {
  res.render('searchBook');
});


router.get('/deleteBook', function(req, res, next) {
  res.render('deleteBook');
});

router.get('/chat', function(req, res, next) {
  res.render('chat');
});





router.post('/login',
  passport.authenticate('local',{failureRedirect:'/users/login', failureFlash: 'Invalid username or password'}),
  function(req, res) {
   req.flash('success', 'You are now logged in');
   res.redirect('/');
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(username, password, done){
  User.getUserByUsername(username, function(err, user){
    if(err) throw err;
    if(!user){
      return done(null, false, {message: 'Unknown User'});
    }

    User.comparePassword(password, user.password, function(err, isMatch){
      if(err) return done(err);
      if(isMatch){
        return done(null, user);
      } else {
        return done(null, false, {message:'Invalid Password'});
      }
    });
  });
}));

router.post('/addBook', upload.single(),
  function(req, res, next) {
	  
	var name = req.body.name;
	var nameAuthor = req.body.nameAuthor;
	var username = req.body.username;
	var email = req.body.email;
	
	
	
	
	req.checkBody('name','Name field is required').notEmpty();
	req.checkBody('nameAuthor','Author field is required').notEmpty();
	req.checkBody('username','Username field is required').notEmpty();
	req.checkBody('email','Email feild is required valid').notEmpty();
	req.checkBody('email','Email is not valid').isEmail();
	
	
	var errors = req.validationErrors();
	
	 if(errors){
  	res.render('addBook', {
  		errors: errors
  	});
  } 
  
  else{
	
  	var newBook = new Book({
      name: name,
      nameAuthor: nameAuthor,
      username: username,
      email: email,
      
    });

    Book.createUser(newBook, function(err, book){
      if(err) throw err;
      
    });

    req.flash('success', 'The book has been registered');

    res.location('/users/addBook');
	res.redirect('/users/addBook');
	
  }
   
});



router.post('/searchBook', upload.single(),
  function(req, res, next) {
	  
	var name = req.body.name;
	var nameAuthor = req.body.nameAuthor;
	
	
	
	req.checkBody('name','Name field is required').notEmpty();
	req.checkBody('nameAuthor','Author field is required').notEmpty();
	
	
	var errors = req.validationErrors();
	
	 if(errors){
  	res.render('searchBook', {
  		errors: errors
  	});
  } 
	else{
	
	Book.getBookByname(name, function(err, book){
    if(err) throw err;
    
	if(!book){
		
		req.flash('error', 'Sorry! We do not have such a book in our database yet');
		res.redirect('/users/searchBook');
    
	} else{
		var email = book.email;
		req.flash('success', 'Successfully found! Contact: ' + email);
		
		res.redirect('/users/searchBook');
	}
	
	});
	
	}
	
  });



//Delete a Book Functionality

router.post('/deleteBook', upload.single(),
  function(req, res, next) {
	  
	var name = req.body.name;
	var email = req.body.email;
	
		
	req.checkBody('name','Name field is required').notEmpty();
	req.checkBody('email','Email feild is required valid').notEmpty();
	req.checkBody('email','Email is not valid').isEmail();
	
	
	var errors = req.validationErrors();
	
	if(errors){
  	res.render('deleteBook', {
  		errors: errors
  	});
  }
  
  
	else{
		
		Book.getBookByname(name, function(err, book){
		
    
		if(!book){
		
		req.flash('error', 'Sorry! We do not have such a book with that [NAME] in our database yet');
		res.redirect('/users/deleteBook');
	
	}
		else{
			
			
			Book.getBookByEmail(email, function(err, book){
		
    
			if(!book){
		
				req.flash('error', 'Sorry! We do not have such a book with that [EMAIL] in our database yet');
				res.redirect('/users/deleteBook');
			
			}
			
			
			
			else{
				
				
				//Deelete that book
				
				
				var MongoClient = require('mongodb').MongoClient;
				var url = "mongodb://localhost/Database";

			MongoClient.connect(url, function(err, db) {
			if (err) throw err;
			var dbo = db.db("Database");
			var myquery = { name:name, email:email };
			dbo.collection("books").deleteOne(myquery, function(err, obj) {
			if (err) throw err;
    
			});
				});
			req.flash('success', 'Successfully deleted');
			res.redirect('/users/deleteBook');
				
				
				
			}
			
			
			});	
		}	
	});
	}

  });



router.post('/register', upload.single('profileimage') ,function(req, res, next) {
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;


  if(req.file){
  	console.log('Uploading File...');
  	var profileimage = req.file.filename;
  } else {
  	console.log('No File Uploaded...');
  	var profileimage = 'noimage.jpg';
  }

  // Form Validator
  req.checkBody('name','Name field is required').notEmpty();
  req.checkBody('email','Email field is required').notEmpty();
  req.checkBody('email','Email is not valid').isEmail();
  req.checkBody('username','Username field is required').notEmpty();
  req.checkBody('password','Password field is required').notEmpty();
  req.checkBody('password2','Passwords do not match').equals(req.body.password);

  // Check Errors
  var errors = req.validationErrors();

  if(errors){
  	res.render('register', {
  		errors: errors
  	});
  } else{
  	var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      profileimage: profileimage
    });

    User.createUser(newUser, function(err, user){
      if(err) throw err;
      
    });

    req.flash('success', 'You are now registered and can login');

    res.location('/');
    res.redirect('/');
  }
});

router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are now logged out');
  res.redirect('/users/login');
});

module.exports = router;
