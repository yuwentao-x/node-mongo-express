// 引入模块
const mongoose = require('mongoose');
// 连接数据库,project是要操作的数据库名称
mongoose.connect('mongodb://localhost/project', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
// 获取数据库连接信息
var db = mongoose.connection;
// 监听数据库连接错误和第一次打开事件
db.on('err', () => {
    console.log('数据库连接错误');
})
db.once('open', () => {
    console.log('数据库连接成功');
})