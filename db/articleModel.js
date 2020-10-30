// 引入模块
const mongoose = require('mongoose');
// 创建集合的字段名和值的数据类型
let articelSchema = mongoose.Schema({
    title: String,
    content: String,
    createTime: Number,
    username: String
})

// 根据规则创建数据集合
let articleModel = mongoose.model('articles', articelSchema);

// 导出创建好的集合
module.exports = articleModel;