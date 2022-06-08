let express = require('express')
let router = express.Router()
let Article = require('../models/Article')
let auth = require('../middlewares/auth')
let Comment = require('../models/Comment')


//form to add article
router.get('/new', auth.loggedInUser, (req, res) => {
  res.render('articleForm')
})

//articles details
router.get('/:id', (req, res, next) => {
  let id = req.params.id
  Article.findById(id).populate('author', 'name email').populate('comment').exec((err, article) => {
    if (err) return next(err)
    res.render('articleDetails', { article })
  })
});

//authorization
router.use(auth.loggedInUser)



//capture the articles data
router.post('/new', (req, res, next) => {
  req.body.tags = req.body.tags.split(',')
  req.body.author = req.user._id
  // create the article and store in mongodb
  Article.create(req.body, (err, article) => {
    if (err) return next(err)
    res.redirect('/users/articles')
  })
})


//render a edit articles form
router.get('/:id/edit', (req, res, next) => {
  let id = req.params.id
  Article.findById(id, (err, article) => {
    if (err) return next(err)
    //compare the objects Ids
    if (req.user._id.equals(article.author)) {
      return res.render('articleEdit', { article })
    } else {
      res.redirect('/articles/' + id)
    }
  })
});

//update articles
router.post('/:id/edit', (req, res, next) => {
  let id = req.params.id
  Article.findByIdAndUpdate(id, req.body, (err, article) => {
    if (err) return next(err)
    res.redirect('/articles/' + id)
  })
})


//delete articles
router.get('/:id/delete', (req, res, next) => {
  let id = req.params.id
  //deleting the article
  Article.findById(id, (err, article) => {
    if (err) return next(err)
    if (req.user._id.equals(article.author)) {
      Article.findByIdAndDelete(id, (err, article) => {
        if (err) return next(err)
        res.redirect('/users/articles')
      })
    } else {
      res.redirect('/articles/' + id)
    }
  })
})


//like articles
router.get('/:id/like', (req, res, next) => {
  let id = req.params.id
  Article.findOneAndUpdate(id, { $inc: { likes: +1 } }, (err, article) => {
    if (err) return next(err)
    res.redirect('/articles/' + id)
  })
})

//dislike articles
router.get('/:id/dislike', (req, res, next) => {
  let id = req.params.id
  Article.findById(id, (err, article) => {
    if (err) return next(err)
    if (article.likes > 0) {
      Article.findByIdAndUpdate(id, { $inc: { likes: -1 } }, (err, article) => {
        if (err) return next(err)
        res.redirect('/articles/' + id)
      })
    } else {
      res.redirect('/articles/' + id)
    }
  })

})

//creating the comment
router.post('/:id/comment', (req, res, next) => {
  let id = req.params.id

  if (req.body.title !== '') {
    //appending a articleID 
    req.body.articleId = id
    //creating a comment
    Comment.create(req.body, (err, comment) => {
      if (err) return next(err)
      //pushing the comment id
      Article.findByIdAndUpdate(id, { $push: { comment: comment._id } }, (err, article) => {
        if (err) return next(err)
        res.redirect('/articles/' + id)
      })
    })
  } else {
    Article.findById(id, (err, article) => {
      if (err) return next(err)
      res.redirect('/articles/' + id)
    })

  }
})


module.exports = router