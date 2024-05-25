import { Server, Socket } from "socket.io";


interface OnlineUser {
  userId: string;
  socketId: string;
}

interface IUser {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  pushTokens: Array<string>;
  picture: string;
  status: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

let onlineUsers: OnlineUser[] = [];

export default function (socket: Socket, io: Server) {

  socket.on("join", (userId) => {
    socket.join(userId);

    if (!onlineUsers.some((u) => u.userId === userId)) {
      onlineUsers.push({ userId: userId, socketId: socket.id });
    }

    io.emit("getOnlineUsers", onlineUsers);
    io.emit("setupSocket", socket.id);
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    io.emit("getOnlineUsers", onlineUsers);
  });

  socket.on("joinConversation", (conversation) => {
    socket.join(conversation);
  });

  socket.on("sendMessage", (message) => {
    let conversation = message.conversation;
    if (!conversation.users) return;
    conversation.users.forEach((user: IUser) => {
      if (user._id === message.sender._id) return;
      socket.in(user._id).emit("receiveMessage", message);
    });
  });

  socket.on("typing", (conversation) => {
    socket.in(conversation).emit("typing", conversation);
  });

  socket.on("stopTyping", (conversation) => {
    socket.in(conversation).emit("stopTyping");
  });

}
