const db = require("mysql");
const db_config = require("./config");

// 連線資料庫
var connection;

module.exports.exec = function (sql, params, callback) {
    var errTimes = 0;

    (function doConnect (sql, params, callback) {
        // 與資料庫連線
        var connection = db.createConnection(db_config);

        connection.connect(function (err) {
            try {
                // 資料庫連線失敗
                if (err) {
                    if (errTimes < 4) {
                        errTimes++;
                        console.log('errTimes', errTimes);
                        console.log("err when connect to db: ", err);
                        // 2秒後重新連線
                        setTimeout(() => doConnect (sql, params, callback), 2000);
                    } else {
                        throw err;
                    }
                } else {
                    // 連線成功
                    console.log("Connected to db");
                }

                connection.on("error", function (err) {
                    console.log("db err: ", err.code);
                    if (err.code === "PROTOCOL_CONNECTION_LOST") {
                        errTimes++;
                        console.log('errTimes', errTimes);
                        if (errTimes < 4) {
                            // 重新連線
                            doConnect(sql, params, callback);
                        } else {
                            throw err;
                        }
                    } else {
                        throw err;
                    }
                });
        
                connection.query(sql, params, callback);

            } catch {
                console.log('Error when connect to db, stop connection request');
            }
            
        });

       
    })(sql, params, callback);
        
};
