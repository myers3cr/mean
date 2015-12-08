// Packages for User model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

// User schema
var UserSchema = new Schema({
  name: String,
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true, select: false }
});

// Hash the password before saving
UserSchema.pre('save', function(next) {
  var user = this;
    // hash the password if it has changed or is new
    if (!user.isModified('password')) return next();
    // generate the hash
    bcrypt.hash(user.password, null, null, function(err, hash){
      if(err) return next(err);
      // change the password to the hashed version
      user.password = hash;
      next();
    });
});

// Method to compare a given password to the database hash
UserSchema.methods.comparePassword = function(password) {
  var user = this;
  return bcrypt.compareSync(password, user.password);
};

// return the model
module.exports = mongoose.model("User", UserSchema);
