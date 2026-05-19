let history = [];
let nextHistoryId = 1;

const create = async (entry) => {
  const record = {
    id: nextHistoryId,
    ...entry,
    createdAt: new Date().toISOString(),
  };

  nextHistoryId += 1;
  history = [record, ...history];
  return record;
};

const listByRequestId = async (requestId) => {
  return history.filter((entry) => String(entry.requestId) === String(requestId));
};

module.exports = {
  create,
  listByRequestId,
};
