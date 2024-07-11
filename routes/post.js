const mongoose = require('mongoose');
const { stringify } = require('uuid');

const postSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  Comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  Title: String,
  description: String,
  image: String,
})

postSchema.index({ user: 1, post: 1 }, { unique: false })



module.exports = mongoose.model('Post', postSchema)