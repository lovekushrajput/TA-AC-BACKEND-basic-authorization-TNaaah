var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Product = require('../models/Product');
var auth = require('../middlewares/auth');
const Block = require('../models/Block');



//register
router.get('/register', (req, res, next) => {
  let error = req.flash('error')[0]
  res.render('register', { error })
});

//capture the data
router.post('/register', (req, res, next) => {
  User.create(req.body, (err, user) => {
    if (err) {
      //email error
      if (err.name === 'MongoServerError') {
        req.flash('error', 'This email is already exist')
        return res.redirect('/users/register')
      }
      //validation error
      if (err.name === 'ValidationError') {
        req.flash('error', err.message)
        return res.redirect('/users/register')
      }
    }
    // redirected to login 
    res.redirect('/users/login')
  })
});

//login
router.get('/login', (req, res, next) => {
  let error = req.flash('error')[0]
  res.render('login', { error })
});

//capture the data
router.post('/login', (req, res, next) => {
  let { email, password } = req.body
  //no email and password
  if (!email || !password) {
    req.flash('error', 'Email/Password is required')
    return res.redirect('/users/login')
  }
  //admin login
  else if (email === 'lovekushrazput143@gmail.com') {
    User.findOne({ email }, (err, user) => {
      if (err) return next(err)
      //no email
      if (!user) {
        req.flash('error', 'Invalid Email')
        return res.redirect('/users/login')
      }
      //varify the password
      user.varifyPassword(password, (err, result) => {
        if (err) return next(err)
        // no password
        if (!result) {
          req.flash('error', 'Invalid Password')
          return res.redirect('/users/login')
        }
        //persist a logged in information
        req.session.userId = user._id
        return res.redirect('/users/admin')
      })
    })
  }


  //user login
  else {
    User.findOne({ email }, (err, user) => {
      if (err) return next(err)
      if (err) return next(err)
      //no email
      if (!user) {
        req.flash('error', 'Invalid Email')
        return res.redirect('/users/login')
      }
      //block or unblock
      Block.find({}, (err, data) => {
        if (err) return next(err)
        data.forEach((elm) => {
          if (elm.user[0].equals(user._id)) {
            req.flash('error', 'user is blocked')
            return res.redirect('/users/login')
          } else {
            //varify the password
            user.varifyPassword(password, (err, result) => {
              if (err) return next(err)
              // no password
              if (!result) {
                req.flash('error', 'Invalid Password')
                return res.redirect('/users/login')
              }
              //persist a logged in information
              req.session.userId = user._id
              return res.redirect('/users')
            })
          }
          // elm.user === user._id
        })
      })
    })

    // User.findOne({ email }, (err, user) => {
    //   if (err) return next(err)
    //   //no email
    //   if (!user) {
    //     req.flash('error', 'Invalid Email')
    //     return res.redirect('/users/login')
    //   }
    //   //varify the password
    //   user.varifyPassword(password, (err, result) => {
    //     if (err) return next(err)
    //     // no password
    //     if (!result) {
    //       req.flash('error', 'Invalid Password')
    //       return res.redirect('/users/login')
    //     }
    //     //persist a logged in information
    //     req.session.userId = user._id
    //     return res.redirect('/users')
    //   })
    // })
  }


})




//logout
router.get('/logout', (req, res, next) => {
  res.clearCookie('connect.sid')
  req.session.destroy()
  res.redirect('/users/login')
})


//users product details
router.get('/product/:id', (req, res, next) => {
  let id = req.params.id
  Product.findById(id, (err, product) => {
    if (err) return next(err)
    res.render('productDetails', { product })
  })
})


//like product
router.get('/product/:id/like', (req, res, next) => {
  let id = req.params.id
  Product.findByIdAndUpdate(id, { $inc: { like: +1 } }, (err, product) => {
    if (err) return next(err)
    res.redirect('/users/product/' + id)
  })
})

//dislike product
router.get('/product/:id/dislike', (req, res, next) => {
  let id = req.params.id
  Product.findById(id, (err, product) => {
    if (err) return next(err)
    if (product.like > 0) {
      Product.findByIdAndUpdate(id, { $inc: { like: -1 } }, (err, product) => {
        if (err) return next(err)
        return res.redirect('/users/product/' + id)
      })
    } else {
      return res.redirect('/users/product/' + id)
    }
  })

})



// authorization
router.use(auth.loggedInUser)

//user dashboard
router.get('/', function (req, res, next) {
  User.findById(req.user._id, (err, user) => {
    if (err) return next(err)
    Product.find({}, (err, products) => {
      if (err) return next(err)
      Product.distinct('category', (err, categories) => {
        if (err) return next(err)
        res.render('users', { products, user, categories })
      })
    })
  });
})



//admin
router.get('/admin', function (req, res, next) {
  res.redirect('/admin')
});


//render a form to add item in cart
router.get('/cart', (req, res, next) => {
  let userId = req.user._id
  User.findById(userId).populate('cart').exec((err, product) => {
    if (err) return next(err)
    console.log(product.cart)
    return res.render('cart', { product })
  })
})

//add item to cart
router.get('/product/:id/cart', (req, res) => {
  let id = req.params.id
  let userId = req.user._id
  Product.findById(id, (err, product) => {
    if (err) return next(err)
    User.findByIdAndUpdate(userId, { $push: { cart: product._id } }, (err, user) => {
      if (err) return next(err)
      res.redirect('/users/cart')
    })
  })
})

//remove item from cart
router.get('/cart/:id', (req, res, next) => {
  let id = req.params.id
  let userId = req.user._id
  Product.findById(id, (err, product) => {
    if (err) return next(err)
    User.findByIdAndUpdate(userId, { $pull: { cart: product._id } }, (err, user) => {
      if (err) return next(err)
      res.redirect('/users/product/' + product._id)
    })
  })
})

//buy now
router.get('/buy', (req, res, next) => {
  res.render('buyNow')
})

//filter
router.get('/filter', (req, res, next) => {
  let { category } = req.query
  console.log(category)
  if (category) {
    User.findById(req.user._id, (err, user) => {
      if (err) return next(err)
      Product.find({ category: category }, (err, products) => {
        if (err) return next(err)
        Product.distinct('category', (err, categories) => {
          if (err) return next(err)
          res.render('users', { products, user, categories })
        })
      })

    })

  }
})


module.exports = router;

