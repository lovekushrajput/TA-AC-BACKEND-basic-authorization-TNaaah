var express = require('express');
var router = express.Router();
var multer = require('multer');
var Product = require('../models/Product')
var User = require('../models/User')
var fs = require('fs')
var auth = require('../middlewares/auth')
var Block = require('../models/Block')

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

let upload = multer({ storage: storage })


// // authorization
router.use(auth.loggedInUser)

//userinfo
router.get('/userInfo', (req, res, next) => {
    User.find({}, (err, users) => {
        if (err) console.log(err)
        res.render('userInfo', { users })
    })
})

//products list
router.get('/', (req, res, next) => {
    User.find({}, (err, users) => {
        if (err) return next(err)
        Product.find({}, (err, products) => {
            if (err) return next(err)
            Product.distinct('category', (err, categories) => {
                if (err) return next(err)
                res.render('productList', { products, users, categories })
            })
        })
    })

})

//add product
router.get('/product', (req, res) => {
    res.render('productForm')
})

//capture the product
router.post('/product', upload.single('productImage'), (req, res, next) => {
    if (req.file) {
        req.body.productImage = req.file.filename
    }
    Product.create(req.body, (err, product) => {
        if (err) return next(err)
        res.redirect('/admin')
    })
})


//Edit product 
router.get('/product/:id/edit', (req, res, next) => {
    let id = req.params.id
    Product.findById(id, (err, product) => {
        if (err) return next(err)
        res.render('productEdit', { product })
    })
})


// capture the data
router.post('/product/:id/edit', upload.single('productImage'), (req, res, next) => {
    let id = req.params.id
    let newImage = ''
    if (req.file) {
        newImage = req.file.filename
        try {
            //delete the old image
            fs.unlinkSync('./public/images/' + req.body.productImage)
        } catch (error) {
            console.log(error)
        }
    } else {
        newImage = req.body.productImage
    }
    req.body.productImage = newImage
    Product.findByIdAndUpdate(id, req.body, (err, product) => {
        if (err) return next(err)
        res.redirect('/admin')
    })
})


//delete the product
router.get('/product/:id/delete', (req, res) => {
    let id = req.params.id
    Product.findByIdAndDelete(id, (err, product) => {
        if (err) return next(err)
        if (product.productImage) {
            try {
                fs.unlinkSync('./public/images/' + product.productImage)
            } catch (error) {
                console.log(error);
            }
        }
        res.redirect('/admin')
    })
})


router.get('/filter', (req, res, next) => {
    let { category, users } = req.query
    console.log(users)
    if (category) {
        User.find({}, (err, users) => {
            if (err) return next(err)
            Product.find({ category: category }, (err, products) => {
                if (err) return next(err)
                Product.distinct('category', (err, categories) => {
                    if (err) return next(err)
                    res.render('productList', { products, categories, users })
                })
            })
        })
    }

    if (users) {
        User.findById(users, (err, user) => {
            if (err) return next(err)
            console.log(user)
            res.render('userInfo', { user })
        })
    }
})


//block and unblock
router.get('/block/:id', (req, res, next) => {
    let userId = req.params.id
    Block.create(req.body, (err, data) => {
        if (err) return next(err)
        res.render('block', { data, userId })
    })
})




//conform
router.get('/conform/:id/:userId', (req, res, next) => {
    let userId = req.params.userId
    let id = req.params.id
    Block.findById(id, (err, data) => {
        if (err) return next(err)
        Block.findByIdAndUpdate(id, { $push: { user: userId } }, (err, block) => {
            if (err) return next(err)
            res.send('block success')
        })
    })
})



module.exports = router