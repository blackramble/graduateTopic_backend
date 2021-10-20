var express = require('express');
var db = require('../../database/db');
var subRouter = express.Router();

// http://localhost:8000/admin/account/
subRouter.get('/', function(req, res, next) {
    res.send('後台首頁 - 訂單管理');
});

//查所有訂單的api
subRouter.get("/mainlist", function(req, res) {
    try {
        let sql = 'SELECT * FROM twaydb.m_orderlist as tablea left join twaydb.m_member as tableb on tableb.member_id=tablea.member_id left join twaydb.p_product as tablec on tablec.product_id=tablea.product_id;';
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

//查狀態為已付款  0
subRouter.get("/mainlist/status0", function(req, res) {
    try {
        let sql = 'SELECT * FROM (select * from twaydb.m_orderlist where status=0) as tablea left join twaydb.m_member as tableb on tableb.member_id=tablea.member_id left join twaydb.p_product as tablec on tablec.product_id=tablea.product_id;';
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

//查狀態為已使用  1
subRouter.get("/mainlist/status1", function(req, res) {
    try {
        let sql = 'SELECT * FROM (select * from twaydb.m_orderlist where status=1) as tablea left join twaydb.m_member as tableb on tableb.member_id=tablea.member_id left join twaydb.p_product as tablec on tablec.product_id=tablea.product_id;';
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

//查狀態為待取消  2
subRouter.get("/mainlist/status2", function(req, res) {
    try {
        let sql = 'SELECT * FROM (select * from twaydb.m_orderlist where status=2) as tablea left join twaydb.m_member as tableb on tableb.member_id=tablea.member_id left join twaydb.p_product as tablec on tablec.product_id=tablea.product_id;';
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

//查狀態為已取消  3
subRouter.get("/mainlist/status3", function(req, res) {
    try {
        let sql = 'SELECT * FROM (select * from twaydb.m_orderlist where status=3) as tablea left join twaydb.m_member as tableb on tableb.member_id=tablea.member_id left join twaydb.p_product as tablec on tablec.product_id=tablea.product_id;';
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




//訂單編號查方案細節
subRouter.get("/detail/:orderlist_id", function(req, res) {
    let { orderlist_id } = req.params;

    try {
        let sql = 'SELECT * FROM twaydb.m_orderlist_detail where orderlist_id=?';
        db.exec(sql, [orderlist_id], function(err, rows, fields) {
            if (err) {
                res.send(JSON.stringify(err));
            }
            res.send(rows);
        });
    } catch {
        res.send('error');
    }
});

//查方案
subRouter.get("/detailplan/:plan_id", function(req, res) {
    let { plan_id } = req.params;

    try {
        let sql = 'SELECT * FROM twaydb.p_plan where plan_id=?';
        db.exec(sql, [plan_id], function(err, rows, fields) {
            if (err) {
                res.send(JSON.stringify(err));
            }
            res.send(rows);
        });
    } catch {
        res.send('error');
    }
});


module.exports = subRouter;