import mongoose, { Document } from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

interface IMessage extends Document {
  _id: string;
  sender: mongoose.Types.ObjectId;
  message: string;
  conversation: mongoose.Types.ObjectId;
  files: any[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: ObjectId,
      ref: "User",
    },
    message: {
      type: String,
      trim: true,
    },
    conversation: {
      type: ObjectId,
      ref: "Conversation",
    },
    files: [],
  },
  {
    timestamps: true,
  }
);

const Message =
  mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);

export default Message;
