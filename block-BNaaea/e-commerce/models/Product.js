let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let productSchema = new Schema({
    name: String,
    quantity: { type: Number, default: 0 },
    category: String,
    price: { type: Number },
    productImage: String,
    like: { type: Number, default: 0 }
})

module.exports = mongoose.model('Product', productSchema)