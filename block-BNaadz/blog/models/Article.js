let mongoose = require('mongoose')
let Schema = mongoose.Schema
let slug = require('slug')

let articleSchema = new Schema({
    title: { type: String },
    description: { type: String },
    tags : [{type:String}],
    likes: { type: Number, default: 0 },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    comment: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
})

articleSchema.pre('save', function (next) {
    this.slug = slug(this.title, '-')
    return next()
})



module.exports = mongoose.model('Article', articleSchema)