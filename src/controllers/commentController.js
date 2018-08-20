/**
 * Created by ali on 8/12/18.
 */
/**
 * Created by ali on 8/6/18.
 */
import {getComment, getComments, insertComments} from "../models/commentModel";

export const addToComments=async(req,res)=> {
    try {
        await insertComments(req.body.comments);
        res.json({
            msg:'ok',
            data:{
            }
        })
    }catch (err){
        console.log(err)
        res.json({
            msg:'error',
            data:{
                error:err
            }
        })
    }
};
export const getAllComments=async(req,res)=> {
    try {
        let comments=await getComments()
        res.json({
            msg:'ok',
            data:{
                comments
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
};
export const deleteComment=async(req,res)=> {
    try {
        let targetComment = await getComment(req.body.commentId);
        await targetComment.remove();
        res.json({
            msg:'ok',
            data:{
            }
        })
    } catch (err) {
        console.log(err)
        res.json({
            msg: 'error',
            data: {
                error: err
            }
        })
    }
};