import {
  getRequests,
  createRequest,
  updateRequest as updateRequestAPI,
  deleteRequest as deleteRequestAPI,
} from "../services/eventService";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const EventRequestContext = createContext();
const POLL_INTERVAL_MS = 5000;

export function useEventRequests() {
  const context = useContext(EventRequestContext);
  if (!context) {
    throw new Error("useEventRequests must be used within an EventRequestProvider");
  }
  return context;
}

export function EventRequestProvider({ children }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = useCallback(async () => {
    try {
      const data = await getRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
    const timer = setInterval(loadRequests, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [loadRequests]);

  const addRequest = async (formData) => {
    try {
      await createRequest(formData);
      await loadRequests();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const updateRequest = async (id, formData) => {
    try {
      await updateRequestAPI(id, formData);
      await loadRequests();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

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
      value={{ requests, loading, addRequest, updateRequest, deleteRequest, refresh: loadRequests }}
    >
      {children}
    </EventRequestContext.Provider>
  );
}

export default EventRequestContext;
