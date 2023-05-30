import mongoose, { Schema, Document } from "mongoose";

interface IMessage extends Document {
  sender: mongoose.Schema.Types.ObjectId;
  receiver: mongoose.Schema.Types.ObjectId;
  iv: string;
  message: string;
  key: string;
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
  },
  { timestamps: true }
);

const Message = mongoose.model<IMessage>("messages", messageSchema);

export default Message;
