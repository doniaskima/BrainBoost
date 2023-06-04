import { Router } from "express";
import UserController from "@controllers/user.controllers";


const router = Router();

router.get("/", UserController.getUser);

 
    /**
   * @openapi
   * '/api/user':
   *  post:
   *     tags:
   *     - User
   *     summary: Register a user
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *           schema:
   *              $ref: '#/components/schemas/CreateUserInput'
   *     responses:
   *      200:
   *        description: Success
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/CreateUserResponse'
   *      409:
   *        description: Conflict
   *      400:
   *        description: Bad request
   */


//  Input : username, email, password via body;
//  HTTP Success : 200 and message.
//  HTTP Errors : 400,500.
router.post("/register", UserController.postUser);

 
 
// Delete user with the email if is unverified
//  Input : email via body;
//  HTTP Success : 200 and message.
//  HTTP Errors : 400, 404, 500.
router.post("/register/cancel", UserController.postUserCancel);

// router.route("/delete_saved_message").delete( deleteSavedMessage);

 
router.get("/get_by_id/:userId",UserController.getById);
router.get("/get_by_id/:userId", UserController.getById);
router.get("/get_by_email/:email", UserController.getByEmail);
// router.get("/recipients/:userId", UserController.fetchRecipientsByIds);
// router.get("/groups/:userId", UserController.fetchGroupsByIds);
// router.get("/savedMessages/:userId", UserController.fetchSavedMessages);
// router.put("/update/:userId", UserController.updateUserDetails);
// router.delete("/deleteRecipient", UserController.deleteRecipient);
// router.delete("/:userId", UserController.deleteUser);

export default router;