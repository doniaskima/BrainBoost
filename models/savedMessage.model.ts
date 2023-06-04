import mongoose, { Schema, Document } from "mongoose";

interface ISavedMessage extends Document {
  owner: mongoose.Schema.Types.ObjectId;
  message: string;
  iv: string;
  key: string;
  createdAt: Date;  
}

const savedMessageSchema: Schema = new Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    iv: {
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

const SavedMessage = mongoose.model<ISavedMessage>(
  "savedMessages",
  savedMessageSchema
);

export default SavedMessage;
