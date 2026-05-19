const asyncHandler = require("../utils/asyncHandler");
const response = require("../utils/response");
const REQUEST_STATUS = require("../constants/statuses");
const eventRequestService = require("../services/eventRequestService");

const listRequests = asyncHandler(async (req, res) => {
  const requests = await eventRequestService.listRequests();
  return response.success(res, requests);
});

const getRequest = asyncHandler(async (req, res) => {
  const request = await eventRequestService.getRequestById(req.params.id);
  return response.success(res, request);
});

const createRequest = asyncHandler(async (req, res) => {
  const request = await eventRequestService.createRequest(req.body, req.user);
  return response.created(res, request, "Event request created");
});

const updateRequest = asyncHandler(async (req, res) => {
  const request = await eventRequestService.updateRequest(
    req.params.id,
    req.body,
    req.user
  );
  return response.success(res, request, "Event request updated");
});

const deleteRequest = asyncHandler(async (req, res) => {
  await eventRequestService.deleteRequest(req.params.id, req.user);
  return response.success(res, null, "Event request deleted");
});

const submitRequest = asyncHandler(async (req, res) => {
  const request = await eventRequestService.changeStatus(
    req.params.id,
    REQUEST_STATUS.PENDING,
    req.user,
    req.body.comment
  );
  return response.success(res, request, "Event request submitted");
});

const approveRequest = asyncHandler(async (req, res) => {
  const request = await eventRequestService.changeStatus(
    req.params.id,
    REQUEST_STATUS.APPROVED,
    req.user,
    req.body.comment
  );
  return response.success(res, request, "Event request approved");
});

const rejectRequest = asyncHandler(async (req, res) => {
  const request = await eventRequestService.changeStatus(
    req.params.id,
    REQUEST_STATUS.REJECTED,
    req.user,
    req.body.comment
  );
  return response.success(res, request, "Event request rejected");
});

const getHistory = asyncHandler(async (req, res) => {
  const history = await eventRequestService.listHistory(req.params.id);
  return response.success(res, history);
});

module.exports = {
  listRequests,
  getRequest,
  createRequest,
  updateRequest,
  deleteRequest,
  submitRequest,
  approveRequest,
  rejectRequest,
  getHistory,
};
