var express = require('express');
const bcrypt = require('bcrypt');
let router = express.Router();
let userModel = require('../db/userModel')

/* 
注册接口
    + 业务接口说明:注册业务
    + 请求方式:post
    + 入参:username,password,password2
    + 返回值:重定向,注册成功重定向到/login,失败重定向到/regist
*/

router.post('/regist', (req, res, next) => {
  // 接收post数据
  let { username, password, password2 } = req.body; // 结构赋值
  password = bcrypt.hashSync(password, 10);
  // 数据校验工作,在这里完成
  // 查询是否存在这个用户
  userModel.find({ username }).then(docs => {
    if (docs.length > 0) {
      // res.send('用户已存在')
      res.redirect('/regist')
    } else {
      // 用户不存在,开始注册
      let createTime = Date.now();
      // 插入数据
      userModel.insertMany({
        username,
        password,
        createTime
      }).then(docs => {
        // res.send('注册成功')
        res.redirect('/login')
      }).catch(err => {
        // res.send('注册失败')
        res.redirect('./regist')
      })
    }
  })
});

/* 
登录接口
    + 业务接口说明:登录业务
    + 请求方式:post
    + 入参:username,password
    + 返回值:重定向,登录成功重定向到/,失败重定向到/login
*/
router.post('/login', (req, res, next) => {
  // 接受数据
  let { username, password } = req.body;
  // 操作数据库
  userModel.find({ username })
    .then(docs => {
      if (docs.length > 0) {
        // 说明有这个用户
        // 检验数据库里面的密文是否由你输入的明文密码产生
        var result = bcrypt.compareSync(password, docs[0].password)
        if (result) {
          // res.send('登录成功')
          // 登录成功以后,在服务端使用session记录用户信息
          req.session.username = username;
          req.session.isLogin = true;
          res.redirect('/');
        } else {
          // res.send('用户名或者密码错误')
          res.redirect('/login')
        }

      } else {
        // res.send('用户不存在')
        res.redirect('/login')
      }
    }).catch(function () {
      // res.send('登录失败')
      res.redirect('/login')
    })
})

/* 
退出登录接口
    + 业务接口说明:退出登录业务
    + 请求方式:get请求
    + 入参:无
    + 返回值:重定向到/login
*/
router.get('/logout', (req, res, text) => {
  console.log(req.session);
  req.session.username = null;
  req.session.isLogin = false;
  console.log(req.session);
  // res.send('退出登录成功')
  res.redirect('/login')
})

module.exports = router;
