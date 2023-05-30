import express, { Router } from "express";
import {
    getMessages,
    getGroupMessages,
    deleteMessageById
} from "../controllers/Message.controller";

const router: Router = express.Router();
router.post("/get_messages", getMessages);
router.post("/get_group_messages", getGroupMessages);
router.delete("/:messageId", deleteMessageById);

export default router;