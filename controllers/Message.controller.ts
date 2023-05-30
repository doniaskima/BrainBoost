import Group from "../models/group.model";
import Message from "../models/message.model";
import User from "../models/user.model";
import crypto from "crypto";

const encrypt = (message: string) => {
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  let encryptedMessage = cipher.update(message);
  encryptedMessage = Buffer.concat([encryptedMessage, cipher.final()]);
  return {
    iv: iv.toString("hex"),
    encryptedMessage: encryptedMessage.toString("hex"),
    key: key.toString("hex"),
  };
};

const createMessage = async (senderId: string, receiverEmail: string, message: string) => {
  let info = null;
  let isNewRecipient = false;
  const user = await User.findOne({ _id: senderId }).catch((err: Error) => {
    console.log(err);
  });
  if (user) {
    const receiver = await User.findOne({ email: receiverEmail });
    if (receiver) {
      if (!receiver.chats.includes(senderId)) {
        isNewRecipient = true;
        receiver.chats.push(senderId);
        await receiver.save();
      }
      const encryptedMessage = encrypt(message);
      const newMessage = new Message({
        sender: senderId,
        receiver: receiver._id,
        message: encryptedMessage.encryptedMessage,
        iv: encryptedMessage.iv,
        key: encryptedMessage.key,
      });
      await newMessage.save();
      info = {
        sender: { username: user.username, email: user.email, _id: user._id },
        receiver: {
          username: receiver.username,
          _id: receiver._id,
          email: receiver.email,
        },
        iv: newMessage.iv,
        key: newMessage.key,
        message: newMessage.message,
        messageId: newMessage._id,
      };
    }
  }
  return { info, isNewRecipient };
};

const createGroupMessage = async (senderId: string, groupId: string, message: string) => {
  let info = null;
  const user = await User.findOne({ _id: senderId }).catch((err: Error) => {
    console.log(err);
  });
  if (user) {
    const group = await Group.findOne({ _id: groupId });
    if (group) {
      const encryptedMessage = encrypt(message);
      const newMessage = new Message({
        sender: senderId,
        receiver: group._id,
        message: encryptedMessage.encryptedMessage,
        iv: encryptedMessage.iv,
        key: encryptedMessage.key,
      });
      await newMessage.save();
      info = {
        sender: { username: user.username, email: user.email, _id: user._id },
        iv: newMessage.iv,
        key: newMessage.key,
        message: newMessage.message,
        messageId: newMessage._id,
      };
    }
  }
  return info;
};
