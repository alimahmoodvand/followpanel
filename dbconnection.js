/**
 * Created by ali on 8/11/18.
 */
import mongoose from 'mongoose';

const connection=mongoose.connect('mongodb://localhost:27017/raazfollowerpanel');




module.exports=connection;