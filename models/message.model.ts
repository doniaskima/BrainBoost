import mongoose, { Schema, Document } from "mongoose";

interface IMessage extends Document {
  sender: mongoose.Schema.Types.ObjectId;
  receiver: mongoose.Schema.Types.ObjectId;
  iv: string;
  message: string;
  key: string;
  createdAt: Date;  
}

const messageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    iv: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now, // Set default value to current date and time
  },
  },
  { timestamps: true }
);

const Message = mongoose.model<IMessage>("messages", messageSchema);

export default Message;
