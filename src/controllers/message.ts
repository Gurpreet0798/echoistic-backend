import createHttpError from "http-errors";
import { logger } from "../utils/index";
import { Request, Response, NextFunction } from "express";
import { Conversation, Message } from "../models/index";

const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { message, convoId, files } = req.body;

    if (!convoId || (!message && !files)) {
      logger.error("Please provider a conversation id and a message body");
      throw createHttpError.BadRequest("Please provider a conversation id and a message body");
    }

    const msgData = {
      sender: userId,
      message: message,
      conversation: convoId,
      files: files || [],
    };

    const newMessage = await Message.create(msgData);

    if (!newMessage) {
      throw createHttpError.BadRequest("Oops...Something went wrong !");
    }

    const msg = await Message.findById(newMessage._id)
      .populate({
        path: "sender",
        select: "name picture",
        model: "User",
      })
      .populate({
        path: "conversation",
        select: "name picture isGroup users",
        model: "Conversation",
        populate: {
          path: "users",
          select: "name email picture status",
          model: "User",
        },
      });

    if (!msg) {
      throw createHttpError.BadRequest("Oops...Something went wrong !");
    }

    const populatedMessage = msg;

    const updatedConvo = await Conversation.findByIdAndUpdate(convoId, {
      latestMessage: newMessage,
    });

    if (!updatedConvo) {
      throw createHttpError.BadRequest("Oops...Something went wrong !");
    }

    res.json(populatedMessage);
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const convoId = req.params.convoId;

    if (!convoId) {
      logger.error("Please add a conversation id in params.");
      throw createHttpError.BadRequest("Please add a conversation id");
    }

    const messages = await Message.find({ conversation: convoId })
      .populate("sender", "name picture email status")
      .populate("conversation");

    if (!messages) {
      throw createHttpError.BadRequest("Oops...Something went wrong !");
    }

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export default { sendMessage, getMessages };