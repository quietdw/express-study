const BookInstance = require('../models/bookinstance')
var Book = require('../models/book')
const { body, validationResult } = require('express-validator/check')
const { sanitizeBody } = require('express-validator/filter')
var async = require('async')

// 显示完整的藏书副本列表
exports.bookinstance_list = (req, res) => {
  BookInstance.find()
    .populate('book')
    .exec(function (err, list_bookinstances) {
      if (err) {
        return next(err)
      }
      // Successful, so render
      res.render('bookinstance_list', {
        title: 'Book Instance List',
        bookinstance_list: list_bookinstances,
      })
    })
}

// 为藏书的每一本副本显示详细信息的页面
exports.bookinstance_detail = (req, res) => {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function (err, bookinstance) {
      if (err) {
        return next(err)
      }
      if (bookinstance == null) {
        // No results.
        var err = new Error('Book copy not found')
        err.status = 404
        return next(err)
      }
      // Successful, so render.
      res.render('bookinstance_detail', {
        title: 'Book:',
        bookinstance: bookinstance,
      })
    })
}

// 由 GET 显示创建藏书副本的表单
exports.bookinstance_create_get = (req, res) => {
  Book.find({}, 'title').exec(function (err, books) {
    if (err) {
      return next(err)
    }
    // Successful, so render.
    res.render('bookinstance_form', {
      title: 'Create BookInstance',
      book_list: books,
    })
  })
}

// 由 POST 处理藏书副本创建操作
exports.bookinstance_create_post = [
  // Validate fields.
  body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
  body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
  body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),

  // Sanitize fields.
  sanitizeBody('book').trim().escape(),
  sanitizeBody('imprint').trim().escape(),
  sanitizeBody('status').trim().escape(),
  sanitizeBody('due_back').toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req)

    // Create a BookInstance object with escaped and trimmed data.
    var bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    })

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      Book.find({}, 'title').exec(function (err, books) {
        if (err) {
          return next(err)
        }
        // Successful, so render.
        res.render('bookinstance_form', {
          title: '创建馆藏',
          book_list: books,
          selected_book: bookinstance.book._id,
          errors: errors.array(),
          bookinstance: bookinstance,
        })
      })
      return
    } else {
      // Data from form is valid.
      console.log(bookinstance)

      bookinstance.save(function (err) {
        if (err) {
          return next(err)
        }
        // Successful - redirect to new record.
        res.redirect(bookinstance.url)
      })
    }
  },
]

// 由 GET 显示删除藏书副本的表单
exports.bookinstance_delete_get = (req, res) => {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function (err, bookinstance) {
      if (err) {
        return next(err)
      }
      if (bookinstance == null) {
        // No results.
        var err = new Error('Book copy not found')
        err.status = 404
        return next(err)
      }
      // Successful, so render.
      res.render('bookinstance_delete', {
        title: 'Book:',
        bookinstance: bookinstance,
      })
    })
}

// 由 POST 处理藏书副本删除操作
exports.bookinstance_delete_post = (req, res) => {
  BookInstance.findById(req.params.id).exec(function (err, bookinstance) {
    if (err) {
      return next(err)
    }
    if (bookinstance == null) {
      // No results.
      var err = new Error('Book copy not found')
      err.status = 404
      return next(err)
    }
    // Successful, so render.
    BookInstance.findByIdAndRemove(
      req.body.bookinstanceid,
      function deleteAuthor(err) {
        if (err) {
          return next(err)
        }

        res.redirect('/catalog/bookinstances')
      }
    )
  })
}

// 由 GET 显示更新藏书副本的表单
exports.bookinstance_update_get = (req, res) => {
  async.parallel(
    {
      bookinstance: function (callback) {
        BookInstance.findById(req.params.id).populate('book').exec(callback)
      },
      book_list: function name(callback) {
        Book.find({}, 'title').exec(callback)
      },
    },
    function (err, results) {
      if (err) {
        return next(err)
      }

      if (results.bookinstance == null) {
        var err = new Error('Author not found')
        err.status = 404
        return next(err)
      }
      console.log(results)
      const { book_list, bookinstance } = results
      res.render('bookinstance_form', {
        title: '修改馆藏',
        book_list,
        bookinstance,
        selected_book: bookinstance.book._id,
      })
    }
  )
}
// 由 POST 处理藏书副本更新操作
exports.bookinstance_update_post = [
  // Validate fields.
  body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
  body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
  body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),

  // Sanitize fields.
  sanitizeBody('book').trim().escape(),
  sanitizeBody('imprint').trim().escape(),
  sanitizeBody('status').trim().escape(),
  sanitizeBody('due_back').toDate(),

  (req, res, next) => {
    const errors = validationResult(req)

    var bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id,
    })

    if (!errors.isEmpty()) {
      Book.find({}, 'title').exec(function (err, books) {
        if (err) {
          return next(err)
        }
        res.render('bookinstance_form', {
          title: '修改馆藏',
          book_list: books,
          selected_book: bookinstance.book._id,
          errors: errors.array(),
          bookinstance: bookinstance,
        })
      })
      return
    } else {
      BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function (
        err,
        theBookinstance
      ) {
        if (err) {
          return next(err)
        }
        res.redirect(theBookinstance.url)
      })
    }
  },
]
