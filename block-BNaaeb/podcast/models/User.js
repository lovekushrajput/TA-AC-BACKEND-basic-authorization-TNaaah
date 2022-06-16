let mongoose = require('mongoose');
let Schema = mongoose.Schema
let bcrypt = require('bcrypt')

let userSchema = new Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    city: { type: String },
    password: { type: String, minlength: 5, required: true },
    isAdmin: { type: Boolean, default: false },
    subcription: { type: String, default: 'free' }
})

userSchema.pre('save', function (next) {
    let adminEmail = [
        'lovekushrazput143@gmail.com'
    ]

    //checking Admin
    if (adminEmail.includes(this.email)) {
        this.isAdmin = true
    }

    //hashing password
    if (this.password && this.isModified('password')) {
        bcrypt.hash(this.password, 10, (err, hashed) => {
            if (err) return next(err)
            this.password = hashed
            return next()
        })
    }
    else {
        return next()
    }

})

//varifying the password
userSchema.methods.varifyPassword = function (password, cb) {
    bcrypt.compare(password, this.password, (err, result) => {
        return cb(err, result)
    })
}

module.exports = mongoose.model('User', userSchema)