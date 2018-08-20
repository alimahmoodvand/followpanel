import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import randomstring from "randomstring";

const db = require('../../dbconnection.js');

export const verification = (req, res) => {
    db.query('select *,PDATE(regdate) as persianregdate from base_user where mobile=?', [req.body.mobile], (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'internal error! please try later'});
        }
        let verCode = parseInt(Math.random() * (99999 - 10000) + 10000);
        let mobileNumber = req.body.mobile.substring(1);
        let text = "کد فعال سازی شما:" +
            "" + verCode;
        if (user.length) {
            //update vercode
            db.query('update base_user set activationCode=? where mobile=?', [verCode, req.body.mobile], (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'internal error! please try later'});
                }

                // sendSms
                sendSms(mobileNumber, text, (err, response) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(response);
                    }
                });

                res.json({});
            });
        } else {
            // insert
            db.query('insert into base_user (mobile, activationCode) values (?,?)', [req.body.mobile, verCode], (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'internal error! please try later'});
                }


                // sendSms
                sendSms(mobileNumber, text, (err, response) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(response);
                    }
                });

                res.json({});
            });
        }
    });
};

export const checkVerification = (req, res) => {
    db.query(`select *, PDATE(regdate) as persianregdate, concat('${global.userBaseUrl}', image) as imageUrl from base_user where mobile=?`, [req.body.mobile], (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'internal error! please try later'});
        }
        if (!user.length) {
            res.status(404).json({ message: 'user not found!'});
        } else {
            // verCode validation
            if (user[0].activationCode == req.body.activationCode) {
                if (user[0].username) {
                    user[0].token = jwt.sign({ username: user[0].username, mobile: user[0].mobile }, 'RESTFULAPIs');
                }
                delete user[0].password;
                return res.json(user[0]);
            } else {
                return res.status(400).json({ message: 'verification code didnt match!'});
            }
        }
    });
}

export const register = (req, res) => {
    db.query(`select *, PDATE(regdate) as persianregdate, concat('${global.userBaseUrl}', image) as imageUrl from base_user where mobile=?`, [req.body.mobile], (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'internal error! please try later'});
        }
        if (user.length) {
            // update
            let hashPassword = bcrypt.hashSync(req.body.password, 10);
            db.query('update base_user set username=?, password=? where mobile=?',
                [req.body.username, hashPassword, user[0].mobile], (error, result) => {
                    if (error) {
                        res.status(500).json({ message: 'internal error! please try later'});
                    } else {
                        user[0].username = req.body.username;
                        delete user[0].password;
                        user[0].token = jwt.sign({ username: req.body.username, mobile: user[0].mobile}, 'RESTFULAPIs');
                        res.json(user[0]);
                    }
                });
        } else {
            // 404
            res.status(404).json({ message: 'mobile doesnt exists!'});
        }
    });
}

export const updateUser = (req, res) => {
    db.query('select * from base_user where userId=?', [req.body.userId], (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'internal error! please try later'});
        }
        if (user.length) {
            // update
            db.query('update base_user set fullName=?, ostan=?, city=?, postalCode=?, address=? where userId=?',
                [req.body.fullName, req.body.ostan, req.body.city, req.body.postalCode, req.body.address, req.body.userId],
                (error, result) => {
                    if (error) {
                        res.status(500).json({ message: 'internal error! please try later'});
                    } else {
                        res.json({message: "successful!"});
                    }
                });
        } else {
            // 404
            res.status(404).json({ message: 'user doesnt exist!'});
        }
    });
}

export const commentInsertion = (req, res) => {
    db.query(`insert into pac_comment (ProductAndCourseId, UserId, Comment) values (?, ?, ?)`,
        [req.body.ProductAndCourseId, req.body.UserId, req.body.Comment], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'internal error! please try later'});
        }
        res.json({message: 'successful!'});
    });
}

export const commentDeletion = (req, res) => {
    db.query(`delete from pac_comment where ProductAndCourseId = ? and UserId = ?`,
        [req.body.ProductAndCourseId, req.body.UserId], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'internal error! please try later'});
            }
            res.json({message: 'successful!'});
        });
}

export const commentSelection = (req, res) => {
    db.query(`select *,PDATE(CreatedAt) as persianCreatedAt from pac_comment where ProductAndCourseId = ?`,
        [req.body.ProductAndCourseId], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'internal error! please try later'});
            }
            res.json(result);
        });
}

export const orderRegistration = (req, res) => {
    let totalCost = 0;
    for(let i=0; i < req.body.panels.length; i++)
        totalCost += parseInt(req.body.panels[i].price);
    db.query('insert into user_order ' +
        '(userId, status, transitionId, discountCode, totalCost, discountCost, paymentCost, taxCost, discountId, subOrdersCount, subOrdersConfirmedCount) ' +
        'values (?, 1, \'561891658919619\', \'discount\', ?, 0, ?, ?, \'651566\', ?, 0); SELECT LAST_INSERT_ID() as lastId;',
        [req.body.UserId, totalCost, parseInt(((totalCost*109)/100)-0), parseInt((totalCost*9)/100), req.body.panels.length], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'internal error! please try later'});
            }
            result = JSON.parse(JSON.stringify(result));
            let queryString = "";
            for(let i=0; i < req.body.panels.length; i++) {
                queryString += `insert into user_orderDetail (orderId, panelAndCourseId, orderedCount, fee, totalPrice)
                 values (${result[1][0].lastId}, ${req.body.panels[i].ProductAndCourseId}, 1, ${req.body.panels[i].price}, ${req.body.panels[i].price});
                 insert into usercourses_examandpractice (userId, courseId, examAndPracticeId)
                 select ${req.body.UserId}, PAC_ProductAndCourse.ProductAndCourseId , PAC_ExamAndPractice.ExamAndPracticeId from PAC_ExamAndPractice inner join PAC_ProductAndCourse 
                  on PAC_ExamAndPractice.courseId=PAC_ProductAndCourse.ProductAndCourseId 
                  where (
                  PAC_ProductAndCourse.ProductAndCourseId = ${req.body.panels[i].ProductAndCourseId} or
                  PAC_ProductAndCourse.ParentId = ${req.body.panels[i].ProductAndCourseId} 
                  ) ;
                  update PAC_ProductAndCourse set remainCount = remainCount-1 where (
                  PAC_ProductAndCourse.ProductAndCourseId = ${req.body.panels[i].ProductAndCourseId} or
                  PAC_ProductAndCourse.ParentId = ${req.body.panels[i].ProductAndCourseId} 
                  );`;
            }
            console.log(queryString);
            db.query(queryString, (err, answer) => {
                if (err) {
                    return res.status(500).json({ message: 'internal error! please try later'});
                }
                res.json({message: 'successful!'});
            });
        });
}

export const login = (req, res) => {
    db.query('select * from Users where email=?', [req.body.email], (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'internal error! please try later'});
        }
        if (!user.length) {
            res.status(401).json({ message: 'Authentication failed. No user found!'});
        } else {
            if (!bcrypt.compareSync(req.body.password, user[0].password)) {
                res.status(401).json({ message: 'Authentication failed. Wrong password!'});
            } else {
                return res.json({token: jwt.sign({ email: user[0].email, username: user[0].username}, 'RESTFULAPIs')});
            }
        }
    });
}
export const userMessages = (req, res) => {
    let queryString = null;
    queryString = `select *,PDATE(CreateAt) as persianCreateAt from user_message order by CreateAt desc `;
    db.query(queryString, [(req.body.page - 1)*3], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'internal error! please try later'});
        }
        res.json(result);
    });
};
export const userImage = (req,res) => {
    // console.log(req.body,req.files)
    if (!req.files)
        return res.status(400).json({ message:'No files were uploaded.'});
    const name = randomstring.generate(20)+req.files.photo.name;
    const path = "public/" + name;
    req.files.photo.mv(rootPath + path, function(err) {
        if (err) {
            // console.log(err)
            return res.status(500).json({message: 'internal error! please try later'});
        }
        db.query(`update base_user set image=? where userId=?;`,
            [name, req.body.userId], (err, result) => {
                if (err) {
                    // console.log(err)

                    return res.status(500).json({message: 'internal error! please try later'});
                }
                res.json({ image: global.userBaseUrl + name });
            });
    })
};

export const loginRequired = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        return res.status(401).json({ message: 'Unauthorized user!'});
    }
};

const sendSms = (mobileNumber, text, cb) => {
    var qs = require("querystring");
    var http = require("http");

    var options = {
        "method": "POST",
        "hostname": "sabapayamak.com",
        "port": null,
        "path": "/Post/SendSms.ashx",
        "headers": {
            "content-type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache",
        }
    };

    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("error", function (err) {
            return cb(err, null);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            return cb(null, {body: body.toString()});
        });
    });

    req.write(qs.stringify({ username: 'zarrinlearning',
        password: '1234567890',
        from: '30008561661151',
        to: mobileNumber,
        text: text }));
    req.end();
};