const express = require("express");
const ticketController = require("../controllers/ticketController");

const router = express.Router();
router.get("/", ticketController.getAll.bind(ticketController));
router.get("/open", ticketController.getOpen.bind(ticketController));
router.get("/search", ticketController.search.bind(ticketController));
router.post("/", ticketController.create.bind(ticketController));
router.get("/:id", ticketController.getById.bind(ticketController));
router.put("/:id", ticketController.update.bind(ticketController));
router.post(
  "/:id/comments",
  ticketController.addComment.bind(ticketController),
);

module.exports = router;
