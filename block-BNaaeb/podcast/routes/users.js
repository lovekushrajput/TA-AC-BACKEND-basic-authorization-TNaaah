var express = require('express');
const Podcast = require('../models/Podcast');
var router = express.Router();
var User = require('../models/User')
var auth = require('../middlewares/auth')


//register
router.get('/register', (req, res) => {
  let error = req.flash('error')[0]
  res.render('register', { error })
})

//capture the data
router.post('/register', (req, res, next) => {
  User.create(req.body, (err, user) => {
    if (err) {
      if (err.name === 'MongoServerError') {
        req.flash('error', 'Email is already exist')
        return res.redirect('/users/register')
      } else if (err.name === 'ValidationError') {
        req.flash('error', err.message)
        return res.redirect('/users/register')
      }
      else {
        return next(err)
      }
    } else {
      return res.redirect('/users/login')
    }

  })
})


//login
router.get('/login', (req, res) => {
  let error = req.flash('error')[0]
  res.render('login', { error })
})

//capture the data
router.post('/login', (req, res, next) => {
  let { email, password } = req.body
  if (!email || !password) {
    req.flash('error', 'Email Password is required')
    return res.redirect('/users/login')
  }
  if (!email) {
    req.flash('error', 'Email is required')
    return res.redirect('/users/login')
  }
  User.findOne({ email }, (err, user) => {
    if (err) return next(err)
    if (!user) {
      req.flash('error', 'Invalid Email')
      return res.redirect('/users/login')
    }

    user.varifyPassword(password, (err, result) => {
      if (err) return next(err)
      if (!result) {
        req.flash('error', 'Wrong password')
        return res.redirect('/users/login')
      }
      //persit a logged in user
      req.session.userId = user._id
      res.redirect('/users')
    })

  })
})

router.use(auth.loggedInUser)

/* subcription */
router.get('/', function (req, res, next) {
  User.findById(req.user._id, (err, user) => {
    if (err) return next(err)

    if (user.isAdmin) {
      Podcast.find({}, (err, podcasts) => {
        if (err) return next(err)
        res.render('admin', { podcasts })
      })
    } else {

      // free subscription
      if (req.user.subcription === 'free') {
        Podcast.find({ category: 'free' }, (err, podcasts) => {
          if (err) return next(err)
          res.render('user', { podcasts })
        })
      }

      // vip subscription
      if (req.user.subcription === 'vip') {
        Podcast.find({ category: 'vip' }, (err, podcastV) => {
          if (err) return next(err)
          Podcast.find({ category: 'free' }, (err, podcastF) => {
            let podcasts = podcastV.concat(podcastF)
            if (err) return next(err)
            res.render('user', { podcasts })
          })
        })
      }


      // premium subscription
      if (req.user.subcription === 'premium') {
        Podcast.find({ category: 'premium' }, (err, podcastP) => {
          if (err) return next(err)
          Podcast.find({ category: 'vip' }, (err, podcastV) => {
            if (err) return next(err)
            let specialPodcast = podcastV.concat(podcastP)
            Podcast.find({ category: 'free' }, (err, podcastF) => {
              let podcasts = specialPodcast.concat(podcastF)
              if (err) return next(err)
              res.render('user', { podcasts })
            })
          })
        })

      }

    }
  })

});

//logout
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.clearCookie('connect.sid')
  res.redirect('/users/login')
})

//upgrade the subcription
router.get('/:id/upgrade', (req, res, next) => {
  res.render('updateSubcription')
})

//update
router.post('/:id/upgrade', (req, res, next) => {
  let id = req.params.id
  User.findByIdAndUpdate(id, req.body, (err, user) => {
    if (err) return next(err)
    res.redirect('/users')
  })
})

module.exports = router;
