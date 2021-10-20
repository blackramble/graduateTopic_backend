var express = require('express');
var session = require("express-session");
var db = require('../../database/db');
var router = express.Router();
// var crypto = require('crypto');
// var md5 = crypto.createHash('md5');

// 暫時用 secret
const sessionOptions = {
    secret: "temptwayadminsecret",
    saveUninitialized: false,
    resave: true,
};

router.use(session(sessionOptions));

// 後台登入 http://localhost:8000/admin/login
router.get('/', (req, res) => {
    res.send('登入頁面');
});

router.post('/', (req, res) => {
    const { account, password } = req.body;
    if (!account) {
        return res.send({
            code: 5, // 登入失敗 - 沒有帳號
        });
    } else if (!password) {
        return res.send({
            code: 5, // 登入失敗 - 沒有密碼
        });
    }

    try {
        // 檢查有無使用者輸入的帳號資料
        let sqlCheckAccount = `select * from a_admin where account = ?`;
        db.exec(sqlCheckAccount, [account], async function (err, rows, fields) {
            if (err) {
                return res.send({
                    code: 0, // 資料庫錯誤
                    msg: JSON.stringify(err)
                });
            }
            // 取得查詢結果
            // console.log(rows.length === 0);
            if (rows.length === 0) {
                res.send({
                    code: 60, // 登入失敗 - 帳號錯誤
                })
            } else {
                // let pwd = md5.update(password).digest('hex');
                let sql = `select * from a_admin where account = ? and password = md5(?) `;
                db.exec(sql, [account, password], async function (err, rows, fields) {
                    if (err) {
                        return res.send({
                            code: 0, // 資料庫錯誤
                            msg: JSON.stringify(err)
                        });
                    }
                    // 取得查詢結果
                    let resultData = rows[0];

                    // 資料庫回傳 undefined
                    if (resultData === undefined) {
                        res.send({
                            code: 61, // 登入失敗 - 密碼錯誤
                        });
                        return;
                    } else {
                        // 資料庫回傳 會員資料 + 設定session
                        req.session.isLogin = true;
                        res.send({
                            code: 1, // 登入成功
                            data: {
                                admin_id: resultData.admin_id,
                                account: resultData.account,
                                nickname: resultData.nickname
                            }
                        });              
                        return;
                    };
                })
                
            }
        });
    } catch (e) {
        res.send(e);
    }
});

module.exports = router;