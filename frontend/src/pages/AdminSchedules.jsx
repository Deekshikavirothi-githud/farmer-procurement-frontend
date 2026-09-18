
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Wheat,
  Users,
  Plus,
  RefreshCw,
  X,
  Search,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import API from "../api";

const emptyForm = {
  centre_id: "",
  crop_name: "",
  date: "",
  start_time: "",
  end_time: "",
  capacity: "",
};

function AdminSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [scheduleResponse, centreResponse] = await Promise.all([
        API.get("/api/admin/schedules"),
        API.get("/api/admin/centres"),
      ]);

      setSchedules(scheduleResponse.data || []);
      setCentres(centreResponse.data || []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Unable to load procurement schedules."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSchedules = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return schedules;

    return schedules.filter((item) =>
      [
        item.crop_name,
        item.centre_name,
        item.location,
        item.district,
        item.date,
        item.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(value)
    );
  }, [schedules, search]);

  const totalCapacity = schedules.reduce(
    (sum, item) => sum + Number(item.capacity || 0),
    0
  );

  const totalBooked = schedules.reduce(
    (sum, item) => sum + Number(item.booked_slots || 0),
    0
  );

  const openSchedules = schedules.filter(
    (item) => String(item.status).toUpperCase() === "OPEN"
  ).length;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const createSchedule = async (event) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      await API.post("/api/admin/schedules", {
        centre_id: Number(form.centre_id),
        crop_name: form.crop_name.trim(),
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        capacity: Number(form.capacity),
      });

      setMessage("Procurement schedule created successfully.");
      setForm(emptyForm);
      setShowModal(false);

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to create procurement schedule."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteSchedule = async (scheduleId) => {
    const confirmed = window.confirm(
      "Delete this procurement schedule?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await API.delete(`/api/admin/schedules/${scheduleId}`);

      setMessage("Schedule deleted successfully.");

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to delete this schedule."
      );
    }
  };

  const getUtilisation = (item) => {
    const capacity = Number(item.capacity || 0);
    const booked = Number(item.booked_slots || 0);

    if (!capacity) return 0;

    return Math.min(100, Math.round((booked / capacity) * 100));
  };

  const formatDate = (date) => {
    if (!date) return "--";

    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "--";

    const [hours, minutes] = time.split(":").map(Number);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes)
    ) {
      return time;
    }

    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="admin-schedules-page">

      <section className="admin-schedules-hero">
        <div>
          <span className="admin-section-kicker">
            PROCUREMENT CONTROL / 04
          </span>

          <h1>
            Schedule
            <br />
            <em>Management.</em>
          </h1>

          <p>
            Create and manage procurement windows across
            centres, crops and capacities.
          </p>
        </div>

        <div className="admin-schedule-hero-actions">
          <button
            className="admin-outline-button"
            onClick={loadData}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            className="admin-primary-button"
            onClick={() => {
              setMessage("");
              setError("");
              setForm(emptyForm);
              setShowModal(true);
            }}
          >
            <Plus size={18} />
            New Schedule
          </button>
        </div>
      </section>

      {message && (
        <div className="admin-feedback success">
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      {error && (
        <div className="admin-feedback error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <section className="admin-schedule-kpis">

        <div className="admin-schedule-kpi">
          <div className="kpi-icon">
            <CalendarDays size={21} />
          </div>

          <div>
            <span>TOTAL WINDOWS</span>
            <strong>{schedules.length}</strong>
          </div>
        </div>

        <div className="admin-schedule-kpi">
          <div className="kpi-icon">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>OPEN WINDOWS</span>
            <strong>{openSchedules}</strong>
          </div>
        </div>

        <div className="admin-schedule-kpi">
          <div className="kpi-icon">
            <Users size={21} />
          </div>

          <div>
            <span>BOOKED SLOTS</span>
            <strong>{totalBooked}</strong>
          </div>
        </div>

        <div className="admin-schedule-kpi">
          <div className="kpi-icon">
            <Wheat size={21} />
          </div>

          <div>
            <span>TOTAL CAPACITY</span>
            <strong>{totalCapacity}</strong>
          </div>
        </div>

      </section>

      <section className="admin-schedule-toolbar">

        <div className="admin-search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search crop, centre, date or status..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <span className="admin-result-count">
          {filteredSchedules.length} schedule
          {filteredSchedules.length === 1 ? "" : "s"}
        </span>

      </section>

      <section className="admin-schedule-grid">

        {loading ? (
          <div className="admin-schedule-empty">
            <RefreshCw className="spin" size={30} />
            <h3>Loading schedules...</h3>
            <p>
              Fetching procurement windows from the
              control centre.
            </p>
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="admin-schedule-empty">
            <CalendarDays size={42} />

            <h3>No schedules found</h3>

            <p>
              Create the first procurement window to
              start accepting farmer bookings.
            </p>

            <button
              className="admin-primary-button"
              onClick={() => setShowModal(true)}
            >
              <Plus size={18} />
              Create Schedule
            </button>
          </div>
        ) : (
          filteredSchedules.map((item) => {
            const utilisation = getUtilisation(item);

            return (
              <article
                className="admin-schedule-card"
                key={item.id}
              >

                <div className="schedule-card-top">

                  <div className="schedule-crop">
                    <div className="crop-icon">
                      <Wheat size={20} />
                    </div>

                    <div>
                      <span>CROP WINDOW</span>

                      <h3>
                        {item.crop_name || "Unknown Crop"}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`schedule-status ${
                      String(item.status)
                        .toUpperCase() === "OPEN"
                        ? "open"
                        : "closed"
                    }`}
                  >
                    {item.status || "OPEN"}
                  </span>

                </div>

                <div className="schedule-card-centre">
                  <MapPin size={17} />

                  <div>
                    <strong>
                      {item.centre_name ||
                        "Procurement Centre"}
                    </strong>

                    <span>
                      {item.location ||
                        item.district ||
                        "Location unavailable"}
                    </span>
                  </div>
                </div>

                <div className="schedule-details">

                  <div>
                    <CalendarDays size={17} />

                    <span>
                      <small>DATE</small>
                      <strong>
                        {formatDate(item.date)}
                      </strong>
                    </span>
                  </div>

                  <div>
                    <Clock3 size={17} />

                    <span>
                      <small>WINDOW</small>
                      <strong>
                        {formatTime(item.start_time)}
                        {" – "}
                        {formatTime(item.end_time)}
                      </strong>
                    </span>
                  </div>

                </div>

                <div className="schedule-capacity">

                  <div className="capacity-heading">
                    <span>
                      CAPACITY UTILISATION
                    </span>

                    <strong>
                      {item.booked_slots || 0}
                      {" / "}
                      {item.capacity || 0}
                    </strong>
                  </div>

                  <div className="capacity-track">
                    <div
                      className="capacity-fill"
                      style={{
                        width: `${utilisation}%`,
                      }}
                    />
                  </div>

                  <div className="capacity-footer">
                    <span>
                      {utilisation}% booked
                    </span>

                    <span>
                      {Math.max(
                        0,
                        Number(item.capacity || 0) -
                          Number(item.booked_slots || 0)
                      )}{" "}
                      slots available
                    </span>
                  </div>

                </div>

                <div className="schedule-card-actions">

                  <div className="schedule-id">
                    SCHEDULE #{item.id}
                  </div>

                  <button
                    className="schedule-delete-button"
                    onClick={() =>
                      deleteSchedule(item.id)
                    }
                    title="Delete schedule"
                  >
                    <Trash2 size={17} />
                  </button>

                </div>

              </article>
            );
          })
        )}

      </section>

      {showModal && (
        <div
          className="admin-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div className="admin-schedule-modal">

            <div className="admin-modal-header">

              <div>
                <span>
                  CONTROL CENTRE / NEW WINDOW
                </span>

                <h2>
                  Create procurement schedule
                </h2>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>

            </div>

            <form onSubmit={createSchedule}>

              <div className="schedule-form-grid">

                <label>
                  <span>PROCUREMENT CENTRE</span>

                  <select
                    name="centre_id"
                    value={form.centre_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select centre
                    </option>

                    {centres.map((centre) => (
                      <option
                        key={centre.id}
                        value={centre.id}
                      >
                        {centre.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>CROP</span>

                  <input
                    name="crop_name"
                    type="text"
                    placeholder="e.g. Paddy"
                    value={form.crop_name}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  <span>DATE</span>

                  <input
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  <span>CAPACITY</span>

                  <input
                    name="capacity"
                    type="number"
                    min="1"
                    placeholder="Maximum farmers"
                    value={form.capacity}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  <span>START TIME</span>

                  <input
                    name="start_time"
                    type="time"
                    value={form.start_time}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  <span>END TIME</span>

                  <input
                    name="end_time"
                    type="time"
                    value={form.end_time}
                    onChange={handleChange}
                    required
                  />
                </label>

              </div>

              <div className="schedule-form-note">
                <CalendarDays size={18} />

                <p>
                  Farmers will be able to see this
                  procurement window and use it for
                  slot booking once it is created.
                </p>
              </div>

              <div className="admin-modal-actions">

                <button
                  type="button"
                  className="admin-outline-button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="spin"
                      />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Create Schedule
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default AdminSchedules;

