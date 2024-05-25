import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

interface IConversation extends Document {
  _id: string;
  name: string;
  picture: string;
  isGroup: boolean;
  users: mongoose.Types.ObjectId[];
  latestMessage: mongoose.Types.ObjectId;
  admin: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  message: string;
  conversation: mongoose.Types.ObjectId;
  files: any[];
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Conversations name is required."],
      trim: true,
    },
    picture: {
      type: String,
      required: true,
    },
    isGroup: {
      type: Boolean,
      required: true,
      default: false,
    },
    users: [
      {
        type: ObjectId,
        ref: "User",
      },
    ],
    latestMessage: {
      type: ObjectId,
      ref: "Message",
    },
    admin: {
      type: ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);

export default Conversation;
