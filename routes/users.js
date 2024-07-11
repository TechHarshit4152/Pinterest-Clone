const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');
const { stringify } = require('uuid');
mongoose.connect('mongodb://127.0.0.1:27017/pinterestCopy');

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  email: String,
  bio: String,
  passowrd: String,
  profileImage: String,
  contact: Number,
  boards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board'
  }],
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
})


mongoose.plugin(plm)

module.exports = mongoose.model('User', userSchema)