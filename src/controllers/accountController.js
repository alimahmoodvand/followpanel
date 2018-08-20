/**
 * Created by ali on 8/11/18.
 */
import fs from "fs";
const Client = require('instagram-private-api').V1;
import delay from 'delay';

import {
    accountModel, getAccount, getAccountByUsername, getAllAccounts, getRunningAccount,
    getRunningAccountByUsername
} from '../models/accountModel'
import {followModel, getFollowByStep} from "../models/followModel";
import {startFollowCycle} from "./cycleController";
import {upsertSource} from "../models/sourceModel";
export const login = async(req, res) => {
    console.log(req.body)
    try {

        let acc = new accountModel;
        acc.username = req.body.username;
        acc.password = req.body.password;
        acc.step = "complete";
        if(cookieExist(acc.username)){
            fs.unlinkSync(getFilePath(acc.username));
        }
        let client = await getInfo(acc.username, acc.password);
        console.log(client._params)
        client = client._params;
        acc.cookie = await getFilePath(acc.username);
        acc.firstFollower = client.followerCount;
        acc.firstFollowing = client.followingCount;
        acc.follower = client.followerCount;
        acc.following = client.followingCount;
        acc.image = client.hdProfilePicVersions && client.hdProfilePicVersions.length > 0 ?
            client.hdProfilePicVersions[0].url : client.picture;
        acc.fullName = client.fullName;
        acc.id = client.id;
        acc.create =new Date().getTime();
        // console.log(acc,msg)
        await acc.save()
        res.json({
            msg:'ok',
            data:{
                account:acc
            }
        })
    }catch (err){
        console.log(err)
        res.json({
            msg:'error',
            data:{
                error:[]
            }
        })
    }
    //res.json(req.body)
};
export const getAccounts=async(req,res)=> {
    try{
        let accs=await getAllAccounts();
        res.json({
            msg:'ok',
            data:{
                accounts:accs
            }
        })
    }catch (err){
        res.json({
            msg:'error',
            data:{
                error:err
            }
        })
    }
}
export const followProcess=async(req,res)=> {
    try{
        let running=await getRunningAccount();

        if(running&&req.body.step=='running')
        {
            res.json({
                msg:'error',
                data:{
                    error:{
                        message:'another process running ...'
                    }
                }
            })
        }else{
            let account = await getAccountByUsername(req.body.username)
            account.step = req.body.step
            account.lastProcess =new Date().getTime()
            await account.save();
            startFollowCycle();
            res.json({
                msg: 'ok',
                data: {
                    account: account
                }
            })
        }
    }catch (err){
        res.json({
            msg:'error',
            data:{
                error:err
            }
        })
    }
}
export const deleteAccount=async(req,res)=> {
    try{
        let running=await getRunningAccount();
        if(running&&req.body.accountId==running._id)
        {
            res.json({
                msg:'error',
                data:{
                    error:{
                        message:'process running ...'
                    }
                }
            })
        }else{
            let account = await getAccount(req.body.accountId);
            if(cookieExist(getFilePath(account.username))){
                fs.unlinkSync(getFilePath(account.username));
            }
            account.step='delete';
            await account.save();
            res.json({
                msg: 'ok',
                data: {
                    message: 'done'
                }
            })
        }
    }catch (err){
        console.log(err)
        res.json({
            msg:'error',
            data:{
                error:err
            }
        })
    }
}
export const updateSetting=async(req,res)=> {
    try{
        let acc=await getAccount(req.body.setting._id);
        Object.keys(req.body.setting).map((key)=>{
            if(key!='_id'){
                acc[key]=req.body.setting[key];
            }
        })
        await acc.save();
        //console.log(req.body.setting)
        res.json({
            msg:'ok',
            data:{
                account:acc
            }
        })
    }catch (err){
        res.json({
            msg:'error',
            data:{
                error:err
            }
        })
    }
}
export const getInfo=async(username,password)=> {
    let client=await getSession(username);
    if(!client){
        client=await loginAccount(username,password);
    }
    return await client.getAccount();
};
export const getSession=(username)=>{
    if(cookieExist(username)){
        let device = new Client.Device(username);
        let storage = new Client.CookieFileStorage(getFilePath(username));
        let client=new Client.Session(device, storage);
        return  client;
    }
    return null;
};
export const cookieExist=(username)=>{
    if (fs.existsSync(getFilePath(username)) && fs.readFileSync(getFilePath(username)).toString().trim()) {
        return true
    }
    return false;
}
export const loginAccount=async(username,password)=> {
    if(cookieExist(username)){
        fs.unlinkSync(getFilePath(username));
    }
    fs.closeSync(fs.openSync(getFilePath(username), 'w'));
    const device = new Client.Device(username);
    const storage = new Client.CookieFileStorage(getFilePath(username));
    //await Client.Request.setProxy('http://223.19.51.247:8197/');
    let session=await Client.Session.create(device, storage, username, password/*,
        'http://pptp:aPLiI54byf@51.15.151.165:80'*/);
    return session;
};
export const getFilePath=(username)=>{
    return rootPath + 'cookies/'+username+'.json';
};
export const startFollow=async(accountusername)=>{
    let account=await getRunningAccountByUsername(accountusername);
    if(account) {
        let targets = await getFollowByStep('notstarted');
        console.log('notstarted',targets.length)
        if (targets == 0) {
            await insertFollowers(accountusername);
            targets = await getFollowByStep('notstarted');
        }else {
            let tmp = []
            for (let i = 0; i < targets.length; i++) {
                if (account.source.indexOf(targets[i].source) == -1) {
                    await targets[i].remove()
                } else {
                    tmp.push(targets[i])
                }
            }
            console.log('notstarted after filter',tmp.length)
            targets=tmp;
        }
        return targets;
    }
    return [];
};
export const insertFollowers=async(username)=> {
    await delay(1500);
    let account=await getAccountByUsername(username);
    let session = getSession(account.username)
    for (let i = 0; i < account.source.length; i++) {
        let user=await Client.Account.searchForUser(session, account.source[i]);
        let source=await upsertSource(user._params,account);
        let followers = await getFollowers(session,source);
        source.offset+=source.limit;
        await source.save();
        for (let j = 0; j < followers.length ; j++) {
            let item = followers[j];
            try {
                let follow = new followModel;
                follow.username = item.username;
                follow.source = account.source[i];
                follow.destination = account.username;
                follow.id = item.id;
                follow.image = item.hdProfilePicVersions && item.hdProfilePicVersions.length > 0 ?
                    item.hdProfilePicVersions[0].url : item.picture;
                follow.isPrivate = item.isPrivate;
                follow.fullName = item.fullName;
                follow.step = 'notstarted';
                follow.create = new Date().getTime();
                await follow.save();

            }catch (err){
                console.log('error inserted',j)
            }
        }
    }
    //account.offset+=account.limit;
    await account.save();
};
export const getFollowers=async(session,source)=>{
    let feeds = await new Client.Feed.AccountFollowers(session, source.id, 100000);
    let followers=[];
    let parts=[];
    let isFirst=true;
    let offset=1;
    let end=source.offset+source.limit;
    let start=source.offset;

    while (isFirst||(parts.length>0&&followers.length<(end-start))){

        isFirst=false;
        parts=[];
        parts=await feeds.get();
        // console.log(parts[0])
        // process.exit(0)
        let tmp=[];
        if(offset>=start) {
            parts.map((item)=>{
                    tmp.push(item._params);
            })
            followers = followers.concat(tmp)
        }
        console.log(parts.length,tmp.length,offset,start,end,followers.length)
        offset+=parts.length
    }
    followers.splice((end-start));
   // console.log(followers.length)
    return followers;
};