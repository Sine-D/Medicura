import express from "express";
import cartController from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/:email", cartController.getCart);
router.post("/:email/items", cartController.addItem);
router.put("/:email/items", cartController.updateItem);
router.delete("/:email/items/:itemId", cartController.removeItem);
router.delete("/:email", cartController.clearCart);

export default router;
