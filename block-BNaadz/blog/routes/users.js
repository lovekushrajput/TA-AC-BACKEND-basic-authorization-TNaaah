var express = require('express');
var router = express.Router();
var User = require('../models/User')
var Article = require('../models/Article');
var Comment = require('../models/Comment');
const auth = require('../middlewares/auth');


router.get('/', (req, res) => {
  res.send('respodind with resource')
})

//render a form for registration
router.get('/register', (req, res) => {
  let err = req.flash('error')[0]
  res.render('register', { err })
})

// capture the data
router.post('/register', (req, res, next) => {
  User.create(req.body, (err, user) => {
    if (err) {
      if (err.name === 'MongoServerError') {
        req.flash('error', 'This email is already exist')
        return res.redirect('/users/register')
      }
      if (err.name === 'ValidationError') {
        req.flash('error', err.message)
        return res.redirect('/users/register')
      }
    }
    res.redirect('/users/login')

  })
})


//login form
router.get('/login', (req, res) => {
  let err = req.flash('error')[0]
  res.render('login', { err })
})


// capture the data
router.post('/login', (req, res, next) => {
  let { email, password } = req.body
  if (!email || !password) {
    req.flash('error', 'Email/Password is required')
    return res.redirect('/users/login')
  }
  User.findOne({ email }, (err, user) => {
    if (err) return next(err)
    if (!user) {
      req.flash('error', 'Email is invalid')
      return res.redirect('/users/login')
    }

    //varify the password
    user.varifyPassword(password, (err, result) => {
      if (err) return next(err)
      if (!result) {
        req.flash('error', 'Password is invalid')
        return res.redirect('/users/login')
      }
      //persist logged in user information
      req.session.userId = user.id
      // res.redirect('/users')
      res.redirect('/users/articles')
    })
  })
});


//logout
router.get('/logout', (req, res) => {
  res.clearCookie('connect.sid')
  req.session.destroy()
  res.redirect('/users/login')
});

//list of articles
router.get('/articles', (req, res, next) => {
  Article.find({}, (err, articles) => {
    if (err) return next(err)
    res.render('articlesList', { articles })
  })
})





module.exports = router;
