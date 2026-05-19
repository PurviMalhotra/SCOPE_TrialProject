/* ==========================================================================
   EventRequestContext.jsx — Shared State for Event Requests
   ==========================================================================
   
   Provides:
   - requests        (array):    The current list of event requests
   - addRequest      (function): Add a new request from form submission data
   - updateRequest   (function): Update an existing request by ID
   - deleteRequest   (function): Delete a request by ID
   
   TODO [BACKEND]: Replace this context with API calls:
   - GET    /api/event-requests      → fetch all requests
   - POST   /api/event-requests      → create new request
   - PUT    /api/event-requests/:id  → update request
   - DELETE /api/event-requests/:id  → delete request
   ========================================================================== */

import {
  getRequests,
  createRequest,
  updateRequest as updateRequestAPI,
  deleteRequest as deleteRequestAPI,
} from "../services/eventService";
import { createContext, useContext, useEffect, useState } from "react";
import { INITIAL_REQUESTS } from "../constants";

const EventRequestContext = createContext();

/**
 * Custom hook to access the event request context.
 */
export function useEventRequests() {
  const context = useContext(EventRequestContext);
  if (!context) {
    throw new Error("useEventRequests must be used within an EventRequestProvider");
  }
  return context;
}

/**
 * EventRequestProvider — Wraps the app to provide shared event request state.
 */
export function EventRequestProvider({ children }) {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const loadRequests = async () => {
  try {
    const data = await getRequests();
    setRequests(data);
  } catch (err) {
    console.error(err);
  }
};
useEffect(() => {
  loadRequests();
}, []);
  

  /**
   * Add a new event request from form submission data.
   */
  const addRequest = async (formData) => {
  try {
    await createRequest(formData);

    await loadRequests();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

  /**
   * Update an existing event request by ID.
   */
  const updateRequest = async (id, formData) => {
  try {
    await updateRequestAPI(id, formData);

    await loadRequests();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

  /**
   * Delete an event request by ID.
   */
  const deleteRequest = async (id) => {
  try {
    await deleteRequestAPI(id);

    await loadRequests();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

  return (
    <EventRequestContext.Provider
      value={{ requests, addRequest, updateRequest, deleteRequest }}
    >
      {children}
    </EventRequestContext.Provider>
  );
}

export default EventRequestContext;
