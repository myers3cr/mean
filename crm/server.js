// Call the packages
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var port = process.env.PORT || 8080;
var User = require('./app/models/user');

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

// More API routes go here

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

// Register the routes
app.use('/api', apiRouter);

// Start the server & write log message
app.listen(port);
console.log('Server started on port ' + port);
