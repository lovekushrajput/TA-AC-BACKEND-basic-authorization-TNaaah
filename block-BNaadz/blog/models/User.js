let mongoose = require('mongoose')
let Schema = mongoose.Schema
let bcrypt = require('bcrypt')

let userSchema = Schema({
  name:{type: String,require: true} ,
    email: { type: String, require: true, unique: true },
    password: { type: String, minlength: 5, require: true },
    city: { type: String }
})

userSchema.pre('save', function (next) {
    if (this.password && this.isModified('password')) {
        bcrypt.hash(this.password, 10, (err, hashed) => {
            this.password = hashed
            return next()
        })
    } else {
        next()
    }
})

userSchema.methods.varifyPassword = function (password, cb) {
    bcrypt.compare(password, this.password, (err, result) => {
        return cb(err, result)
    })
}

userSchema.methods.fullName = function () {
    return this.firstName + this.lastName
}

module.exports = mongoose.model('User', userSchema)