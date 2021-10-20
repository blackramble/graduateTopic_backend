var express = require('express');
var multer = require('multer');
var fs = require('fs')
var db = require('../../database/db');
const e = require('express');
var subRouter = express.Router();

// baseURL: http://localhost:8000/admin/product

// 新增單筆商品 (p_product)
subRouter.get('/create', function (req, res, next) {
    try {
        let sql = 'SELECT product_id FROM p_product ORDER BY product_id DESC LIMIT 0 , 1';
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
              data: rows[0]
          });
        });
    } catch (e) {
        res.send({
            code: 0,
            msg: e
        });
    }
});

// 新增前載入商品方案 (p_product_plan)：傳回現在最後一個 plan_id
subRouter.get('/create/plan', function (req, res, next) {
    try {
        let sql = 'SELECT plan_id FROM p_plan ORDER BY product_id DESC LIMIT 0 , 1';
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
              data: rows[0]
          });
        });
    } catch (e) {
        res.send({
            code: 0,
            msg: e
        });
    }
});

// 新增單筆商品 (p_product)，完成後回傳這筆商品的 product_id
// REMARK: 新增到資料庫功能先關掉
subRouter.post("/create/init", function (req, res, next) {
    const { productName, typeSelect, locationSelect, startDate, endDate, brief } = req.body;

    // 判斷 product_name, brief 字數
    if ( productName.length > 100 || brief.length > 60000 ) {
        res.send({
            code: 2, // 超過字數
        });
        return;
    }

    // brief \r\n 改 <br/>
    brief.trim();
    formatStrToHtml(brief);

    let inserts = [
        {
            sql: 'INSERT INTO p_product (product_name, type_id, destination_id, start_date, end_date, brief) VALUES (?,?,?,?,?,?)',
            data: [productName, typeSelect, locationSelect, startDate, endDate, brief],
        },
        // {
        //     sql: 'SELECT * FROM p_product',
        //     data: [], 
        // },
        {
            sql: 'SELECT product_id FROM p_product ORDER BY product_id DESC LIMIT 0 , 1',
            data: [],
        }
    ];

    try {
        inserts.forEach ((elem, index) => {
            db.exec(elem.sql, elem.data, function (err, rows, fields) {
                if (err) {
                    res.send({
                        code: 0,
                        msg: JSON.stringify(err)
                    });
                    return;
                } else {
                    if (index === inserts.length - 1) {
                        res.send({
                            code: 1,
                            data: rows
                        });
                    }
                }
            });
        });
    } catch (e) {
        res.send({
            code: 0,
            msg: e
        });
    }
});

// 新增單筆商品 (p_product_detail)
// REMARK: 新增到資料庫功能先關掉
subRouter.post("/create/detail", function (req, res, next) {
    const { product_id, description, schedule, meet_place } = req.body;

    // 判斷 description, brief 字數
    if ( description.length > 60000 || meet_place.length > 60000 ) {
        res.send({
            code: 2, // 超過字數
        });
        return;
    }

    // description \r\n 改 JSON
    description.trim();
    let jsonDescription = formatStrToJson (description);
    
    console.log(schedule);


    // 陣列內容轉 JSON 資料
    let jsonSchedule = formatArrToJson (schedule);

    try {
        let sql = `insert into p_product_detail (product_id, description, schedule, meet_place) values (?,?,?,?)`;
        // let sql = `SELECT * FROM p_product_detail`;
        db.exec(sql, [product_id, jsonDescription, jsonSchedule, meet_place], function (err, rows, fields) {
          if (err) {
            res.send({
                code: 0,
                msg: JSON.stringify(err)
            });
            return;
          }
            res.send({
                code: 1,
            });
        });
    } catch (e) {
        res.send({
            code: 0,
            msg: e
        });
    }
});

// 多圖上傳

// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'public/images/uploads');
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now())
//     }
// })
   
// var upload = multer({ storage: storage });

// var uploadMultiple = upload.fields([{ name: 'sche0', maxCount: 1 },
//                                     { name: 'sche1', maxCount: 1 }, 
//                                     { name: 'sche2', maxCount: 1 },
//                                     { name: 'sche3', maxCount: 1 },
//                                     { name: 'sche4', maxCount: 1 },
//                                   ]);

// subRouter.post("/upload/:id", uploadMultiple, function (req, res, next) {
//     const { id } = req.params;
//     console.log(id);

//     try {
//         var dir = `./public/images/uploads/item${id}`;
//         if (!fs.existsSync(dir)){
//             fs.mkdirSync(dir);
//         }
//         if(req.files){
//             for (let f in req.files) {
//                 let newPath = `${dir}/${f}.jpg`;
//                 fs.rename(req.files[f][0]['path'], newPath, () => {
//                 })
//             }
//             res.send({
//                 code: 1,
//                 result: 'image uploaded successful',
//             })
//             console.log("files uploaded");
//         }
//     } catch (e) {
//         res.send (
//             {
//                 code: 0,
//                 msg: e
//             }
//         )
//     }
    
// });


// 單圖上傳
const upload = multer({dest: 'public/images/uploads'});
subRouter.post("/create/upload/:id/:scheidx", upload.single('scheImg'), function (req, res, next) {
    const { id, scheidx } = req.params;

    // 沒有傳送檔案就返回
    if (!req.file) {
        res.send (
            {
                code: 0,
                msg: 'no file'
            }
        )
    } else {
        try {
            // 沒有該商品資料夾就新增一個
            var dir = `./public/images/uploads/item${id}`;
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }
            // 更改檔案名稱
            let fileType = req.file.mimetype.split('/')[1];
            let newFileName = `./public/images/uploads/item${id}/` + `i${id}-s${scheidx}` + '.' + fileType;
            fs.rename(`public/images/uploads/${req.file.filename}`, newFileName, function() {
                console.log('callback');
                res.send({
                  code: 1,
                  msg: 'upload success'
                });
            });
        } catch (error) {
            res.send (
                {
                    code: 0,
                    msg: error
                }
            )
        }
    }
})
// 刪除圖片
subRouter.delete("/create/upload/:id/:scheidx", function (req, res, next) {
    const { id, scheidx } = req.params;
    let url = `./public/images/uploads/item${id}/i${id}-s${scheidx}.jpeg`;
    try {
        fs.unlink(url, function () {
            res.send({
                code: 1,
                msg: 'delete success'
            })
        });
    } catch (error) {
        res.send({
            code: 0,
            msg: 'delete fail'
        })
    }
    
})

// 新增單筆商品 (p_product_detail)
// REMARK: 新增到資料庫功能先關掉
subRouter.post('/create/plan', function(req, res, next) {
    const { plans } = req.body;

    // 處理 brief 格式 // 內容\r\n 轉 JSON 資料 (等等要做)
    for (let p of plans) {
        if (p && p.hasOwnProperty('brief')) {
            p.brief = formatStrToJson(p.brief);
        } else {
            continue;
        }
    }
    
    // let sql = 'INSERT INTO p_plan (product_id, plan_name, brief, price) VALUES (?,?,?,?);'
    let sql = 'SELECT * FROM p_plan;'
    const result = handlePlanSqlReq(sql, plans);

    try {
        result.insertData.forEach(elem => {
            db.exec(result.sql, elem, function (err, rows, fields) {
                if (err) {
                  res.send({
                      code: 0,
                      msg: JSON.stringify(err)
                  });
                  return;
                }
            });
        })

        res.send({
            code: 1,
        });

    } catch (e) {
        res.send({
            code: 0,
            msg: e
        });
    }
})

// 查詢全部商品
subRouter.get('/', function(req, res, next) {
    try {
        let sql = 'select product_id, product_name, type_id, destination_id, sales, start_date, end_date, enable from p_product';
        db.exec(sql, [], function (err, rows, fields) {
          if (err) {
            res.send({
                code: 0, // 資料庫錯誤
                msg: JSON.stringify(err)
            });
            return;
          }

          for (let row of rows) {
            // 轉換 start_date, end_date 格式
            row.start_date = formatDate(row.start_date);
            row.end_date = formatDate(row.end_date);
          }
          
          res.send({
            code: 1, // 查詢成功
            data: rows
          });
        });
    } catch (e) {
        res.send({
            code: 0,
            msg: e
        });
    }
});

// 查詢個別狀態商品
subRouter.get('/status/:status', function(req, res, next) {
    const { status } = req.params;
    try {
        let sql = '';
        ( status === 'active' )
        ? sql = 'select product_id, product_name, type_id, destination_id, sales, start_date, end_date from p_product where enable = 1'
        : sql = 'select product_id, product_name, type_id, destination_id, sales, start_date, end_date from p_product where enable = 0'

        db.exec(sql, [], function (err, rows, fields) {
          if (err) {
            res.send({
                code: 0, // 資料庫錯誤
                msg: JSON.stringify(err)
            });
            return;
          }

          for (let row of rows) {
            // 轉換 start_date, end_date 格式
            row.start_date = formatDate(row.start_date);
            row.end_date = formatDate(row.end_date);
          }
          
          res.send({
            code: 1, // 查詢成功
            data: rows
          });
        });
    } catch (e) {
        res.send({
            code: 0,
            msg: e
        });
    }
});

// 查詢單筆商品
subRouter.get('/:id', function(req, res, next) {
    const { id } = req.params;
    try {
        let sql = 'select product_name, type_id, destination_id, sales, start_date, end_date, brief, enable from p_product where product_id=?';
        db.exec(sql, [id], function (err, rows, fields) {
          if (err) {
            res.send({
                code: 0,
                msg: JSON.stringify(err)
            });
            return;
          }
          // 轉換 brief 格式 // 讀取資料時將 資料庫 內容，把 <br> 轉為換行符號
          rows[0].brief = formatHtmlToStr(rows[0].brief);
          // 轉換 start_date, end_date 格式
          rows[0].start_date = formatDate(rows[0].start_date);
          rows[0].end_date = formatDate(rows[0].end_date);

          res.send({
              code: 1,
              data: rows[0]
          });
        });
    } catch (e) {
        res.send({
            code: 0,
            msg: e
        });
    }
});

// 查詢單筆商品細節 (p_product_detail)
subRouter.get('/detail/:id', function(req, res, next) {
    const { id } = req.params;
    try {
        let sql = 'SELECT * FROM p_product_detail where product_id=?';
        db.exec(sql, [id], function (err, rows, fields) {
          if (err) {
            res.send({
                code: 0,
                msg: JSON.stringify(err)
            });
            return;
          }

          // 轉換 description 格式 // 讀取資料時將 資料庫 內容，格式化 物件
          rows[0].description = JSON.parse(rows[0].description);
          rows[0].schedule = JSON.parse(rows[0].schedule);
        //   console.log(rows[0]['schedule']);

          for (let index in rows[0]['schedule']) {
            // 如果資料夾路徑有資料，就把圖片 base64 編碼放進 schedule[1]
            if (rows[0]['schedule'][index][1]) {
                let fileType = getBuffer(rows[0]['schedule'][index], rows[0]['product_id'], Number(index)+1);
                formatBase64 (rows[0]['schedule'][index], fileType);
            }
          }
            // console.log(rows[0]['schedule'][0]);

          res.send({
              code: 1,
              data: rows[0]
          });
        });
    } catch (e) {
        res.send({
            code: 0,
            msg: e
        });
    }
});

// 轉換 jpg 圖片 變成 base64 編碼
function formatBase64 (arr, fileType) {
    let buffer = Buffer.from(arr[1]).toString('base64');
    arr[1] = 'data:image/'+ fileType +';base64,' + buffer;
    arr[1] = buffer;
}

function getBuffer (arr, productId, scheId) {
    let url = `./public/images/uploads/item${productId}/i${productId}-s${scheId}.jpeg`;
    arr[1] = fs.readFileSync(url , 'binary', function (err, data) {
        if (err) {
            console.log(err);
        } else {  
            console.log('讀取成功');
        }
    });
    
    return getImageType (url);
}

// 取目前圖片格式
function getImageType (str) {
    var reg = /\.(png|jpg|gif|jpeg|webp)$/;
    return str.match(reg)[1];
}

// 查詢單筆商品方案 (p_product_plan)
subRouter.get('/plan/:id', function(req, res, next) {
    const { id } = req.params;
    try {
        let sql = 'SELECT * FROM p_plan where product_id=?';
        db.exec(sql, [id], function (err, rows, fields) {
          if (err) {
            res.send({
                code: 0,
                msg: JSON.stringify(err)
            });
            return;
          }
            // 轉換 brief 格式 // 讀取資料時將 資料庫 內容，格式化成 text... <br/>
            for (let row of rows) {
                // row.brief = JSON.parse(row.brief);
                row.brief = formatJsonToStr(row.brief);
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
});

// 修改單筆商品 (p_product)
subRouter.put('/edit/:id', function(req, res, next) {
    const { id } = req.params;
    const { productName, typeSelect, locationSelect, startDate, endDate, brief } = req.body;

    // 判斷 product_name, brief 字數
    if ( productName.length > 100 || brief.length > 60000 ) {
        res.send({
            code: 2, // 超過字數
        });
        return;
    }

    // brief \r\n 改 <br/>
    formatStrToHtml (brief);

    try {
        let sql = `UPDATE p_product SET product_name=?, type_id=?, destination_id=?, start_date=?, end_date=?, brief=? WHERE product_id=?;`;
       
        db.exec(sql, [productName, typeSelect, locationSelect, startDate, endDate, brief, id], function (err, rows, fields) {
          if (err) {
            res.send({
                code: 0,
                msg: JSON.stringify(err)
            });
            return;
          }
            res.send({
                code: 1,
            });
        });
    } catch (e) {
        res.send({
            code: 0,
            msg: e
        });
    }
})

// 修改單筆商品 (p_product_detail)
subRouter.put('/edit/detail/:id', function(req, res, next) {
    const { id } = req.params;
    const { description, meetPlace, scheduleInput } = req.body;

    // description \r\n 改 json
    const jsonDescription = formatStrToJson (description);

    // scheduleInput 改 json
    const jsonScheduleInput = formatArrToJson (scheduleInput);

    // scheduleInput.foreach ((elem, index) => {
    //     // var url = `./public/images/uploads/item${id}/i${id}-s${index+1}.jpeg`;
        
    //     // if (fs.access( url, function () {
    //     //     return 1;
    //     // } ) === 1) {
    //     //     console.log(index, '有哦');
    //     // } else {
    //     //     console.log(index, '沒')
    //     // }
    //     // console.log('有執行');
    //     console.log(elem);
    // })

    // console.log(scheduleInput);

    res.send({
        code: 0
    })

    // try {
    //     let sql = `UPDATE p_product_detail SET description=?, schedule=?, meet_place=? WHERE product_id=?;`;
       
    //     db.exec(sql, [jsonDescription, jsonScheduleInput, meetPlace, id], function (err, rows, fields) {
    //       if (err) {
    //         res.send({
    //             code: 0,
    //             msg: JSON.stringify(err)
    //         });
    //         return;
    //       }
    //         res.send({
    //             code: 1,
    //         });
    //     });
    // } catch (e) {
    //     res.send({
    //         code: 0,
    //         msg: e
    //     });
    // }
})

// 修改商品方案 (p_product_detail)
subRouter.put('/edit/plan/:id', function(req, res, next) {
    const { id } = req.params;
    const { plans } = req.body;

    // 處理 brief 格式 // 內容\r\n 轉 JSON 資料 (等等要做)
    for (let p of plans) {
        if (p && p.hasOwnProperty('brief')) {
            p.brief = formatStrToJson(p.brief);
        } else {
            continue;
        }
    }
    let sql = 'REPLACE INTO p_plan(product_id, plan_name, brief, price, plan_id) VALUES (?,?,?,?,?);';
    const result = handlePlanSqlReq(sql, plans);

    try {
        result.insertData.forEach(elem => {
            db.exec(result.sql, elem, function (err, rows, fields) {
                if (err) {
                  res.send({
                      code: 0,
                      msg: JSON.stringify(err)
                  });
                  return;
                }
            });
        })

        res.send({
            code: 1,
        });

    } catch (e) {
        res.send({
            code: 0,
            msg: e
        });
    }

    

})

// 下架商品 (p_product)
subRouter.put('/edit/status/:id/:setstatus', function(req, res, next) {
    const { id, setstatus } = req.params;
    try {
        let sql = `UPDATE p_product SET enable=${setstatus} WHERE product_id=?;`;
        db.exec(sql, [id], function (err, rows, fields) {
            if (err) {
                res.send({
                    code: 0,
                    msg: JSON.stringify(err)
                });
                return;
            }
            res.send({
                code: 1,
            });
        });
    } catch (e) {
        res.send({
            code: 0,
            msg: e
        });
    }
})


module.exports = subRouter;

// 提交資料時將 textarea 內容中所有\r\n轉 <br>
function formatStrToHtml (str) {
    var reg = new RegExp("\r\n","g");
    return str.replace(reg,"<br/>");   
}

// 讀取資料時將 資料庫 內容中所有 <br> 轉 \r\n
function formatHtmlToStr (text) {
    var reg = new RegExp("<br/>","g");
    return text.replace(reg,"\r\n"); 
}

// 格式化日期
function formatDate (date) {
    let newDate = new Date(date);
    let year = newDate.getFullYear();
    let month = ((newDate.getMonth()+1).toString()).padStart(2, 0);
    let day = (newDate.getDate().toString()).padStart(2, 0);
    newDate = year + '-' + month + '-' + day;
    return newDate;
}

// JSON 資料轉 內容\r\n
function formatJsonToStr (jsonData) {
    jsonData = JSON.parse(jsonData);
    let str = '';
    let index = 0;
    let objLength = Object.keys(jsonData).length;
    for (let data in jsonData) {
        index++;
        if ( index < objLength ) {
            str += (jsonData[data] + '\r\n');
        } else {
            str += jsonData[data];
        }
    }
    return str;
}

// 內容\r\n 轉 JSON 資料
function formatStrToJson (str) {
    var strArr = str.split(/\r?\n/ );
    var jsonData = {};
    var index = 0;
    for (let elem of strArr) {
        if (elem === '\r\n') {
            continue;
        } else {
            jsonData[index] = elem.toString();
            index++;
        }
    }
    return JSON.stringify(jsonData);
}

// 陣列內容轉 JSON 資料
function formatArrToJson (arr) {
    var jsonData = {};
    var index = 0;
    for (let elem of arr) {
        if (elem[0] === '' && elem[1] === null) {
            continue;
        } else {
            jsonData[index] = elem;
            index++;
        }
    }
    return JSON.stringify(jsonData);
}

// 根據方案個數，決定發送幾筆資料庫請求
const handlePlanSqlReq = (sql, datas) => {
    let insertData = [];
    for (let plan of datas) {
        if (plan !== null) {
            insertData.push([plan.product_id, plan.plan_name, plan.brief, plan.price, plan.plan_id]);
        } else {
            return {sql, insertData};
        }
    }
}