import { Request , Response } from "express";
import { Group } from "@models/group.model";
import User from "@models/user.model";

const randomCode = (): number => Math.floor(Math.random() * (1000 - 1) + 1);

const createGroup = async (req:Request,res:Response):Promise<Response>=>{
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

const fetchAllPublicGroups = (req:Request, res:Response):void=>{
    Group.find({isPublic:true},"name _id description").then((groups)=>{
        return res.json({status:true,groups})
    }).catch((err)=>{
        console.log(err);
        return res.json({status:false, message: err.message});
    });
};

const fetchMembers = async (req: Request, res: Response): Promise<Response> => {
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