let mongoose = require('mongoose')
let Schema = mongoose.Schema

let commentSchema = new Schema({
    title: String,
    like: { type: Number, default: 0 },
    articleId: { type: Schema.Types.ObjectId, ref: 'Article' },
})

module.exports = mongoose.model('Comment', commentSchema)