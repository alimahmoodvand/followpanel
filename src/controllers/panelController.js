import fs from "fs";

const db = require('../../dbconnection.js');

export const panels = (req, res) => {
    // console.log(req.body)
    // if(req.body.type!==0 &&req.body.subType!==0){
    //     db.query('select *, PDATE(RegDate) as persianRegDate, PDATE(RegisterDeadLine) as persianRegisterDeadLine, ' +
    //         `PDATE(StartDate) as persianStartDate, PDATE(EndDate) as persianEndDate, concat('${global.baseUrl}', thumbnail) as thumbnailUrl ` +
    //         'from PAC_ProductAndCourse inner join (select fullName, userId from base_user) as t1 on t1.userId = PAC_ProductAndCourse.MasterId ' +
    //         'where Type=? and subType=? limit 3 offset ?',
    //         [req.body.type, req.body.subType, (req.body.page - 1)*3], (err, result) => {
    //             if (err) {
    //                 return res.status(500).json({ message: 'internal error! please try later'});
    //             }
    //             res.json(result);
    //         });
    // }
    // else if(req.body.subType==0){
    //     db.query('select *, PDATE(RegDate) as persianRegDate, PDATE(RegisterDeadLine) as persianRegisterDeadLine, ' +
    //         `PDATE(StartDate) as persianStartDate, PDATE(EndDate) as persianEndDate, concat('${global.baseUrl}', thumbnail) as thumbnailUrl ` +
    //         'from PAC_ProductAndCourse inner join (select fullName, userId from base_user) as t1 on t1.userId = PAC_ProductAndCourse.MasterId  where isSpecial=0 limit 3 offset ?',
    //         [(req.body.page - 1)*3], (err, result) => {
    //             if (err) {
    //                 return res.status(500).json({ message: 'internal error! please try later'});
    //             }
    //             res.json(result);
    //         });
    // }
    // else if(req.body.type==0){
    //     db.query('select *, PDATE(RegDate) as persianRegDate, PDATE(RegisterDeadLine) as persianRegisterDeadLine, ' +
    //         `PDATE(StartDate) as persianStartDate, PDATE(EndDate) as persianEndDate, concat('${global.baseUrl}', thumbnail) as thumbnailUrl ` +
    //         'from PAC_ProductAndCourse inner join (select fullName, userId from base_user) as t1 on t1.userId = PAC_ProductAndCourse.MasterId where PriceAfterDiscount=0 limit 3 offset ?',
    //         [ (req.body.page - 1)*3], (err, result) => {
    //             if (err) {
    //                 return res.status(500).json({ message: 'internal error! please try later'});
    //             }
    //             res.json(result);
    //         });
    // }
};
export const panel = (req, res) => {
    return res.sendFile(publicPath + 'panel.html');

    // if (req.params.isSample == 0 || req.params.isSample == 1) {
    //     let queryString = `select url from PAC_imageAndFile
    //     where ProductAndCourseId = ? and fileType = 1 and isSample = ?`;
    //     db.query(queryString, [req.params.ProductAndCourseId, req.params.isSample], (err, result) => {
    //         if (err) {
    //             return res.status(500).json({message: 'internal error! please try later'});
    //         }
    //         if (result[0].url) {
    //             fs.writeFileSync(global.baseUrl + 'index.html', result[0].url);
    //             return res.sendFile(global.baseUrl + 'index.html');
    //         } else {
    //             return res.status(404).json({message: 'video url not found!'});
    //         }
    //     });
    // } else {
    //     return res.status(400).json({message: 'bad request! isSample could either be 0 or 1'});
    // }
};