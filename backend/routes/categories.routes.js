const express = require("express");
const {
  listCategories,
  createCategory,
  deleteCategory
} = require("../controllers/categories.controller");
const { verifyToken, requirePermission } = require("../middlewares/auth");

const router = express.Router();

router.get("/", listCategories);
router.post("/", verifyToken, requirePermission("products"), createCategory);
router.delete("/:id", verifyToken, requirePermission("products"), deleteCategory);

module.exports = router;
