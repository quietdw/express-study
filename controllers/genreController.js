const Genre = require('../models/genre')
const Book = require('../models/book')
var async = require('async')
const { body, validationResult } = require('express-validator')
const { sanitizeBody } = require('express-validator')

// 显示完整的藏书种类列表
exports.genre_list = (req, res) => {
  Genre.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_genre) {
      if (err) {
        return next(err)
      }
      //Successful, so render
      res.render('genre_list', {
        title: 'Genre List',
        genre_list: list_genre,
      })
    })
}

// 为每一类藏书显示详细信息的页面
exports.genre_detail = (req, res, next) => {
  async.parallel(
    {
      genre: function (callback) {
        Genre.findById(req.params.id).exec(callback)
      },

      genre_books: function (callback) {
        Book.find({ genre: req.params.id }).exec(callback)
      },
    },
    function (err, results) {
      if (err) {
        return next(err)
      }

      if (results.genre == null) {
        // No results.
        var err = new Error('Genre not found')
        err.status = 404
        return next(err)
      }
      // Successful, so render
      res.render('genre_detail', {
        title: 'Genre Detail',
        genre: results.genre,
        genre_books: results.genre_books,
      })
    }
  )
}

// 由 GET 显示创建藏书种类的表单
exports.genre_create_get = (req, res) => {
  res.render('genre_form', { title: 'Create Genre' })
}

// 由 POST 处理藏书种类创建操作
exports.genre_create_post = [
  // Validate that the name field is not empty.
  body('name', 'Genre name required').isLength({ min: 1 }).trim(),

  // Sanitize (trim and escape) the name field.
  sanitizeBody('name').trim().escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req)

    // Create a genre object with escaped and trimmed data.
    var genre = new Genre({ name: req.body.name })

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('genre_form', {
        title: 'Create Genre',
        genre,
        errors: errors.array(),
      })
      return
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      Genre.findOne({ name: req.body.name }).exec(function (err, found_genre) {
        if (err) {
          return next(err)
        }

        if (found_genre) {
          // Genre exists, redirect to its detail page.
          res.redirect(found_genre.url)
        } else {
          genre.save(function (err) {
            if (err) {
              return next(err)
            }
            // Genre saved. Redirect to genre detail page.
            res.redirect(genre.url)
          })
        }
      })
    }
  },
]

// 由 GET 显示删除藏书种类的表单
exports.genre_delete_get = (req, res) => {
  async.parallel(
    {
      genre: function (callback) {
        Genre.findById(req.params.id).exec(callback)
      },

      genre_books: function (callback) {
        Book.find({ genre: req.params.id }).exec(callback)
      },
    },
    function (err, results) {
      if (err) {
        return next(err)
      }

      if (results.genre == null) {
        // No results.
        var err = new Error('Genre not found')
        err.status = 404
        return next(err)
      }
      // Successful, so render
      res.render('genre_delete', {
        title: '删除类型',
        genre: results.genre,
        genre_books: results.genre_books,
      })
    }
  )
}

// 由 POST 处理藏书种类删除操作
exports.genre_delete_post = (req, res) => {
  async.parallel(
    {
      genre: function (callback) {
        Genre.findById(req.params.id).exec(callback)
      },

      genre_books: function (callback) {
        Book.find({ genre: req.params.id }).exec(callback)
      },
    },
    function (err, results) {
      if (err) {
        return next(err)
      }
      console.log(results)
      if (results.genre_books.length > 0) {
        res.render('genre_delete', {
          title: '删除类型',
          genre: results.genre,
          genre_books: results.genre_books,
        })
        return
      }
      console.log(req.body.genreid)
      Genre.findByIdAndRemove(req.body.genreid, function (err) {
        if (err) {
          return next(err)
        }
        res.redirect('/catalog/genres')
      })
    }
  )
}

// 由 GET 显示更新藏书种类的表单
exports.genre_update_get = (req, res, next) => {
  async.parallel(
    {
      genre: function (callback) {
        Genre.findById(req.params.id).exec(callback)
      },
    },
    function (err, results) {
      if (err) {
        return next(err)
      }

      res.render('genre_form', { title: '修改类型', genre: results.genre })
    }
  )
}

// 由 POST 处理藏书种类更新操作
exports.genre_update_post = [
  body('name', 'Genre name required').isLength({ min: 1 }).trim(),
  sanitizeBody('name').trim().escape(),

  (req, res, next) => {
    const errors = validationResult(req)
    var genre = new Genre({ name: req.body.name, _id: req.params.id })
    if (!errors.isEmpty()) {
      res.render('genre_form', {
        title: '修改类型',
        genre,
        errors: errors.array(),
      })
      return
    } else {
      Genre.findByIdAndUpdate(req.params.id, genre, {}, function (
        err,
        theGenre
      ) {
        if (err) {
          return next(err)
        }
        res.redirect(theGenre.url)
      })
    }
  },
]
