const REQUEST_STATUS = require("../constants/statuses");

const seedRequests = [
  {
    id: 1,
    topic: "Quantum Algorithms and Their Applications",
    code: "PH402",
    course: "Quantum Computing",
    lectureBy: "Foreign Expert",
    date: "Apr 22, 2026",
    status: REQUEST_STATUS.PENDING,
    formData: null,
    createdBy: "seed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    topic: "Building Scalable Startups in the Tech Industry",
    code: "MBA301",
    course: "Entrepreneurship and Startups",
    lectureBy: "VIT Alumni",
    date: "Apr 30, 2026",
    status: REQUEST_STATUS.PENDING,
    formData: null,
    createdBy: "seed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    topic: "International Trade Policies and Market Dynamics",
    code: "EC205",
    course: "Global Economic Trends",
    lectureBy: "Foreign Expert",
    date: "Mar 18, 2026",
    status: REQUEST_STATUS.REJECTED,
    formData: null,
    createdBy: "seed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    topic: "Deep Learning and Neural Network Architectures",
    code: "CS501",
    course: "Advanced Machine Learning",
    lectureBy: "Indian Expert",
    date: "May 15, 2026",
    status: REQUEST_STATUS.APPROVED,
    formData: null,
    createdBy: "seed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    topic: "CRISPR Technology and Gene Editing",
    code: "BT403",
    course: "Innovations in Biotechnology",
    lectureBy: "Indian Expert",
    date: "Jun 10, 2026",
    status: REQUEST_STATUS.APPROVED,
    formData: null,
    createdBy: "seed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 6,
    topic: "Navigating Software Engineering Careers",
    code: "CS201",
    course: "Career Pathways in Technology",
    lectureBy: "VIT Alumni",
    date: "Apr 25, 2026",
    status: REQUEST_STATUS.APPROVED,
    formData: null,
    createdBy: "seed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let requests = [...seedRequests];
let nextId = seedRequests.length + 1;

const findAll = async () => [...requests];

const findById = async (id) => {
  return requests.find((request) => String(request.id) === String(id)) || null;
};

const create = async (payload) => {
  const now = new Date().toISOString();
  const request = {
    ...payload,
    id: nextId,
    createdAt: now,
    updatedAt: now,
  };

  nextId += 1;
  requests = [request, ...requests];
  return request;
};

const update = async (id, payload) => {
  const existing = await findById(id);
  if (!existing) return null;

  const updated = {
    ...existing,
    ...payload,
    id: existing.id,
    updatedAt: new Date().toISOString(),
  };

  requests = requests.map((request) =>
    String(request.id) === String(id) ? updated : request
  );

  return updated;
};

const remove = async (id) => {
  const existing = await findById(id);
  if (!existing) return false;

  requests = requests.filter((request) => String(request.id) !== String(id));
  return true;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
