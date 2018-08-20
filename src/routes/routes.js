import {
    panel,
} from '../controllers/panelController';
import {
    login,
    getAccounts, updateSetting, followProcess, deleteAccount
} from '../controllers/accountController';
import {
    addToComments, deleteComment,
    getAllComments
} from '../controllers/commentController';
import {reportPage} from "../controllers/cycleController";
const routes = (app) => {
    // app.route('/panels')
    // .post(panels);
    app.route('/panel')
    .get(panel);
    app.route('/login')
    .post(login);
    app.route('/getaccounts')
    .post(getAccounts);
    app.route('/insertcomments')
    .post(addToComments);
    app.route('/getcomments')
    .post(getAllComments);
    app.route('/savesetting')
    .post(updateSetting);
    app.route('/deletecomment')
    .post(deleteComment);
    app.route('/deleteaccount')
    .post(deleteAccount);
    app.route('/followprocess')
    .post(followProcess);
    app.route('/report/:username')
        . get(reportPage);
    app.route('/report')
        . post(reportPage);
}

export default routes;
