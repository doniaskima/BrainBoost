import mongoose, { Schema, Document } from "mongoose";

interface ISavedMessage extends Document {
  owner: mongoose.Schema.Types.ObjectId;
  message: string;
  iv: string;
  key: string;
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
  },
  { timestamps: true }
);

const SavedMessage = mongoose.model<ISavedMessage>(
  "savedMessages",
  savedMessageSchema
);

export default SavedMessage;
