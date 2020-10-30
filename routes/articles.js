var express = require('express');
const fs = require('fs');
const path = require('path');
let router = express.Router();
var multiparty = require('multiparty'); // 处理文件上传
let articleModel = require('../db//articleModel');
/* 
文章修改和新增接口
    + 业务接口说明:文章修改和新增业务,登录后才能访问
    + 请求方式:post请求
    + 入参:title,content
*/
router.post('/write', (req, res, next) => {
    // 接收post数据
    let { title, content, username, id } = req.body;
    // 当前时间
    let createTime = Date.now()
    if (id) {
        // 修改文章
        id = new Object(id);
        articleModel.updateOne({ _id: id }, {
            title, content, createTime, username
        }).then(data => {
            // res.send('文章修改成功');
            res.redirect('/')
        }).catch(err => {
            // res.send('文章修改失败')
            res.redirect('/write')
        })
    } else {
        // 新增文章
        // 插入数据库
        let username = req.session.username;
        articleModel.insertMany({
            username,
            title,
            content,
            createTime
        }).then(data => {
            // res.send('文章写入成功')
            res.redirect('/')
        }).catch(err => {
            // res.send('文章写入失败')
            res.redirect('/write')
        })
    }
})
/* 
    文章删除接口
        + 业务接口说明:文章删除业务
        + 请求方式:get请求
        + 入参：id
        + 返回值:失败成功都重定向到/
*/
router.get('/delete', (req, res, next) => {
    console.log(req);
    let id = req.query.id;
    id = new Object(id);
    // 删除
    articleModel.deleteOne({ _id: id })
        .then(data => {
            // res.send('文章删除成功')
            res.redirect('/')
        })
        .catch(err => {
            // res.send('文章删除失败')
            res.redirect('/')
        })
})

/* 
图片上传接口
    + 业务接口说明:图片上传业务
    + 请求方式:post请求
    + 入参:file,使用的富文本编辑插件xheditor里面上传图片的文件有的name是filedata
    + 返回值:json格式,例如:{err:0,msg:'图片路径'}
*/
router.post('/upload', (req, res, next) => {
    // 每次访问该接口,都新建一个form对象来解析文件数据
    var form = new multiparty.Form();
    form.parse(req, (err, field, files) => {
        if (err) {
            console.log('文件上传失败');
        } else {
            // console.log('----field-----')
            console.log(field);
            var file = files.filedata[0];
            // console.log('----file-----')
            console.log(file);
            // 读取流
            var read = fs.createReadStream(file.path);
            // 写入流
            var write = fs.createWriteStream(path.join(__dirname, "..", 'public/images/', file.originalFilename))
            // 管道流,图片写入指定目录
            read.pipe(write);
            write.on('close', function () {
                console.log('图片上传完成');
                res.send({
                    err: 0,
                    msg: '/images/' + file.originalFilename
                })
            })
        }
    })
})

module.exports = router;