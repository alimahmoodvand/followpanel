import mongoose from 'mongoose';
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const followSchema= {
    username: {type: String},
    source: {type: String},
    destination: {type: String},
    id: {type: String},
    follow: {type: Number},
    following: {type: Number},
    image:{type:String},
    isPrivate:{type:Boolean},
    fullName:{type:String},
    step:{type:String},
    action:{type:String},
    create: {type: String, default: new Date().getTime()},
    unfollowTime: {type: Number,default:24},
    endOfReport: {type: Number},
    result: {type: String},
    unfollow:{type:Boolean,default:false}
};
const follow=new Schema(followSchema)
follow.index({username:1, source:1}, { unique: true });
export const followModel=mongoose.model('follow',follow);
export const getFollowByStep=async(step,limit)=> {
    if(!limit){
        limit=100;
    }
    let keys=Object.keys(followSchema);
    let rand=keys[ keys.length * Math.random() << 0]
    let sort={};
    sort[rand]=new Date().getTime()%2==0?-1:1;
    let follows = await followModel.find({step}).sort(sort).limit(limit)
    return follows;
};
export const getFollowByDestination=async(destination)=> {
    let follows = await followModel.find({destination})
    return follows;
};
export const getPendingFollows=async(limit)=> {
    if(!limit){
        limit=100;
    }
    let keys=Object.keys(followSchema);

    let rand=keys[ keys.length * Math.random() << 0]
    let sort={};
    sort[rand]=new Date().getTime()%2==0?-1:1;
    let follows = await followModel.find({step:'pending',unfollowTime:{$gt:parseFloat(new Date().getTime())}}).sort(sort).limit(limit)
    return follows;
};
export const getUnfollowList=async(limit)=> {
    if(!limit){
        limit=100;
    }
    let keys=Object.keys(followSchema);

    let rand=keys[ keys.length * Math.random() << 0]
    let sort={};
    sort[rand]=new Date().getTime()%2==0?-1:1;
    let query={$or:[
        {unfollow:false,unfollowTime:{$lt:parseFloat(new Date().getTime())}},
        {unfollow:{ $exists: false},unfollowTime:{$lt:parseFloat(new Date().getTime())}}
        ]};
    //console.log(query,sort)
    let follows = await followModel.find(query).sort(sort).limit(limit)
    return follows;
};