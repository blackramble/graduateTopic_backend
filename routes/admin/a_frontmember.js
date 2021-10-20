var express = require('express');
var db = require('../../database/db');
var subRouter = express.Router();

// http://localhost:8000/admin/account/
subRouter.get('/', function(req, res, next) {
    res.send('後台首頁 - 前台會員管理');
});


//前台會員主要查詢
subRouter.get("/frontmembersearch", function(req, res) {
    try {
        let sql = 'SELECT member_id,account,first_name,birthday,phone,email,enable FROM twaydb.m_member;';
        db.exec(sql, function(err, rows) {
            if (err) {
                res.send(JSON.stringify(err));
            }
            res.send(rows);
        });
    } catch {
        res.send('error');
    }
});

/* 提交新增請求 */
subRouter.post("/create", function(req, res) {
    let { account, first_name, last_name, password, birthday, phone, email } = req.body;

    try {
        let sql = 'INSERT INTO `twaydb`.`m_member` (`account`, `first_name`, `last_name`, `password`, `birthday`, `phone`, `email`) VALUES (?, ?, ?, md5(?), ?, ?, ?);';
        db.exec(sql, [account, first_name, last_name, password, birthday, phone, email], function(err, rows, fields) {
            if (err) {
                res.send(JSON.stringify(err));
                return;
            }
            res.send(rows);
        });
    } catch {
        res.send('error');
    }
});

/* 管理員列表 */
subRouter.get("/administrator", function(req, res, next) {
    try {
        let sql = 'SELECT admin_id,account,nickname,bdate FROM twaydb.a_admin;';
        db.exec(sql, function(err, rows, fields) {
            if (err) {
                res.send(JSON.stringify(err));
            }
            res.send(rows);
        });
    } catch {
        res.send('error');
    }
});

/* 提交新增請求 */
subRouter.post("/create", function(req, res, next) {
    let { account, nickname, password } = req.body;

    // 判斷 nickname 字數
    if (account.length > 20 || nickname.length > 20 || password.length > 40) {
        res.send('超過字數');
        return;
    }

    try {
        let sql = 'insert into twaydb.a_admin (account,nickname,password) values (?,?,md5(?));';
        db.exec(sql, [account, nickname, password], function(err, rows, fields) {
            if (err) {
                res.send(JSON.stringify(err));
                return;
            }
            res.send(rows);
        });
    } catch {
        res.send('error');
    }
});

// 刪除人員   DELETE FROM `twaydb`.`a_admin` WHERE (`admin_id` = '2');
subRouter.delete("/delete", function(req, res) {
    let { deleteid } = req.body;

    //執行
    try {
        let sql = 'DELETE FROM `twaydb`.`a_admin` WHERE (`admin_id` = ?);';
        db.exec(sql, [deleteid], function(err, rows, fields) {
            if (err) {
                res.send(JSON.stringify(err));
                return;
            }
            res.send(rows);
        });
    } catch {
        res.send('error');
    }
})

// 修改帳號資料  UPDATE `twaydb`.`a_admin` SET `nickname` = 'banktest', `password` = md5('55555') WHERE (`admin_id` = '2');
subRouter.put("/editaccount", function(req, res) {
    let { nickname, password, admin_id } = req.body

    //執行
    try {
        let sql = 'UPDATE `twaydb`.`a_admin` SET `nickname` = ?, `password` = md5(?) WHERE (`admin_id` = ?);';
        db.exec(sql, [nickname, password, admin_id], function(err, rows) {
            if (err) {
                res.send(JSON.stringify(err));
                return;
            }
            res.send(rows);
        });
    } catch {
        res.send('error');
    }
})


/* 修改暱稱 */
subRouter.put("/editnicknameonly", function(req, res) {
    let { nickname, admin_id } = req.body

    // 判斷 nickname 字數
    if (nickname.length > 20) {
        res.send('超過暱稱字數 (20字)');
        return;
    }

    //執行
    try {
        let sql = 'UPDATE `twaydb`.`a_admin` SET `nickname` = ? WHERE (`admin_id` = ?);';
        db.exec(sql, [nickname, admin_id], function(err, rows) {
            if (err) {
                res.send(JSON.stringify(err));
                return;
            }
            res.send(rows);
        });
    } catch {
        res.send('error');
    }

});


module.exports = subRouter;

// INSERT INTO `twaydb`.`m_member` (`account`, `first_name`, `last_name`, `password`, `birthday`, `phone`, `email`) VALUES ('a293627352', '瑋婷', '馮', md5('ji32k7au4a83'), '1996-09-18', '0958052660', 'bekumupu@altmails.com');