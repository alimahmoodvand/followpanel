/**
 * Created by ali on 8/11/18.
 */
    import express from 'express';
    import delay from 'delay';
    import bodyParser from 'body-parser';

import routes from './src/routes/routes';
    import {startFollowCycle, unfollowRelations, updateRelations} from "./src/controllers/cycleController";
import {getSession} from "./src/controllers/accountController";
    const app = express();
    const PORT = 1081;
    var CronJob = require('cron').CronJob;
const Client = require('instagram-private-api').V1;

Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
}
let init=async()=> {
    await delay(5000);

    global.rootPath = __dirname + "/";
    global.publicPath = __dirname + "/public/views/";
    global.baseUrl = 'http://dibanzh.raaz.co/images/dibanzh/thumbnails/';
    global.userBaseUrl = 'http://199.127.99.12:' + PORT;
// bodyparser setup
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());

    app.use(express.static(__dirname + '/public'));
    app.set('views', __dirname + '/public/views');
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');
    let session =await getSession('tanaz_kianmehr');
    //let user=await Client.Hashtag.search(session, 'tehran');
    // console.log(user[0])
  //  var feeds = new Client.Feed.TaggedMedia(session,'tehran');

    // let feeds = await new Client.Feed.AccountFollowers(session, user[0]._params.id, 100000);
    // var  feed=(await feeds.get())[0]
    // console.log(feed)
    // return;
    routes(app);

// app.use(express.static(__dirname+'/public'));

    app.get('/', (req, res) =>
        res.send(`Node and express server is running on port ${PORT}`)
    );

    app.listen(PORT, () =>
        console.log(`your server is running on port ${PORT}`, `panel address ${userBaseUrl}`)
    );
   new CronJob('0 */15 * * * *',()=>{
       console.log('updateRelations',new Date());
       updateRelations();
   }, null, true, 'Asia/Tehran')
    new CronJob('0 */10 * * * *',()=>{
        console.log('unfollowRelations',new Date());
        unfollowRelations()
    }, null, true, 'Asia/Tehran')
    startFollowCycle();
    process.on('unhandledRejection', (reason, p) => {
        console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
        // application
        // specific logging, throwing an error, or other logic here
    });
    // try {
    //     var proxyUrl = 'http://vpnlike3322601:2839@kh3.serverlike.in:7080';
    //
    //     var proxiedRequest = request.defaults({'proxy': proxyUrl});
    //     proxiedRequest.get("http://google.com", function (err, resp, body) {
    //         console.log(err)
    //     })
    // }catch (err){
    //
    // }
};
init()