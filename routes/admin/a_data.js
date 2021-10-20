var express = require('express');
var db = require('../../database/db');
var subRouter = express.Router();

// baseURL: http://localhost:8000/admin/data

// 根據選定日期區間，顯示所有訂單總額 (type_id 分類)
subRouter.get('/type', function (req, res, next) {
    // 取得 startdate, enddate
    let { start, end } = req.query;
    
    // mysql 日期會進位計算，enddate 調整成多一天
    if (start === end) {
        let tempDate = new Date(end).getTime() + 24*3600*1000;
        end = new Date(tempDate).toISOString().split('T', 1);
    }
    
    try {
        let sql = `select p.type_id, sum(o.total_price) as sum from m_orderlist o, p_product p where o.product_id = p.product_id and o.bdate between ? and ? group by(p.type_id)`;
        db.exec(sql, [start, end], function (err, rows, fields) {
          if (err) {
            res.send({
                code: 0,
                msg: JSON.stringify(err)
            });
            return;
          }
          res.send({
              code: 1,
              data: rows
          });
        });
    } catch (e) {
        res.send({
            code: 0,
            msg: e
        });
    }
})

subRouter.get('/totalsales', function (req, res, next) {
    // 取得 interval
    let { interval } = req.query;
    
    try {
        let sql = 'SELECT DATE(bdate) bdate, sum(total_price) as sum FROM twaydb.m_orderlist WHERE DATE_SUB(CURDATE(), INTERVAL ? DAY) <= DATE(bdate) GROUP BY DATE(bdate)';
        db.exec(sql, [interval], function (err, rows, fields) {
            if (err) {
                res.send({
                    code: 0,
                    msg: JSON.stringify(err)
                });
                return;
            }
            for (let bd in rows) {
                rows[bd]['bdate'] = formatDate(rows[bd]['bdate']);
            }
            res.send({
                code: 1,
                data: rows
            });
        })
          
    } catch (e) {
        res.send({
            code: 0,
            msg: e
        });
    }
})

subRouter.get('/member', function (req, res, next) {
    // 取得 interval
    let { interval } = req.query;

    try {
        let sql = 'SELECT DATE(bdate) bdate, count(*) as sum FROM twaydb.m_member WHERE DATE_SUB(CURDATE(), INTERVAL ? DAY) <= DATE(bdate) GROUP BY DATE(bdate)';
        db.exec(sql, [interval], function (err, rows, fields) {
            if (err) {
                res.send({
                    code: 0,
                    msg: JSON.stringify(err)
                });
                return;
            }
            for (let bd in rows) {
                rows[bd]['bdate'] = formatDate(rows[bd]['bdate']);
            }
            res.send({
                code: 1,
                data: rows
            });
        })
          
    } catch (e) {
        res.send({
            code: 0,
            msg: e
        });
    }
})

subRouter.get('/totalcvr', function (req, res, next) {
    try {
        let sql = 'SELECT product_id, product_name, views, sales, round(sales/views, 2) as cvr FROM twaydb.p_product order by cvr DESC limit 5;';
        db.exec(sql, [], function (err, rows, fields) {
            if (err) {
                res.send({
                    code: 0,
                    msg: JSON.stringify(err)
                });
                return;
            }
            res.send({
                code: 1,
                data: rows
            });
        })
    } catch (e) {
        res.send({
            code: 0,
            msg: e
        });
    }
})

subRouter.get('/totalorders', function (req, res, next) {
    // 取得 interval
    let { interval } = req.query;
    
    try {
        let sql = 'SELECT DATE(bdate) bdate, count(*) as count FROM twaydb.m_orderlist WHERE DATE_SUB(CURDATE(), INTERVAL ? DAY) <= DATE(bdate) GROUP BY DATE(bdate)';
        db.exec(sql, [interval], function (err, rows, fields) {
            if (err) {
                res.send({
                    code: 0,
                    msg: JSON.stringify(err)
                });
                return;
            }
            for (let bd in rows) {
                rows[bd]['bdate'] = formatDate(rows[bd]['bdate']);
            }
            res.send({
                code: 1,
                data: rows
            });
        })
          
    } catch (e) {
        res.send({
            code: 0,
            msg: e
        });
    }
})



module.exports = subRouter;

// 格式化日期
function formatISOStringDate (ISOString) {
    let d = new Date(ISOString).toString().split('T', 1)[0];
    return d;
}

function formatDate (date) {
    let newDate = new Date(date);
    let month = ((newDate.getMonth()+1).toString()).padStart(2, 0);
    let day = (newDate.getDate().toString()).padStart(2, 0);
    newDate =  month + '/' + day;
    return newDate;
}