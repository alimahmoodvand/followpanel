/**
 * Created by ali on 8/18/18.
 */
import mongoose from 'mongoose';
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const sourceSchema= {
    username: {type: String},
    destination: {type: String},
    id: {type: String},
    firstFollower: {type: Number},
    firstFollowing: {type: Number},
    follower: {type: Number},
    following: {type: Number},
    image:{type:String},
    isPrivate:{type:Boolean},
    fullName:{type:String},
    step:{type:String,default:'verify'},
    type:{type:String},
    create: {type: String, default: new Date().getTime()},
    limit: {type: Number,default:100},
    offset: {type: Number,default:0},
};

const source=new Schema(sourceSchema)

export const sourceModel=mongoose.model('source',source);
export const upsertSource=async(target,account)=>{
    // console.log({username:target.username,destination:target.username})
    let source = await sourceModel.findOne({username:target.username,destination:account.username});
    if(!source) {
        source = new sourceModel;
        source.username = target.username
        source.destination = account.username
        source.id = target.id
        source.image = target.hdProfilePicVersions && target.hdProfilePicVersions.length > 0 ?
            target.hdProfilePicVersions[0].url : target.picture;
        source.isPrivate = target.isPrivate
        source.fullName = target.fullName
        source.type = 'page'
        source.limit = account.limit
        source.offset = account.offset
        source.create = new Date().getTime().toString();
        await source.save();
    }
    return source;
};
export const getSources=async()=> {
    let sources = await sourceModel.find({step:'complete'});
    return sources;
};
export const getIncompleteSource=async()=> {
    let source = await sourceModel.findOne({step:{$ne:'complete'}});
    return source;
};
export const getIncompleteSources=async()=> {
    let sources = await sourceModel.find({step:{$ne:'complete'}});
    return sources;
};
export const getSource=async(_id)=> {
    let source = await sourceModel.findOne({_id});
    return source;
};
export const getSourceByUsername=async(username)=> {
    let source = await sourceModel.findOne({username});
    return source;
};
export const getRunningSourceByUsername=async(username)=> {
    let source = await sourceModel.findOne({username,step:'running'});
    return source;
};
export const getRunningSource=async()=> {
    let source = await sourceModel.findOne({step:'running'});
    return source;
};
export const getAllSources=async()=> {
    let sources = await sourceModel.find({});
    return sources;
};