const mongoose = require('mongoose')

const boardSchema = mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    boardName: String,
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        }
    ]
})

boardSchema.index({ user: 1, post: 1 }, { unique: false })


module.exports = mongoose.model('Board', boardSchema)