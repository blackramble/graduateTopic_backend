var express = require('express');
var session = require("express-session");
var db = require('../../database/db');
var router = express.Router();

var aLoginRouter = require('./a_login');       // 登入/登出
var aAccountRouter = require('./a_account');   // 後台帳戶
var aProductRouter = require('./a_product');   // 商品
var aOrderRouter = require('./a_order');       // 訂單
var aDataRouter = require('./a_data');       // 報表
var aFrontMemberRouter = require('./a_frontmember'); // 前台會員
// var aMemberRouter = require('./a_member');   // 會員
// var aLogRouter = require('./a_log');         // (登入/瀏覽)紀錄

// 暫時用 secret
const sessionOptions = {
    secret: "temptwayadminsecret",
    saveUninitialized: false,
    resave: true,
};

router.use(session(sessionOptions));


router.get('/', function(req, res, next) {
    res.send('後台首頁')
});

router.use('/login', aLoginRouter);

// function auth (req, res, next) {
//     var username = req.session.username || 'Guest';
//     if ( username === 'Guest' ) {
//         console.log('Not authenticated');
//         res.redirect('/admin');
//         return;
//     } else {
//         console.log('Authenticated');
//         next();
//     }
// }

router.use('/product', aProductRouter);
router.use('/account', aAccountRouter);
router.use('/data', aDataRouter);
router.use('/frontmember', aFrontMemberRouter);
router.use('/orderlist', aOrderRouter);


module.exports = router;