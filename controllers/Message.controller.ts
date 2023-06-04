import { Group } from "@models/group.model";
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
  let info: any = null;
  let isNewRecipient = false;
  const user = await User.findOne({ _id: senderId }).catch((err: any) => {
    console.log(err);
  });
  if (user) {
    const receiver = await User.findOne({ email: receiverEmail });
    if (receiver) {
      // if (!receiver.chats.includes(senderId)) {
      //   isNewRecipient = true;
      //   receiver.chats.push(senderId);
      //   await receiver.save();
      // }
      const encryptedMessage = encrypt(message);
      const newMessage = new Message({
        sender: senderId,
        receiver: receiver._id,
        message: encryptedMessage.encryptedMessage,
        iv: encryptedMessage.iv,
        key: encryptedMessage.key,
        createdAt: new Date(), // Set createdAt to current date and time
      });
      await newMessage.save();
      info = {
        sender: { name: user.name, email: user.email, _id: user._id },
        receiver: {
          name: receiver.name,
          _id: receiver._id,
          email: receiver.email,
        },
        iv: newMessage.iv,
        key: newMessage.key,
        message: newMessage.message,
        createdAt: newMessage.createdAt, // Access the createdAt property of newMessage
        messageId: newMessage._id,
      };
    }
  }
  return { info, isNewRecipient };
};


const createGroupMessage = async (senderId: string, groupId: string, message: string) => {
  let info: any = null;
  const user = await User.findOne({ _id: senderId }).catch((err: any) => {
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
        createdAt: new Date(), // Set createdAt to current date and time
      });
      await newMessage.save();
      info = {
        sender: { name: user.name, email: user.email, _id: user._id },
        iv: newMessage.iv,
        key: newMessage.key,
        message: newMessage.message,
        createdAt: newMessage.createdAt, 
        messageId: newMessage._id,
      };
    }
  }
  return info;
};

const startMessage = async (senderId: string, receiverEmail: string) => {
  const user = await User.findOne({ _id: senderId });
  if (user) {
    const receiver = await User.findOne({ email: receiverEmail });
    if (receiver) {
      // if (!user.chats.includes(senderId) && user._id !== receiver._id) {
      //   user.chats.push(receiver._id);
      //   await user.save()
      //     .then(() => {
      //       return true;
      //     })
      //     .catch(() => {
      //       return null;
      //     });
      // }
    } else {
      return null;
    }
  } else {
    return null;
  }
};

const getMessages = (req: any, res: any) => {
  const { userId, receiverId } = req.body;
  User.findOne({ _id: userId }, (err: any, user: any) => {
    if (err) {
      return res.status(500).json({ status: false, message: err.message });
    } else if (!user) {
      return res.json({ status: false, message: "user not exist" });
    } else {
      User.findOne({ _id: receiverId }, (err: any, receiver: any) => {
        if (err) {
          return res.status(500).json({ status: false, message: err.message });
        } else if (!receiver) {
          return res.status().json({ status: false, message: "receiver not exist" });
        } else {
          Message.find({ sender: userId, receiver: receiverId })
            .then((messagesSentBySender: any) => {
              Message.find(
                { sender: receiverId, receiver: userId },
                (err: any, messagesSentByReceiver: any) => {
                  let conversation = messagesSentBySender.concat(
                    messagesSentByReceiver
                  );
                  conversation.sort((a: any, b: any) => {
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                  });
                  let result: any[] = [];
                  conversation.forEach((message: any) => {
                    let info: any;
                    if (String(message.sender) === String(userId)) {
                      info = {
                        sender: {
                          name: user.name,
                          email: user.email,
                          id: user._id,
                        },
                        receiver: {
                          name: receiver.name,
                          email: receiver.email,
                          id: receiver._id,
                        },
                        iv: message.iv,
                        key: message.key,
                        message: message.message,
                        createdAt: message.createdAt,
                        messageId: message._id,
                      };
                    } else {
                      info = {
                        receiver: {
                          name: user.name,
                          email: user.email,
                          id: user._id,
                        },
                        sender: {
                          name: receiver.name,
                          email: receiver.email,
                          id: receiver._id,
                        },
                        iv: message.iv,
                        key: message.key,
                        createdAt: message.createdAt,
                        message: message.message,
                        messageId: message._id,
                      };
                    }
                    result.push(info);
                  });
                  return res.json({ status: true, messages: result });
                }
              );
            })
            .catch((err: any) => {
              console.log(err);
              return res.json({ status: false, message: err.message });
            });
        }
      });
    }
  });
};

const deleteMessageById = (req: any, res: any) => {
  const { messageId } = req.params;
  Message.findByIdAndDelete(messageId)
    .then(() => {
      return res.json({ status: true, message: "message deleted" });
    })
    .catch((err: any) => {
      console.log(err);
      return res.json({ status: false, message: err.message });
    });
};

const deleteMessages = (senderId: string, receiverId: string) => {
  Message.deleteMany({ sender: senderId, receiver: receiverId })
    .then(() => {
      const boolResult = Message.deleteMany({
        receiver: senderId,
        sender: receiverId,
      })
        .then(() => {
          return true;
        })
        .catch((err: any) => {
          console.log(err);
          return false;
        });
      return boolResult;
    })
    .catch((err: any) => {
      console.log(err);
      return false;
    });
};

const getGroupMessages = (req: any, res: any) => {
  const { userId, groupId } = req.body;
  User.findOne({ _id: userId }, (err: any, user: any) => {
    if (err) {
      return res.json({ status: false, message: err.message });
    }
    if (!user) {
      return res.json({ status: false, message: "user not found" });
    }
    Group.findById(groupId, (err: any, group: any) => {
      if (err) {
        return res.json({ status: false, message: err.message });
      }
      if (!group) {
        return res.json({ status: false, message: "group not found" });
      }
      Message.find({ receiver: group._id })
        .then(async (messages: any) => {
          // Now, for each msg find out the sender
          let result: any[] = [];
          for (const msg of messages) {
            if (String(msg.sender) !== String(user._id)) {
              // if the sender is not the current request client
              const _user = await User.findById(msg.sender);
              if (_user !== null) {
                result.push({
                  sender: { id: _user._id, name: _user.name },
                  iv: msg.iv,
                  key: msg.key,
                  message: msg.message,
                  createdAt: msg.createdAt,
                  messageId: msg._id,
                });
              }
              
            } else {
              result.push({
                sender: { id: user._id, name: user.name },
                iv: msg.iv,
                key: msg.key,
                message: msg.message,
                createdAt: msg.createdAt,
                messageId: msg._id,
              });
            }
          }
          return res.json({ status: true, messages: result });
        })
        .catch((err: any) => {
          return res.json({ status: false, message: err.message });
        });
    });
  });
};

export {
  getMessages,
  createGroupMessage,
  createMessage,
  deleteMessages,
  deleteMessageById,
  getGroupMessages,
  startMessage,
  encrypt,
};
