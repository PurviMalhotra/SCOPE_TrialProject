const REQUEST_STATUS = require("../constants/statuses");
const LECTURE_TYPE_LABELS = require("../constants/lectureTypes");
const AppError = require("../utils/AppError");
const requestRepository = require("../repositories/eventRequestRepository");
const historyRepository = require("../repositories/requestHistoryRepository");

const formatDateForDashboard = (eventDate) => {
  if (!eventDate) {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  const date = new Date(`${eventDate}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const toDashboardRecord = (formData, userId, status = REQUEST_STATUS.PENDING) => ({
  topic: formData.lectureTitle,
  code: formData.courseCode,
  course: formData.courseTitle,
  lectureBy: LECTURE_TYPE_LABELS[formData.lectureType] || "Indian Expert",
  date: formatDateForDashboard(formData.eventDate),
  status,
  formData: { ...formData },
  createdBy: userId,
});

const listRequests = async () => {
  return requestRepository.findAll();
};

const getRequestById = async (id) => {
  const request = await requestRepository.findById(id);
  if (!request) {
    throw new AppError("Event request not found", 404);
  }

  return request;
};

const createRequest = async (formData, actor) => {
  const payload = toDashboardRecord(formData, actor.id);
  const request = await requestRepository.create(payload);

  await historyRepository.create({
    requestId: request.id,
    action: "CREATED",
    status: request.status,
    actorId: actor.id,
    actorEmail: actor.email,
  });

  return request;
};

const updateRequest = async (id, formData, actor) => {
  const existing = await getRequestById(id);

  if (existing.status === REQUEST_STATUS.APPROVED) {
    throw new AppError("Approved requests cannot be edited", 409);
  }

  const payload = toDashboardRecord(formData, existing.createdBy, existing.status);
  const updated = await requestRepository.update(id, payload);

  await historyRepository.create({
    requestId: updated.id,
    action: "UPDATED",
    status: updated.status,
    actorId: actor.id,
    actorEmail: actor.email,
  });

  return updated;
};

const deleteRequest = async (id, actor) => {
  const existing = await getRequestById(id);

  if (existing.status === REQUEST_STATUS.APPROVED) {
    throw new AppError("Approved requests cannot be deleted", 409);
  }

  await requestRepository.remove(id);
  await historyRepository.create({
    requestId: id,
    action: "DELETED",
    status: existing.status,
    actorId: actor.id,
    actorEmail: actor.email,
  });
};

const changeStatus = async (id, status, actor, comment = "") => {
  const existing = await getRequestById(id);
  const updated = await requestRepository.update(id, { status });

  await historyRepository.create({
    requestId: existing.id,
    action: status === REQUEST_STATUS.APPROVED ? "APPROVED" : "REJECTED",
    fromStatus: existing.status,
    status,
    comment,
    actorId: actor.id,
    actorEmail: actor.email,
  });

  return updated;
};

const listHistory = async (id) => {
  await getRequestById(id);
  return historyRepository.listByRequestId(id);
};

module.exports = {
  listRequests,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest,
  changeStatus,
  listHistory,
};
