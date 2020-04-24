const mongoose = require('mongoose')

const Schema = mongoose.Schema

// 该模型应该有一个 String 模式类型，命名为 name ，用来描述图书种类。
// name 字段应该是必需的，并且有 3 到​ ​100 个字符。
const GenreSchema = new Schema({
  name: { type: String, required: true, max: 100, min: 3 },
})

// 虚拟属性'url'：图书种类（URL
GenreSchema.virtual('url').get(function () {
  return '/catalog/genre/' + this._id
})
module.exports = mongoose.model('Genre', GenreSchema)
