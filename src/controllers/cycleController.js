/**
 * Created by ali on 8/15/18.
 */
import {getRunningAccount, getRunningAccountByUsername} from "../models/accountModel";
import {getSession, startFollow} from "./accountController";
const Client = require('instagram-private-api').V1;
import delay from 'delay';
import {getFollowByDestination, getFollowByStep, getPendingFollows, getUnfollowList} from "../models/followModel";
var diff = require('deep-diff').diff;

export const startFollowCycle=async()=>{
    let account=await getRunningAccount();
    //console.log(account.username)
    if(account) {
        let targets = await startFollow(account.username);
        startOperation(account,targets);
    }
};
export const startOperation=async(account,targets)=> {
    let session=getSession(account.username)
    try {
        let actions=account.actions.slice(1).concat(account.actions)
        for (let i = 0; i < targets.length; i++) {
            let acc=await getRunningAccount();
            if (!diff(acc,account)) {
                let user = targets[i];
                try {
                    console.log("index of usersnames", targets.length, i);
                    if (!user.isPrivate) {
                        let rand = Math.floor(Math.random() * actions.length);
                        let commentRand = Math.floor(Math.random() * account.comments.length);
                        console.log("isPublic => ", user.username, actions[rand], rand, commentRand)
                        if (actions[rand] === "follow") {
                            await Client.Relationship.create(session, user.id);
                            // await insertFollowing(acc, opr, user)
                        } else {
                            let userMed = await new Client.Feed.UserMedia(session, user.id);
                            let media = await userMed.get();
                            if (media[0] && media[0].id) {
                                if (actions[rand] === "comment") {
                                    let comment = account.comments[commentRand];
                                    // console.log( media[0].id, comment)
                                    await Client.Comment.create(session, media[0].id, comment);
                                } else if (actions[rand] === "like") {
                                    await Client.Like.create(session, media[0].id);
                                }
                            } else {
                                rand = actions.indexOf("follow")
                                await Client.Relationship.create(session, user.id);
                            }
                        }
                        user.action = actions[rand];
                        console.log(actions[rand] + " => ", user.username)
                    } else if (account.private) {
                        await Client.Relationship.create(session, user.id);
                        console.log("follow => ", user.username)
                        user.action = "follow";
                    }
                    else {
                        console.log("isPrivate => ", user.username)
                        user.action = "private";
                    }
                    user.step = 'pending';
                    user.endOfReport = new Date().addHours(24).getTime()
                    user.unfollowTime = new Date().addHours(account.hours).getTime();


                }
                catch (err) {
                    console.log(err, user.username);
                    user.action = "error";
                    user.step = "error";
                    if(blockError(err)){
                        await user.save()
                        break;
                    }
                }
                await user.save()
                let sleep = (Math.floor(Math.random() * 10) + 30) * 1000;
                await delay(sleep);
            }else{
                break;
            }
        }

        console.log("end first section")
        await delay(20000);
        startFollowCycle();
    } catch (err) {
        console.error(err)
    }
};
export const updateRelations=async()=> {
    let follows=await getPendingFollows(1000);
    let sessions={};
    let accounts={};
    for(let i=0;i<follows.length;i++){
        try{
        if(!sessions[follows[i].destination]){
            sessions[follows[i].destination]=getSession(follows[i].destination);
        }
        let session=sessions[follows[i].destination];
        if(!accounts[follows[i].destination]){
            accounts[follows[i].destination]=await getRunningAccountByUsername(follows[i].destination);
        }
        let account=accounts[follows[i].destination];
        if(account.unfollow=='system') {
            let relate = await Client.Relationship.get(session, follows[i].id)
            if (relate._params.followed_by) {
                follows[i].result = "followed"
                follows[i].step = 'finish';
                await follows[i].save();
                console.log(relate._params.followed_by, follows[i].username)
            }
            let sleep = (Math.floor(Math.random() * 2) + 1) * 1000;
            await delay(sleep);
        }
        }catch (err){
            console.log('updateRelations',err.message,follows[i].username)
            if(blockError(err))
                break;
            if(notFoundError(err)){
                follows[i].result = 'error';
                follows[i].step = 'finish';
            }
        }
    }
};
export const unfollowRelations=async()=> {
    // let account=await getRunningAccount();
    let follows=await getUnfollowList(1000);
    let sessions={};
    for(let i=0;i<follows.length;i++) {
        try {
            if (!sessions[follows[i].destination]) {
                sessions[follows[i].destination] = getSession(follows[i].destination);
            }
            let session = sessions[follows[i].destination];
            await Client.Relationship.destroy(session, follows[i].id)
            follows[i].unfollow = true;
            follows[i].step = 'finish';
            await follows[i].save();
            // console.log(relate._params.followed_by, follows[i].username)
            let sleep = (Math.floor(Math.random() * 2) + 1) * 1000;
            await delay(sleep);
        } catch (err) {
            console.log('unfollowRelations',err.message,follows[i].username)
            if(blockError(err))
                break;
            if(notFoundError(err)){
                follows[i].result = 'error';
                follows[i].step = 'finish';
            }
        }
    }
};

export const blockError=(err)=> {
    if (err.message && err.message.toLocaleLowerCase().indexOf('block') != -1) {
        return true;
    }
    else {
        return false;
    }
};
export const notFoundError=(err)=> {
    if (err.message && err.message.toLocaleLowerCase().indexOf("Page wasn't found!") != -1) {
        return true;
    }
    else {
        return false;
    }
};
export const reportPage=async(req,res)=> {
    //console.log(req)
    try {
        let follows = await getFollowByDestination(req.params.username ? req.params.username : req.body.username);
        let report = {
            source:req.params.username ? req.params.username : req.body.username,
            follow: 0,
            like: 0,
            comment: 0,
            error: 0,
            private: 0,
            response: 0,
            unfollow: 0,
            pending: 0
        };
        let defualtSubReport = {
            source:'',
            follow: 0,
            like: 0,
            comment: 0,
            error: 0,
            private: 0,
            response: 0,
            unfollow: 0,
            pending: 0
        };
        let subReports=[];
        for (let i = 0; i < follows.length; i++) {
            let subReport=null;
            let j = 0;
            for (; j < subReports.length; j++) {
                if(subReports[j].source==follows[i].source){
                    subReport=subReports[j];
                    break;
                }
            }
            if(!subReport){
                subReport=JSON.parse(JSON.stringify(defualtSubReport));
                subReports.push(subReport);
                j=subReports.length-1;
                subReports[j].source=follows[i].source;
            }
            if (follows[i].action){
                report[follows[i].action]++;
                subReports[j][follows[i].action]++;
            }
            if (follows[i].unfollow){
                report.unfollow++;
                subReports[j].unfollow++;
            }
            if (follows[i].step === "error") {
                subReports[j].error++;
                report.error++;
            } else if (follows[i].step === "finish"&& follows[i].result=='followed') {
                subReports[j].response++;
                report.response++;
            } else if (follows[i].step === "pending") {
                subReports[j].pending++;
                report.pending++;
            }
        }
        res.json({
            msg: 'ok',
            data: {
                report:{
                   total:report,
                    details:subReports
                }
            }
        })
    } catch (err) {
        res.json({
            msg: 'error',
            data: {
                error: err
            }
        })
    }
};
