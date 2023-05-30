import mongoose , {Schema , Document} from "mongoose";


interface ISavedMessage extends Document {
    owner:mongoose.Schema.Types.ObjectId;
    message:string;
    iv:string;
    key:string;
}

const savedMessage = new Schema<ISavedMessage>(
    {
       owner:{
        type:Schema.Types.ObjectId,
       },
       message:{
        type:String,
        required:true,
       },
       key:{
        type:String,
        required:true
       },
       iv:{
        type:String,
        required:true
       }  
    },
    {timestamps:true}
);

const SaveMsg = mongoose.model<ISavedMessage>("savedmessages",savedMessage);

export default SaveMsg ;