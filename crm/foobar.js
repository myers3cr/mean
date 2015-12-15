// CR's version that doesn't work
// Call the packages
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var User = require('./app/models/user');
var port = process.env.PORT || 8080;
var superSecret = "MohawkLetterpress12047"

// connect to the database
mongoose.connect('mongodb://localhost:27017/crm');

// App Configuration

// Use body parser to grab information from POST requests
app.use(bodyParser.urlencoded( { extended: true} ));
app.use(bodyParser.json());

// Configure app to handles CORS request
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
  next();
});

// Log all requests to the console
app.use(morgan('dev'));

// Routing Configuration

// Basic route for the home page
app.get('/', function(req, res) {
  res.send('Welcome to the home page!');
});

// Create an instance ot the express router
var apiRouter = express.Router();

// Route for authenticating users
apiRouter.post('/authenticate', function(req, res) {
  User.findOne( {username: req.body.username} )
      .select('name username password').exec(function(err, user) {
        
        if (err) throw err;
        
        // No user found
        if (!user) {
          res.json({
            success: false,
            message: 'Authentication failed. User not found.'
          });
        } else if (user) {
          // Check to see if password matches
          var validPassword = user.comparePassword(req.body.password);
          if (!validPassword) {
            res.json({ 
              success: false, 
              message: 'Authentication failed. Wrong password.' 
            });
          } else {
            // If user is found and password is corect
            // create a token
            var token = jwt.sign({
              name: user.name,
              username: user.username
            }, superSecret, {
              expiresInMinutes: 1440
            });
            res.json({
              success: true,
              message: 'Token provided.',
              token: token
            });
          }
      }
    });      
});

// Middleware for all API requests
apiRouter.use(function(req, res, next) {
  // Logging
  console.log('Somebody came to the API.');
  // Authentication (will come later)

  next(); //go to the next routes
});

// Test route to make sure things are working
// Accessed at GET http://localhost:8080/api
apiRouter.get('/', function(req, res) {
  res.json({ message: 'Welcome to our API!' });
});

// Routes for /api/users
apiRouter.route('/users')
  //create a user with a POST
  .post(function(req, res) {
    // Create a new instance of the model
    var user = new User();
    // Add the information from the request
    user.name = req.body.name;
    user.username = req.body.username;
    user.password = req.body.username;
    // Save the user and check for errors
    user.save(function(err) {
      if(err) {
        // Duplicate entry
        if(err.code == 11000)
          return res.json( {success: false, message: 'User with than name already exists.'} );
        else
          return res.send(err);
      }
      res.json( {message: 'User created.'});
    });
  })
  .get(function(req, res) {
    User.find(function(err, users) {
      if(err) res.send(err);
      // return the users
      res.json(users);
    });
  });

// Add routes for /api/users/:user_id
apiRouter.route('/users/:user_id')
  // Get a single user by user_id
  .get(function(req, res) {
    User.findById(req.params.user_id, function(err, user) {
      if(err) res.send(err);
      // return requested user
      res.json(user);
    });
  })
  // Update the user's information
  .put(function(req, res) {
    // Get the requested user
    User.findById(req.params.user_id, function(err, user) {
      if(err) res.send(err);
      // Update the user with the data passed in
      if(req.body.name) user.name = req.body.name;
      if(req.body.username) user.username = req.body.username;
      if(req.body.password) user.password = req.body.password;
      // Save the user
      user.save(function(err) {
        if(err) res.send(err);
        // Success, return message
        res.json( {message: 'User updated.'} );
      });
    });
  })
  // Delete the user
  .delete(function(req, res) {
    User.remove({ _id: req.params.user_id}, function(err, user) {
      if(err) return res.send(err);
      // Success
      res.json( {message: 'Successfully deleted.'} );
    });
  });

// Register the routes
app.use('/api', apiRouter);

// Start the server & write log message
app.listen(port);
console.log('Server started on port ' + port);
