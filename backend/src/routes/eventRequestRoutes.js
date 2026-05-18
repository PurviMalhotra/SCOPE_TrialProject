const express = require("express");
const eventRequestController = require("../controllers/eventRequestController");
const validate = require("../middleware/validateMiddleware");
const authorize = require("../middleware/authorizeMiddleware");
const ROLES = require("../constants/roles");
const { eventRequestSchema } = require("../validators/eventRequestValidators");

const router = express.Router();

router.get("/", eventRequestController.listRequests);
router.post("/", validate(eventRequestSchema), eventRequestController.createRequest);
router.get("/:id", eventRequestController.getRequest);
router.put("/:id", validate(eventRequestSchema), eventRequestController.updateRequest);
router.delete("/:id", eventRequestController.deleteRequest);
router.post("/:id/submit", eventRequestController.submitRequest);
router.post(
  "/:id/approve",
  authorize(ROLES.APPROVER, ROLES.ADMIN),
  eventRequestController.approveRequest
);
router.post(
  "/:id/reject",
  authorize(ROLES.APPROVER, ROLES.ADMIN),
  eventRequestController.rejectRequest
);
router.get("/:id/history", eventRequestController.getHistory);

module.exports = router;
