import { Document, model, Schema ,Types } from "mongoose";
import { User } from "./user.model";


interface IGroup extends Document {
  description?:string,
  isPublic:boolean,
  groupCode:number,
  name:string,
  members: Types.ObjectId[] ; 
  admin:Types.ObjectId ;
}


const groupSchema = new Schema<IGroup>(
    {
        admin:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        description:String,
        isPublic:Boolean,
        groupCode:{
            type:Number,
            required:true,
            unique:true,
        },
        members:[
            {
                type:Schema.Types.ObjectId,
                ref:"User",
            },
        ],
        name:{
            type:String,
            required:true,
        },
    },
    {
        timestamps :true
    }
);


export const Group = model<IGroup>("Group",groupSchema);


