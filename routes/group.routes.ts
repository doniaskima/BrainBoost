import express from "express";
import {
  fetchAllPublicGroups,
  createGroup,
  fetchMembers,
  removeMember,
  addMember,
  updateGroup,
  deleteGroup,
} from "../controllers/Group.controllers";

const router = express.Router();

router.get("/public_groups", fetchAllPublicGroups);
router.post("/create", createGroup);
router.get("/members/:groupId", fetchMembers);
router.post("/remove_member", removeMember);
router.post("/add_member", addMember);
router.put("/update_group", updateGroup);
router.delete("/:groupId", deleteGroup);

export default router;
