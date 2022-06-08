let express = require('express')
let router = express.Router()
var Comment = require('../models/Comment');
var Article = require('../models/Article')
var auth = require('../middlewares/auth')


//like comment
router.get('/:commentId/like', (req, res, next) => {
    let commentId = req.params.commentId
    Comment.findByIdAndUpdate(commentId, { $inc: { like: +1 } }, (err, comment) => {
        if (err) return next(err)
        res.redirect('/articles/' + comment.articleId)
    })
})

//dislike comment
router.get('/:commentId/dislike', (req, res, next) => {
    let commentId = req.params.commentId
    Comment.findById(commentId, (err, comment) => {
        if (err) return next(err)
        if (comment.like > 0) {
            Comment.findByIdAndUpdate(commentId, { $inc: { like: -1 } }, (err, comment) => {
                if (err) return next(err)
                return res.redirect('/articles/' + comment.articleId)
            })
        } else {
            res.redirect('/articles/' + comment.articleId)
        }
    })
})


router.use(auth.loggedInUser)

//edit the comment
router.get('/:commentId/edit', (req, res, next) => {
    let commentId = req.params.commentId
    Comment.findById(commentId, (err, comment) => {
        if (err) return next(err)
        Article.findById(comment.articleId, (err, article) => {
            if (err) return next(err)
            if (req.user._id.equals(article.author)) {
                return res.render('commentEdit', { comment })
            }
            else {
                res.redirect('/articles/' + comment.articleId)
            }
        })

    })
})

//update comment
router.post('/:commentId/edit', (req, res, next) => {
    let commentId = req.params.commentId
    Comment.findByIdAndUpdate(commentId, req.body, (err, comment) => {
        if (err) return next(err)
        res.redirect('/articles/' + comment.articleId)
    })
})


//delete comment
router.get('/:commentId/delete', (req, res, next) => {
    let commentId = req.params.commentId
    Comment.findById(commentId, (err, comment) => {
        if (err) return next(err)
        Article.findById(comment.articleId, (err, article) => {
            if (req.user._id.equals(article.author)) {
                Comment.findByIdAndDelete(commentId, (err, comment) => {
                    if (err) return next(err)
                    Article.findByIdAndUpdate(comment.articleId, { $pull: { comment: comment._id } }, (err, article) => {
                        if (err) return next(err)
                        res.redirect('/articles/' + comment.articleId)
                    })
                })
            } else {
                res.redirect('/articles/' + comment.articleId)
            }
        })
    })

})



module.exports = router