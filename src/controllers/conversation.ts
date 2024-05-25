import createHttpError from "http-errors";
import { logger } from "../utils/index";
import { Request, Response, NextFunction } from "express";
import { User, Conversation } from "../models/index";

const createConversation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const senderId = req.user?.userId;
    const { receiverId, isGroup } = req.body;

    if (isGroup == false) {
      if (!receiverId) {
        logger.error("please provide receiver id to start a conversation");
        throw createHttpError.BadGateway("Oops...Something went wrong !");
      }

      let convos = await Conversation.find({
        isGroup: false,
        $and: [
          { users: { $elemMatch: { $eq: senderId } } },
          { users: { $elemMatch: { $eq: receiverId } } },
        ],
      }).populate("users", "-password").populate("latestMessage");

      if (!convos) {
        throw createHttpError.BadRequest("Oops...Something went wrong !");
      }

      convos = await User.populate(convos, {
        path: "latestMessage.sender",
        select: "name email picture status",
      });

      const existedConversation = convos[0];

      if (existedConversation) {
        res.json(existedConversation);
      } else {
        let convoData = {
          name: "conversation name",
          picture: "",
          isGroup: false,
          users: [senderId, receiverId],
        };
        const newConvo = await Conversation.create(convoData);

        if (!newConvo) {
          throw createHttpError.BadRequest("Oops...Something went wrong !");
        }

        const populatedConvo = await Conversation.findOne({ id: newConvo._id }).populate("users", "-password");

        if (!populatedConvo) {
          throw createHttpError.BadRequest("Oops...Something went wrong !");
        }

        res.status(200).json(populatedConvo);
      }
    } else {
      //it's a group chat
      let convo = await Conversation.findById(isGroup)
        .populate("users admin", "-password")
        .populate("latestMessage");

      if (!convo)
        throw createHttpError.BadRequest("Oops...Something went wrong !");

      convo = await User.populate(convo, {
        path: "latestMessage.sender",
        select: "name email picture status",
      });

      const existedGroupConversation = convo;

      res.status(200).json(existedGroupConversation);
    }
  } catch (error) {
    next(error);
  }
};

const getConversations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    let conversations = await Conversation.find({
      users: { $elemMatch: { $eq: userId } },
    })
      .populate("users", "-password")
      .populate("admin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    conversations = await User.populate(conversations, {
      path: "latestMessage.sender",
      select: "name email picture status",
    });

    if (!conversations) {
      throw createHttpError.BadRequest("Oops...Something went wrong !");
    }

    res.status(200).json(conversations);

  } catch (error) {
    next(error);
  }
};

const createGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const { name, users } = req.body;

    if (!name || !users) {
      throw createHttpError.BadRequest("Please fill all fields.");
    }

    //add current user to users
    users.push(req.user?.userId);

    if (users.length < 2) {
      throw createHttpError.BadRequest(
        "Atleast 2 users are required to start a group chat."
      );
    }

    let convoData = {
      name,
      users,
      isGroup: true,
      admin: req.user?.userId,
      picture: "",
    };

    const newConvo = await Conversation.create(convoData);

    if (!newConvo) {
      throw createHttpError.BadRequest("Oops...Something went wrong !");
    }

    const populatedConvo = await Conversation.findOne({ _id: newConvo._id }).populate(
      "users admin",
      "-password"
    );

    if (!populatedConvo) {
      throw createHttpError.BadRequest("Oops...Something went wrong !");
    }

    res.status(200).json(populatedConvo);
  } catch (error) {
    next(error);
  }
};

export default { createConversation, getConversations, createGroup };