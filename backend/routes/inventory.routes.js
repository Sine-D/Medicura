import express from "express";
import * as inventoryController from "../controllers/inventory.controller.js";

const router = express.Router();

// CRUD Routes
router.post("/", inventoryController.createItem);
router.get("/", inventoryController.getAllItems);
router.get("/:id", inventoryController.getItemById);
router.put("/:id", inventoryController.updateItem);
router.delete("/:id", inventoryController.deleteItem);

// Specialized Query Routes
router.get("/expired", inventoryController.getExpiredItems);
router.get("/non-expired", inventoryController.getNonExpiredItems);
router.get("/supplier", inventoryController.getItemsBySupplier);
router.get("/low-stock", inventoryController.getLowStockItems);

export default router;
