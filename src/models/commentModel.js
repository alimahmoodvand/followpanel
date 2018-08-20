/**
 * Created by ali on 8/12/18.
 */
import mongoose from 'mongoose';
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const commentSchema= {
    comment: {type: String},
    create: {type: String, default:new Date().getTime()},
};
const comment=new Schema(commentSchema)

export const commentModel=mongoose.model('comment',comment);
export const insertComment=async(text)=> {
    let comment = new commentModel;
    comment.comment=text;
    comment.create=new Date().getTime().toString();
    await comment.save();
    return comment;
};
export const insertComments=async(comments)=> {
    for(let i=0;i<comments.length;i++){
        await insertComment(comments[i])
    }
};
export const getComments=async()=> {
    let comments = await commentModel.find({});
    return comments;
};
export const getComment=async(_id)=> {
    let comment = await commentModel.findOne({_id});
    return comment;
};