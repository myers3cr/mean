var express = require('express'),
    app = express(),
    path = require('path');

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
})

var adminRouter = express.Router();

adminRouter.use(function(req, res, next) {
  console.log(req.method, req.url);
  next();
});

adminRouter.param('name', function(req, res, next, name) {
  console.log('Validating ' + name);
  req.name = name;
  next();
});

adminRouter.get('/users/:name', function(req, res) {
  res.send('Hello ' + req.name + '!')
});

adminRouter.get('/', function(req, res) {
  res.send('This is the dashboard!');
});

adminRouter.get('/users', function(req, res) {
  res.send('This page displays the users!');
});

adminRouter.get('/posts', function(req, res) {
  res.send('This page displays the posts!');
});

app.use('/admin', adminRouter);

app.route('/login')
  .get(function(req, res) {
    res.send('This is the login form!');
  })
  .post(function(req, res) {
    console.log('Processing Login');
    res.send('Processing the Login Form');
  });

app.listen(3000);

console.log('Visit me at http://localhost:3000');
