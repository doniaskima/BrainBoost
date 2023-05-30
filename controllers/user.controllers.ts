import { Request, Response } from "express";
import { deleteMessages,encrypt } from "./Message.controller";
import sanitize from "mongo-sanitize";
import { validateEmail, validateRegisterInput } from "@validations/user.validation";
import User from "@models/user.model";
import UserService from "@services/user.service";
import TokenService from "@services/token.service";
import LoggerService from "@services/logger.service";
import EmailService from "@services/email.service";
import SavedMessage from "@models/savedMessage.model";

// Define email address that will send the emails to your users.

export const getUser = (req: Request, res: Response) => {
  const user = req.user;

  res.status(200).send({ message: "User info successfully retreived", user });
};

export const postUser = async (req: Request, res: Response) => {
  // Validate Register input
  const { error } = validateRegisterInput(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  let sanitizedInput = sanitize<{ username: string; password: string; email: string }>(req.body);

  try {
    let user = await UserService.findUserBy("username", sanitizedInput.username.toLowerCase());

    if (user) {
      return res.status(400).send({ message: "Username already taken. Take an another Username" });
    }

    user = await UserService.findUserBy("email", sanitizedInput.email.toLowerCase());

    if (user) {
      return res.status(400).send({ message: "Email already registered. Take an another email" });
    }

    const newUser = UserService.createUser(sanitizedInput);
    await UserService.setUserPassword(newUser, newUser.password);
    try {
      await UserService.saveUser(newUser);
      const verificationToken = TokenService.createToken();
      TokenService.setUserId(verificationToken, newUser._id);
      TokenService.saveToken(verificationToken);
      const verificationEmail = EmailService.createVerificationEmail(
        newUser.email,
        verificationToken.token
      );
      try {
        EmailService.sendEmail(verificationEmail);

        return res.status(200).send({ message: "A verification mail has been sent." });
      } catch (error) {
        UserService.deleteUserById(newUser._id);

        return res.status(503).send({
          message: `Impossible to send an email to ${newUser.email}, try again. Our service may be down.`,
        });
      }
    } catch (error) {
      LoggerService.log.error(error);

      return res.status(500).send({ message: "Creation of user failed, try again." });
    }
  } catch (error) {
    LoggerService.log.error(error);

    return res.status(500).send("An unexpected error occurred");
  }
};

export const postUserCancel = (req: Request, res: Response) => {
  const { error } = validateEmail(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  const sanitizedInputs = sanitize<{ email: string }>(req.body);

  try {
    UserService.deleteUnverifiedUserByEmail(sanitizedInputs.email);
    return res.status(200).send({ message: "User reset success" });
  } catch (error) {
    return res.status(500).send("An unexpected error occurred");
  }
};


const saveMessage = async (userId: string, message: string) => {
  const user = await User.findOne({ _id: userId });

  if (!user) {
    throw new Error("User not found");
  }

  const encryptedMessage = encrypt(message);
  const newSavedMessage = new SavedMessage({
    owner: user._id,
    message: encryptedMessage.encryptedMessage,
    iv: encryptedMessage.iv,
    key: encryptedMessage.key,
  });
  const newMessage = await newSavedMessage.save();
  user.savedMessages.push(newMessage._id); // Update the property name here

  await user.save();

  let info = {
    iv: newMessage.iv,
    key: newMessage.key,
    message: newMessage.message,
    messageId: newMessage._id,
  };

  return info;
};


// const fetchSavedMessages = async (req: Request, res: Response) => {
//   const { userInfo } = req;
//   try {
//     const data = await SavedMessage.find({
//       _id: { $in: userInfo.savedMessages },
//     });

//     let result = [];
//     for (const msg of data) {
//       result.push({
//         iv: msg.iv,
//         key: msg.key,
//         message: msg.message,
//         messageId: msg._id,
//       });
//     }

//     return res.status(200).json({ success: true, savedMessages: result });
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

export default {
  getUser,
  postUser,
  postUserCancel,
  saveMessage,
   
};