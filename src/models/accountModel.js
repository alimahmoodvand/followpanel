/**
 * Created by ali on 8/11/18.
 */
import mongoose from 'mongoose';
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const accountSchema= {
    username: {type: String,index: {unique: true}},
    id: {type: String},
    password: {type: String},
    cookie: {type: String},
    firstFollower: {type: Number},
    firstFollowing: {type: Number},
    follower: {type: Number},
    following: {type: Number},
    image:{type:String},
    isPrivate:{type:Boolean},
    fullName:{type:String},
    step:{type:String},
    create: {type: String, default: new Date().getTime()},
    source:[],
    private:{type:Boolean},
    twicecomment:{type:Boolean},
    unfollow:{type:String},
    hours: {type: Number,default:24},
    limit: {type: Number,default:100},
    offset: {type: Number,default:0},
    comments:[],
    actions:[],
    minimumFollower: {type: Number,default:100},
    lastProcess: {type: Number},
};
const account=new Schema(accountSchema)

export const accountModel=mongoose.model('account',account);
export const insertAccount=async(text)=>{
    let account = new accountModel;
    account.step="setUsername";
    account.create=new Date().getTime().toString();
    await account.save();
    return account;
};
export const getAccounts=async()=> {
    let accounts = await accountModel.find({step:'complete'});
    return accounts;
};
export const getIncompleteAccount=async()=> {
    let account = await accountModel.findOne({step:{$ne:'complete'}});
    return account;
};
export const getIncompleteAccounts=async()=> {
    let accounts = await accountModel.find({step:{$ne:'complete'}});
    return accounts;
};
export const getAccount=async(_id)=> {
    let account = await accountModel.findOne({_id,step:{$ne:'delete'}});
    return account;
};
export const getAccountByUsername=async(username)=> {
    let account = await accountModel.findOne({username,step:{$ne:'delete'}});
    return account;
};
export const getRunningAccountByUsername=async(username)=> {
    let account = await accountModel.findOne({username,step:'running'});
    return account;
};
export const getRunningAccount=async()=> {
    let account = await accountModel.findOne({step:'running'});
    return account;
};
export const getAllAccounts=async()=> {
    let accounts = await accountModel.find({step:{$ne:'delete'}});
    return accounts;
};