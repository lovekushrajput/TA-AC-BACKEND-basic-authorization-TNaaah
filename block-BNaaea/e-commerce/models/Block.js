let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let blockSchema = new Schema({
    user: [{ type: Schema.Types.ObjectId, ref: 'User' }]
})

module.exports = mongoose.model('Block', blockSchema)