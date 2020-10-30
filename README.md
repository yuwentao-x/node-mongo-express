## 1 使用Express-generator初始化项目
```
npm install express-generator -g
express --view=ejs articleM  // --view=ejs指定模板引擎是ejs
cd articleM
npm install
npm start // nodemon ./bin/www
```

## 2 详解express-generator脚手架搭建的项目架构
+ package.json:项目信息的描述文件
    + scripts属性里面可以配置npm的快捷命令
        + npm run 命令名称
    + cookie-parser:用于解析cookie会话数据
    + morgan:是一个日志工具
    + serve-favicon:用于设置网站的favicon
        + npm i serve-favicon -S
    + body-parser用于解析http请求体中的body数据
        + req.query 只能解析get请求的查询字符串
        + req.body  能解析post请求主体的信息
    + express-session:在服务端记录用户的简单信息
        + npm i express-session -S
## 3 数据库集合结构
+ 在项目根目录里面新建db文件夹
    + npm i mongoose -S
    + 用于存放数据库连接和集合结构
    + connect.js:数据库连接文件
    + userModel.js:用户集合文件
    + articleModel.js:文章集合文件
> connect.js
```javascript
// 引入模块
const mongoose = require('mongoose')
// 连接数据库,project是要操作的数据库名称
mongoose.connect('mongodb://localhost/project',{ 
    useNewUrlParser: true ,
    useUnifiedTopology: true 
})
// 获取数据库连接信息
var db = mongoose.connection;
// 监听数据库连接错误和第一次打开事件
db.on('error',()=>{
    console.log('数据库连接错误')
})
db.once('open',()=>{
    console.log('数据库连接成功')
})
```

> userModel.js
```javascript
// 导入mongoose模块
const mongoose = require('mongoose')
// 创建集合的字段名和值的数据类型
let userSchema = mongoose.Schema({
    username:String,
    password:String,
    createTime:Number
})
// 根据规则创建数据集合
let userModel = mongoose.model('users',userSchema);
// 导出创建好的集合
module.exports = userModel;
```

> articleModel.js
```javascript
// 引入模块
const mongoose = require('mongoose');
// 创建集合的字段名和值的数据类型
let articleSchema = mongoose.Schema({
    tilte:String,
    content:String,
    createTime:Number,
    username:String
})
// 根据规则创建数据集合
let articleModel = mongoose.model('articels',articleSchema)
// 导出创建好的集合
module.exports = articleModel;
```
## 4 public目录和views目录结构改造
+ public
    + 包含stylesheets,images,javascripts等静态资源
+ views
    + 所有html文件放入(除了error.html以外)
    + 后缀名改为ejs
    + 提取相同部分,利用include引入
        + <%-include('bar',{})%>
        + <%-include('head',{})%>
    + 改造css.js,img的连接地址,以public为根目录

## 5 路由说明
路由|功能|请求方式|入参|返回值|说明
:-|:-|:-|:-|:-|:-
/|编译index.ejs模板|get|page,size|返回index页面|无
/regist|编译regist.ejs模板|get|无|返回regist页面|无
/login|编译login.ejs模板|get|无|返回login页面|无
/write|编译write.js模板|get|id|返回write页面|登录后访问,有id是编辑页,无id是新增页
/detail|编译detail.ejs模板|get|id|返回detail页面|无
/users/regist|注册业务|post|username,password,password2|重定向|注册成功重定向到/login,失败重定向到/regist
/users/login|登录业务|post|username,password|重定向|登录成功重定向到/,失败重定向到/login
/users/logout|退出登录业务|get|无|重定向|退出登录后重定向到/login
/articles/write|文章修改和新增业务|post|title,content,username,id|重定向|有id是修改业务,无id是新增业务,成功重定向/,失败重定向/write
/articels/delete|文章删除业务|get|id|重定向|失败成功都重定向到/
/articles/upload|文件上传业务|post|file|json|{err:0,msg:'图片路径'}

## 6 app.js
```javascript
const session = require('express-session');
// 配置服务端session
app.use(seeion({
    secret:'sz2009html5',
    resave:false,
    saveUninitialized:true,
    cookie:{
        maxAge:1000*60*60 // 指定session的有效时长,单位是毫秒值
    }
}))

// 连接数据库
var db = require('./db/connect')
```
## 7 模板子路由
> routes/index.js

```javascript
const express = require('express');
let router = express.Router();

// 首页路由
router.get('/',(req,res,next)=>{
    res.render('index',{})
})

// 注册页路由
router.get('/regist',(req,res,next)=>{
    res.render('regist',{})
})

// 登录页路由
router.get('/login',(req,res,next)=>{
    res.render('login',{})
})

// 写文章/编辑文章页路由
router.get('/write',(req,res,next)=>{
    res.render('write',{})
})

// 详情页路由
router.get('/detail',(req,res,next)=>{
    res.render('detail',{})
})

module.exports = router;
```
>注意:
+ 在这里把页面子路由完成以后,更新模板里面的'页面'链接:主要是超链接a的href属性
+ 更新app.js里面关于模板页的子路由配置,添加代码如下
```javascript
  var indexRouter = require('./routes/index');//导入模板子路由
  app.use('/', indexRouter);//配置模板子路由
```
## 8 用户子路由
>routes/users.js
```javascript
const express = require('express');
let router = express.Router();
let userModel = require('../db/userModel');
/* 
注册接口
    + 业务接口说明:注册业务
    + 请求方式:post
    + 入参:username,password,password2
    + 返回值:重定向,注册成功重定向到/login,失败重定向到/regist
*/
router.post('/regist',(req,res,next)=>{
    // 接收post数据
    let {username,password,password2}=>req.body; // 结构赋值
    // 数据校验工作,在这里完成
    // 查询是否存在这个用户
    userModel.find({username}).then(docs=>{
        if(docs.legth>0){
            // res.send('用户已存在')
            res.redirect('/regist')
        }else{
            // 用户不存在,开始注册
            let createTime = Date.now();
            // 插入数据
            userModel.insertMany({
                username,
                password,
                createTime
            }).then(docs=>{
                // res.send('成功')
                res.redirect('/login')
            }).catch(err=>{
                // res.send('注册失败')
                res.redirect('/regist')
            })
        }
    })
})

/* 
登陆接口
    + 业务接口说明:登陆业务
    + 请求方式:post请求
    + 入参:username,password
    + 返回值:重定向,登陆成功重定向到/,失败重定向到/login
*/
router.post('/login',(req,res,next)=>{
    // 接收post数据
    let {username,password} = req.body;
    // 操作数据库
    userModel.find({username,password})
    .then(docs=>{
        if(docs.length>0){
            // res.send('登陆成功');
            // 登陆成功以后,在服务端使用session记录用户信息
            req.session.username = username;
            req.session.isLogin = true;
            res.redirect('/')
        }else{
            // res.send('用户名或者密码错误')
            res.redirect('/login')
        }
    })
})

/* 
退出登陆接口
    + 业务接口说明:退出登陆业务
    + 请求方式:get请求
    + 入参:无
    + 返回值:重定向到/login
*/
router.get('/logout',(req,res,next)=>{
    // console.log(req.session)
    req.session.username = null;
    req.session.isLogin = false;
    // console.log(req.session)
    // res.send('退出登陆成功')
    res.redirect('/login')

})

module.exports = router;
```

> 注意:
+ 在这里把用户子路由完成以后,更新模板里面的用户业务链接
  + bar.ejs 里面 <a href="/users/logout">退出</a>
+ 更新app.js里面关于用户子路由配置,添加代码如下
```javascript
  var usersRouter = require('./routes/users');//导入用户子路由
  app.use('/users',usersRouter);//配置用户子路由
```

## 9 文章子路由
> routes/articles.js
```js
const express = require('express');
const fs = require('fs');
const path = require('path');
var multiparty = require('multiparty'); // 处理文件上传
let router = express.Router();
let articleModel =require('../db/articleModel');

/* 
文章修改和新增接口
    + 业务接口说明:文章修改和新增业务,登录后才能访问
    + 请求方式:post请求
    + 入参:title,content,username,id
    + 返回值:重定向,有id是修改业务,无id是新增业务,成功重定向/,失败重定向/write
*/
router.post('post',(req,res,next)=>{
    // 就收post数据
    let {title,content,username,id}=req.body;
    // 当前时间
    let createTime = Date.now()
    if(id){
        // 修改文章
        id = new Object(id);
        articleModel.updateOne({_id:id},{
            title,content,createTime,username
        }).then(data=>{
            // res.send('文章修改成功');
            res.redirect('/')
        }).catch(err=>{
            // res.send('文章修改失败')
            res.redirect('/write')
        })
    }else{
        // 新增文章
        // 插入数据库
        let username = req.session.username;
        articleModel.insertMany({
            username,
            title,
            content,
            createTime
        }).then(data=>{
            // res.send('文章写入成功')
            res.redirect('/')
        }).catch(err=>{
            // res.send('文章写入失败')
            res.redirect('/write')
        })
    }

})
/* 
文章删除接口
    + 业务接口说明:文章删除业务
    + 请求方式:get请求
    + 入参:id
    + 返回值:失败成功都重定向到/
*/
router.get('/delete',(req,res,next)=>{
    let id = req.query.id;
    id = new Object(id);
    // 删除
    articleModel.deleteOne({_id:id})
    .then(data=>{
        // res.send('文章删除成功');
        res.redirect('/')
    })
    .catch(err=>{
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
router.post('/upload',(req,res,next)=>{
    // 每次访问该接口,都新建一个form对象来解析文件数据
    var form = new multiparty.Form();
    form.parse(req,field,files)=>{
        if(err){
            console.log('文件上传失败')
        }else{
            var file = files.filedata[0];
            // 读取流
            var read = fs.createReadStream(file.path);
            // 写入流
            var write = fs.createWriteStream(path.join(__dirname,"..",'public/images/',file.originalFilename))
            // 管道流,图片流入指定目录
            read.pipe(write);
            write.on('close',function(){
                console.log('图片上传完成')
                res.send({
                    err:0,
                    msg:'/images/'+file.originalFilename
                })
            })
        }
    }
})
module.exports = router;

```
> 注意:
+ 在文章路由里面需要接收表单上传的文件,body-parser不擅长,我们使用multiparty模块
  + npm install multiparty
+ 在这里把文章子路由完成以后,更新模板里面的文章业务链接
  + index.ejs 里面 <a href="/articles/delete">删除</a>
+ 更新app.js里面关于文章子路由配置,添加代码如下
```javascript
  var articlesRouter = require('./routes/articles');//导入文章子路由
  app.use('/articles',articlesRouter);//配置文章子路由
```

## 10 使用Postman测试所有接口

## 11 模板子路由-首页路由(/)
```js
const articleModel = require('db/articleModel');
const moment = require('moment');// 时间格式化
// 首页路由
router.get('/',(req,res,next)=>{
    console.log(req.query)
    // 数据类型是number
    let page = parseInt(req.query.page||1);// 如果page没有传,默认是第一页
    let size = parseInt(req.query.size||3);// 如果size没有传,默认一页显示3条文章
    // 第一步:查询文章总数,并计算总页数
    articleModel.find().count().then(total=>{
        // total就是文章的总条数
        // 获取总页数
        var pages = Math.ceil(total/size);
        // 第二步:分页查询
        articleModel.find().sort({'createTime':-1}).skip((page-1)*size).limit(size)
        .then(docs=>{
            // docs不是传统意义的js数组,要使用slice()方法把他转化成js数组
            var arr = docs.slice();
            for(let i = 0;i<arr.length;i++){
                // 原有的文档的字段值,不能修改吗?
                // 添加一个新的字段,来表示格式化的时间
                arr[i].createTimeZH = moment(arr[i].createTime).format('YYYY-MM-DD HH:mm:ss')
            };
            res.render('index',{
                data:{
                    list:arr,
                    total:pages,
                    username
                }
            })
        }).catch(err=>{
        res.redirect('/')
        })
    })
    
})
```
>注意:
+ page和size需要设置默认值
+ sort表示排序
+ skip表示跳过
+ limit表示选取前几条数据
+ 需要在查询到的分页记录里面,给每个数据添加一个createTimeZH字段,里面是格式化好的时间
    + npm i moment -S
    + 在打印的时候是无法打印出来的
## 12 完成模板-index.ejs
```html
    <body>
        <%-include('bar',{username:data.username})%>

        <div class="list">

            <%data.list.map((ele,idx)=>{%>
            <div class="row">
                <span><%=(idx+1)%></span>
                <span><%=ele.username%></span>
                <span><a href="/detail?id=<%=ele._id%>"><%=ele.title%></a></span>
                <span><%=ele.createTimeZH%></span>
                <span>
                <a href="/write?id=<%=ele._id%>">编辑</a>
                <a href="/articles/delete?id=<%=ele._id%>">删除</a>
                </span>
            </div>
            <%})%>

        <div class="pages">
            <%for(let i=1;i<=data.total;i++){%>
                <a href="/?page=<%=i%>"><%=i%></a>
            <%}%>         
        </div>

        </div>
    </body>
```
## 13 完成模板-login.ejs
```
<form method="post" action="/users/login">
```
## 14 完成模板-regist.ejs
```html
<form method="post" action="/users/regist">
```
## 15 模板子路由-写文章路由(/write)
```js
// 写文章/编辑文章页路由
router.get('/write',(req,res,next)=>{
    // 获取文章id
    var id = req.query.id;
    if(id){
        // 编辑
        id = new Object(id)
        // 用id查询
        articleModel.findById(id)
        .then(doc=>{
            console.log(doc)
            res.render('write',{doc,username:req.session.username})
        })
        .catch(err=>{
            res.redirect('/')
        })

    }else{
        // 新增
        var doc = {
            _id:"",
            username:req.session.username,
            title:"",
            content:""
        };
        res.render('write',{doc,username:req.session.username})
    }
})
```
## 16 完成模板-write.ejs
```html
<body>
  <%-include('bar',{username:username})%>
  <div class="article">
    <form method="post" action="/articles/write">
      <%# POST请求不能使用query字符串的方式传值%>
      <%# 我们使用input隐藏域传值%>
      <input type="hidden" name="id" value="<%=doc._id%>">
      <input type="hidden" name="username" value="<%=doc.username%>">
      <input type="text" name="title" placeholder="<%=doc.title%>" value="<%=doc.title%>">
      <textarea name="content" class="xheditor"><%=doc.content%></textarea>
      <%if(doc._id){%>
        <input type="submit" value="修改">
      <%}else{%>
        <input type="submit" value="发布">
      <%}%>
    </form>
  </div>

  <script type="text/javascript" src="/xheditor/jquery/jquery-1.4.4.min.js"></script>
  <script type="text/javascript" src="/xheditor/xheditor-1.2.2.min.js"></script>
  <script type="text/javascript" src="/xheditor/xheditor_lang/zh-cn.js"></script>
  <script>
    $('.xheditor').xheditor({
       tools:'full',
       skin:'default',
       upImgUrl:'/articles/upload',
       html5Upload:false,
       upMultiple:1
    })
  </script>
</body>
```
## 18 完成模板-detail.ejs
```html
<body>

  <%-include('bar',{username:username})%>
  

  <div class="detail">
    <div class="title"><%-doc.title%></div>
    <div class='desc'>
      <span>作者：<%=doc.username%></span>
      <span>发布时间：<%=doc.createTimeZH%></span>
    </div>
    <div class="content"><%-doc.content%></div>
  </div>

</body>
```

## 19 优化
### 19.1用户登录拦截
```js
// 用户登录拦截
app.get("*",(req,res,next)=>{
   let {username} = req.session;//获取用户名
   let url = req.path;
   if(url!='/login'&&url!='/regist'){
      // 如果不是登陆和注册,需要有用户名(登陆状态)
      if(!username){
        // 用户未登陆
        res.redirect('/login')
      }else{
        next()
      }
   }else{
     next()
   }
})
```
### 19.2 设置编辑/删除权限
> 只有文章的作者和用户名相同的时候,才显示编译和删除按钮
```html
<span>
    <%if(ele.username==data.username){%>
        <a href="/write?id=<%=ele._id%>">编辑</a>
        <a href="/articles/delete?id=<%=ele._id%>">删除</a>
    <%}%>            
</span>
```
### 19.3 用户密码加密
+ 登录注册优化
    + 对数据库的密码进行加密
    + npm i bcrypt -S
    + 通过明文产生密文
        + var bcrypt = require('bcrypt')
        + 密码密文 = bcrypt.hashSync(密码明文,加盐的字符串长度);
        + 把密码存入数据库
    + 检测密文是否由指定明文产生
        + bcypt.compareSync(指定明文,密码密文)
        + 结果为true表示密文是指定明文产生的
        + 结果为false表示密文不是指定明文产生的
> /users/regist 注册业务路由
```js
router.post('/regist',(req,res,next)=>{
    // 接收post数据
    let {username,password,password2} = req.body; // 解构赋值
    // 密码不直接存入数据,先加密,再存入数据库
    password = bcrypt.hashSync(password, 10);
    // 数据校验工作,在这里完成
    // 查询是否存在这个用户
    userModel.find({username}).then(docs=>{
        if(docs.length>0){
            // res.send('用户已存在')
            res.redirect('/regist')
        }else{
            // 用户不存在,开始注册
            let createTime = Date.now();
            // 插入数据
            userModel.insertMany({
                username,
                password,
                createTime
            }).then(docs=>{
                // res.send('注册成功')
                res.redirect('/login')
            }).catch(err=>{
                // res.send('注册失败')
                res.redirect('/regist')
            })
        }
    })
})
```
> /users/login  登陆业务路由
```js
router.post('/login',(req,res,next)=>{
    // 接收post数据
    let {username,password} = req.body;
    // 操作数据库
    userModel.find({username})
    .then(docs=>{
        if(docs.length>0){
            // 说明有这个用户
            // 检验数据库里面的密文是否由你输入的明文密码产生
            var result = bcrypt.compareSync(password, docs[0].password)
            if(result){
                // 登陆成功以后,在服务端使用session记录用户信息
                req.session.username = username
                req.session.isLogin = true;  
                // res.send('登陆成功'); 
                res.redirect('/')      
            }else{
                // res.send('密码错误')
                res.redirect('/login')
            }
              
        }else{
            // res.send('用户不存在')
            res.redirect('/login')
        }
    })
    .catch(function(){
        // res.send('登陆失败')
        res.redirect('/login')
    })
})
```
