var express = require('express');
var router = express.Router();
var auth = require('../middlewares/auth')

var Podcast = require('../models/Podcast')
var fs = require('fs')
var multer = require('multer')


let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/podcast')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

let upload = multer({ storage: storage })

//authorization
router.use(auth.loggedInUser)

//add podcast
router.get('/new', (req, res) => {
    res.render('podcast')
})

//capture the data
router.post('/new', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover_image', maxCount: 1 }]), (req, res, next) => {
    let { audio, cover_image } = req.files
    req.body.audio = audio[0].filename
    req.body.cover_image = cover_image[0].filename
    Podcast.create(req.body, (err, podcast) => {
        if (err) return next(err)
        res.redirect('/users')
    })
})

//edit the podcast
router.get('/:id/edit', (req, res, next) => {
    let id = req.params.id
    Podcast.findById(id, (err, podcast) => {
        if (err) return next(err)
        console.log(podcast)
        res.render('podcastEdit', { podcast })
    })
})

//capture the data
router.post('/:id/edit', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover_image', maxCount: 1 }]), (req, res, next) => {
    let id = req.params.id
    let newAudio = ''
    let newImage = ''

    if (req.files) {
        let audio = req.files.audio[0]
        let cover_image = req.files.cover_image[0]

        if (audio) {
            newAudio = audio.filename
            try {
                fs.unlinkSync('./public/podcast/' + req.body.audio)
            } catch (error) {
                console.log(error)
            }
        }

        if (cover_image) {
            newImage = cover_image.filename
            try {
                fs.unlinkSync('./public/podcast/' + req.body.cover_image)
            } catch (error) {

            }
        }

    }
    else {
        newAudio = req.body.audio
        newImage = req.body.cover_image
    }

    req.body.audio = newAudio
    req.body.cover_image = newImage
    Podcast.findByIdAndUpdate(id, req.body, (err, podcast) => {
        if (err) return next(err)
        console.log(podcast)
        res.redirect('/users')
    })

})

//delete the podcast
router.get('/:id/delete', (req, res, next) => {
    let id = req.params.id
    Podcast.findByIdAndDelete(id, (err, podcast) => {
        if (err) return next(err)
        if (podcast.audio) {
            try {
                fs.unlinkSync('./public/podcast/' + podcast.audio)
            } catch (error) {
                console.log(error)
            }
        }
        if (podcast.cover_image) {
            try {
                fs.unlinkSync('./public/podcast/' + podcast.cover_image)
            } catch (error) {
                console.log(error)
            }
        }
        res.redirect('/users')
    })
})

module.exports = router