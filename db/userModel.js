// 引入模块
const mongoose = require('mongoose');

// 创建集合的字段名和值的数据类型
let userSchema = mongoose.Schema({
    username: String,
    password: String,
    createtime: Number
})
// 根据规则创建数据集合
let userModel = mongoose.model('users', userSchema);

//导出创建好的集合
module.exports = userModel;