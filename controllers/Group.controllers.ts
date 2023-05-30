import { Request , Response } from "express";
import Message from "@models/message.model";
import {Group} from "../models/group.model"
import User from "@models/user.model";
 
interface Error  {
    message: string;
}

const randomCode = (): number => Math.floor(Math.random() * (1000 - 1) + 1);

export const createGroup = async (req:Request,res:Response):Promise<Response>=>{
    const {adminId,groupName,isPublic,description}= req.body;
    const user = await User.findById(adminId);
    if(user){
        const newGroup = new Group({
            name: groupName,
            admin: adminId,
            groupCode: randomCode(),
            isPublic,
            description,
          });
          newGroup.members.push();
          const groupInfo = await newGroup.save();
          user.groups.push(groupInfo._id);
          await user.save();
          return res.json({
            status:true,
            message:"Group Created",
            group:groupInfo,
          })
    }
    return res.json({ status: false, message: "user not found" });
}

export const fetchAllPublicGroups = (req:Request, res:Response):void=>{
    Group.find({isPublic:true},"name _id description").then((groups)=>{
        return res.json({status:true,groups})
    }).catch((err)=>{
        console.log(err);
        return res.json({status:false, message: err.message});
    });
};

export const fetchMembers = async (req: Request, res: Response): Promise<Response> => {
const {groupId}= req.params;
const group = await Group.findById(groupId);
if(group){
    const members= await User.find(
        {_id:{$in:group.members}},
        "_id name email"
    );
     return res.json({status:true,members})
}
return res.json({status:false,message:"Invalid group id "})
}


export const addMember = async (req: Request, res: Response): Promise<Response> => {
    const {memberEmail,groupId}= req.body;
    const user = await User.findOne({email:memberEmail});
    if(user){
        const group = await Group.findById(groupId);
        if(group){
            group.members.push(user._id);
            await group.save();
            user.groups.push(groupId);
            await user.save();
            return res.json({
                status:true,
                message:"added to group"
            });
        }
        return res.json({
            status:false,
            message:"invalid group id",
            memberInfo: null,
        });
    }
    return res.json({
        status:false,
        message:"User not found",
        memberInfo:null,
    })
}

export const updateGroup = async (req: Request, res: Response): Promise<Response> => {
      const { groupId, name, description, isPublic } = req.body;
      const group = await Group.findById(groupId);
      if (group) {
        group.name = name;
        group.description = description;
        group.isPublic = isPublic;
        await group.save();
        return res.json({ status: true, message: "group updated" });
      }
      return res.json({ status: false, message: "Invalid group id" });
};


 export const removeMember = async (req: Request, res: Response): Promise<Response> => {
    try{
        const { groupId, memberId } = req.body;
        const group = await Group.findById(groupId);
        const user = await User.findById(memberId);
        let index = group?.members.indexOf(memberId);
        group?.members.slice(index,1);
        index = user?.groups.indexOf(groupId);
        user?.groups.slice(index,1);
        await user?.save();
        await group?.save();
        return res.json({ status: true, message: "member removed" });
    } catch (err) {
        console.log(err);
        return res.json({ status: false, message: "Invalid groupMember id" });
      }
  }

export const deleteGroup  = async (req:Request , res:Response)=>{
    const {groupId} = req.params;
    const group = await Group.findById(groupId);
    if(group){
        await User.updateMany(
            {
                _id : {$in : group.members}
            },
            {
                $pull : {
                    groups : group._id
                }
            }
        );
        await Message.deleteMany({receiver:group._id});
        Group.deleteOne({_id:groupId})
        .then(()=>{
            return res.json({status:false , message:"group deleted" });
        })
        .catch((err:Error)=>{
            console.log(err);
            return res.status(500).json({ status: false, message: err.message });
        })
    
    }

}


 