"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAvailableSlots } from "../hooks/useAvailableSlots";
import { Appointment, Category, Service } from "../types/entities";

type UserDashboardContextValue = {
  categories: Category[];
  categoriesError: string | null;
  services: Service[];
  servicesError: string | null;
  serviceQuery: string;
  categoryId: number | null;
  categoryLocked: boolean;
  serviceId: number;
  date: string;
  selectedTime: string;
  bookingError: string | null;
  appointments: Appointment[];
  appointmentsError: string | null;
  editingId: number | null;
  editDate: string;
  editTime: string;
  notifications: string[];
  editSlots: string[];
  editSlotsError: string | null;
  slots: string[];
  slotsError: string | null;
  setCategoryId: (value: number | null) => void;
  setServiceId: (value: number) => void;
  setServiceQuery: (value: string) => void;
  setDate: (value: string) => void;
  setSelectedTime: (value: string) => void;
  setEditDate: (value: string) => void;
  setEditTime: (value: string) => void;
  handleBook: () => void;
  startEdit: (appointment: Appointment) => void;
  cancelEdit: () => void;
  saveEdit: (appointmentId: number) => void;
  deleteAppointment: (appointmentId: number) => void;
  refreshSlots: () => void;
};

const UserDashboardContext = createContext<UserDashboardContextValue | undefined>(
  undefined,
);

const API_URL = "http://localhost:4000";

export function UserDashboardProvider({
  enabled,
  lockedCategoryId = null,
  children,
}: {
  enabled: boolean;
  lockedCategoryId?: number | null;
  children: ReactNode;
}) {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [serviceQuery, setServiceQuery] = useState("");

  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [serviceId, setServiceId] = useState<number>(0);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [bookingError, setBookingError] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  const [notifications, setNotifications] = useState<string[]>([]);

  const { slots, error, refresh } = useAvailableSlots(
    serviceId,
    date,
    enabled,
    categoryId,
  );

  const editingAppointment = appointments.find(
    (appointment) => appointment.id === editingId,
  );
  const editCategoryId = editingAppointment?.categoryId ?? null;
  const editServiceId = editingAppointment?.serviceId ?? 0;
  const editDateValue = editDate || editingAppointment?.date || date;

  const {
    slots: editSlots,
    error: editSlotsError,
  } = useAvailableSlots(editServiceId, editDateValue, Boolean(editServiceId), editCategoryId);

  useEffect(() => {
    if (!enabled) return;

    if (lockedCategoryId !== null && Number.isFinite(lockedCategoryId)) {
      setCategoryId(lockedCategoryId);
    }

    fetch(`${API_URL}/api/auth/me`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data: { id: number }) => setCurrentUserId(data.id))
      .catch(() => setCurrentUserId(null));

    setCategoriesError(null);

    fetch(`${API_URL}/api/categories`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data: Category[]) => {
        setCategories(data);
        if (data.length > 0) {
          setCategoryId((prev) => prev ?? data[0].id);
          if (data[0].services?.length > 0) {
            setServiceId(data[0].services[0].id);
          }
        }
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Unknown error";
        setCategoriesError(message);
      })

    loadMyAppointments();
  }, [enabled, lockedCategoryId]);

  useEffect(() => {
    if (!categoryId) return;
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;
    if (category.services.length === 0) {
      setServices([]);
      setServiceId(0);
      return;
    }
    setServices(category.services);
    setServiceId(category.services[0].id);
    setServiceQuery("");
  }, [categoryId, categories]);

  useEffect(() => {
    if (!enabled || !categoryId) return;
    const query = serviceQuery.trim();
    const category = categories.find((c) => c.id === categoryId);
    if (!query) {
      const fallbackServices = category?.services ?? [];
      setServices(fallbackServices);
      if (fallbackServices.length === 0) {
        setServiceId(0);
      } else if (!fallbackServices.some((service) => service.id === serviceId)) {
        setServiceId(fallbackServices[0].id);
      }
      setServicesError(null);
      return;
    }

    setServicesError(null);
    fetch(
      `${API_URL}/api/categories/${categoryId}/services/search?q=${encodeURIComponent(query)}`,
      { credentials: "include" },
    )
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const message = data.message || `Request failed: ${res.status}`;
          throw new Error(message);
        }
        return res.json();
      })
      .then((data: Service[]) => {
        setServices(data);
        if (data.length === 0) {
          setServiceId(0);
        } else if (!data.some((service) => service.id === serviceId)) {
          setServiceId(data[0].id);
        }
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Unknown error";
        setServicesError(message);
        setServices([]);
      })
  }, [enabled, categoryId, categories, serviceQuery, serviceId]);

  const loadMyAppointments = () => {
    if (!enabled) return;
    fetch(`${API_URL}/api/appointments/my`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data: Appointment[]) => {
        setAppointments(data);
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Unknown error";
        setAppointmentsError(message);
      });
  };

  useEffect(() => {
    if (!enabled || !currentUserId) return;
    const wsUrl = `ws://${window.location.hostname}:4000?userId=${currentUserId}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (message) => {
      try {
        const event = JSON.parse(message.data) as {
          type: string;
          notification?: { title?: string; message?: string };
        };
        if (event.type === "user:notification") {
          const title = event.notification?.title ?? "Notification";
          const msg = event.notification?.message ?? "";
          setNotifications((prev) => [
            `${title}${msg ? `: ${msg}` : ""}`,
            ...prev,
          ]);
          loadMyAppointments();
          refresh();
        }
      } catch {
      }
    };

    return () => ws.close();
  }, [enabled, currentUserId, refresh]);

  const handleBook = async () => {
    if (!categoryId || !serviceId || !date || !selectedTime) return;
    setBookingError(null);
    try {
      const res = await fetch(`${API_URL}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          categoryId,
          serviceId,
          date,
          time: selectedTime,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Request failed: ${res.status}`);
      }
      await refresh();
      const list = await fetch(`${API_URL}/api/appointments/my`, {
        credentials: "include",
      }).then((r) => r.json());
      setAppointments(list);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setBookingError(message);
    } finally {
    }
  };

  const startEdit = (appointment: Appointment) => {
    setEditingId(appointment.id);
    setEditDate(appointment.date);
    setEditTime(appointment.time);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDate("");
    setEditTime("");
  };

  const saveEdit = async (appointmentId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/appointments/${appointmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ date: editDate, time: editTime }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Request failed: ${res.status}`);
      }
      const list = await fetch(`${API_URL}/api/appointments/my`, {
        credentials: "include",
      }).then((r) => r.json());
      setAppointments(list);
      cancelEdit();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setAppointmentsError(message);
    }
  };

  const deleteAppointment = async (appointmentId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/appointments/${appointmentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Request failed: ${res.status}`);
      }
      const list = await fetch(`${API_URL}/api/appointments/my`, {
        credentials: "include",
      }).then((r) => r.json());
      setAppointments(list);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setAppointmentsError(message);
    }
  };

  const value: UserDashboardContextValue = {
    categories,
    categoriesError,
    services,
    servicesError,
    serviceQuery,
    categoryId,
    categoryLocked: lockedCategoryId !== null && Number.isFinite(lockedCategoryId),
    serviceId,
    date,
    selectedTime,
    bookingError,
    appointments,
    appointmentsError,
    editingId,
    editDate,
    editTime,
    notifications,
    editSlots,
    editSlotsError,
    slots,
    slotsError: error,
    setCategoryId,
    setServiceId,
    setServiceQuery,
    setDate,
    setSelectedTime,
    setEditDate,
    setEditTime,
    handleBook,
    startEdit,
    cancelEdit,
    saveEdit,
    deleteAppointment,
    refreshSlots: refresh,
  };

  return (
    <UserDashboardContext.Provider value={value}>
      {children}
    </UserDashboardContext.Provider>
  );
}

export function useUserDashboard() {
  const context = useContext(UserDashboardContext);
  if (!context) {
    throw new Error("useUserDashboard must be used within UserDashboardProvider");
  }
  return context;
}
