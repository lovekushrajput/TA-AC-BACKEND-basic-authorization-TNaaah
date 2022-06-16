let mongoose = require('mongoose')
let Schema = mongoose.Schema

let podcastSchema = new Schema({
    audio: String,
    cover_image: String,
    description: String,
    author: String,
    category: { type: String }
})

module.exports = mongoose.model('Podcast', podcastSchema)