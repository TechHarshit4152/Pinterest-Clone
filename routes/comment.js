const mongoose = require('mongoose')

const CommentSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    post : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    Comment: String,
    
})

CommentSchema.index({ user: 1, post: 1 }, { unique: false })

module.exports = mongoose.model('Comment', CommentSchema)