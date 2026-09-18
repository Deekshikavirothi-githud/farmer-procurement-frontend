
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Leaf,
  Users,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Navigation,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import API from "../api";

function Schedules({ onBookingCreated }) {
  const [schedules, setSchedules] = useState([]);
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [hoveredSchedule, setHoveredSchedule] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [scheduleResponse, cropResponse] = await Promise.all([
        API.get("/api/schedules"),
        API.get("/api/farmer/crops"),
      ]);

      setSchedules(scheduleResponse.data || []);
      setCrops(cropResponse.data || []);

      if (!selectedCrop && cropResponse.data?.length > 0) {
        setSelectedCrop(String(cropResponse.data[0].id));
      }
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

  const getCropName = (cropId) => {
    const crop = crops.find(
      (item) => String(item.id) === String(cropId)
    );

    return crop?.crop_name || "";
  };

  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      if (!selectedCrop) return true;

      const cropName = getCropName(selectedCrop);

      if (!cropName) return true;

      return (
        schedule.crop_name?.toLowerCase() ===
        cropName.toLowerCase()
      );
    });
  }, [schedules, selectedCrop, crops]);

  const handleBooking = async (schedule) => {
    if (!selectedCrop) {
      setError("Please select a crop before booking.");
      return;
    }

    try {
      setBookingLoading(schedule.id);
      setError("");
      setMessage("");

      const response = await API.post("/api/bookings", {
        crop_id: Number(selectedCrop),
        schedule_id: schedule.id,
      });

      const booking = response.data;

      setBookingId(booking.id);

      setMessage(
        `Slot booked successfully. Your token is #${booking.token_number}.`
      );

      if (onBookingCreated) {
        onBookingCreated(booking);
      }

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to book this procurement slot."
      );
    } finally {
      setBookingLoading(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getRemainingSlots = (schedule) => {
    const capacity = Number(schedule.capacity || 0);
    const booked = Number(schedule.booked_slots || 0);

    return Math.max(0, capacity - booked);
  };

  const getUtilisation = (schedule) => {
    const capacity = Number(schedule.capacity || 0);
    const booked = Number(schedule.booked_slots || 0);

    if (!capacity) return 0;

    return Math.min(
      100,
      Math.round((booked / capacity) * 100)
    );
  };

  const getLoadLevel = (utilisation) => {
    if (utilisation >= 90) return "HIGH";
    if (utilisation >= 65) return "MEDIUM";
    return "LOW";
  };

  const getLoadClass = (utilisation) => {
    if (utilisation >= 90) return "high";
    if (utilisation >= 65) return "medium";
    return "low";
  };

  const openSchedules = filteredSchedules.filter(
    (schedule) => getRemainingSlots(schedule) > 0
  );

  const fullSchedules = filteredSchedules.filter(
    (schedule) => getRemainingSlots(schedule) <= 0
  );

  const nextAvailable = [...openSchedules].sort((a, b) => {
    const dateA = new Date(
      `${a.date || ""}T${a.start_time || "00:00"}`
    ).getTime();

    const dateB = new Date(
      `${b.date || ""}T${b.start_time || "00:00"}`
    ).getTime();

    return dateA - dateB;
  })[0];

  if (loading) {
    return (
      <div className="premium-schedules-page">
        <div className="schedules-loading">
          <div className="schedule-loading-orbit">
            <div className="schedule-loading-core">
              <Leaf size={28} />
            </div>
          </div>

          <span className="schedules-loading-eyebrow">
            PROCUREMENT INTELLIGENCE
          </span>

          <h2>Finding available windows...</h2>

          <p>
            Checking live procurement schedules and
            available capacity.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-schedules-page">

      {/* HERO */}
      <section className="schedules-hero">
        <div className="schedules-hero-copy">

          <div className="schedules-eyebrow">
            <span className="schedule-live-dot" />
            LIVE PROCUREMENT NETWORK
          </div>

          <h1>
            Your next
            <br />
            <span>procurement window.</span>
          </h1>

          <p>
            Select your crop, discover available procurement
            windows, and reserve your place before travelling
            to the centre.
          </p>

          <div className="schedule-hero-points">
            <div>
              <CheckCircle2 size={17} />
              <span>Verified schedules</span>
            </div>

            <div>
              <CheckCircle2 size={17} />
              <span>Live capacity</span>
            </div>

            <div>
              <CheckCircle2 size={17} />
              <span>Digital booking</span>
            </div>
          </div>

        </div>

        <div className="schedules-hero-visual">

          <div className="schedule-radar">
            <div className="radar-ring radar-ring-one" />
            <div className="radar-ring radar-ring-two" />
            <div className="radar-ring radar-ring-three" />

            <div className="radar-sweep" />

            <div className="radar-core">
              <Leaf size={30} />
              <span>LIVE</span>
            </div>

            <div className="radar-node radar-node-one">
              <CalendarDays size={15} />
            </div>

            <div className="radar-node radar-node-two">
              <Users size={15} />
            </div>

            <div className="radar-node radar-node-three">
              <MapPin size={15} />
            </div>
          </div>

          <div className="hero-floating-card hero-floating-top">
            <Zap size={15} />

            <div>
              <strong>LIVE CAPACITY</strong>
              <span>Updated continuously</span>
            </div>
          </div>

          <div className="hero-floating-card hero-floating-bottom">
            <Navigation size={15} />

            <div>
              <strong>SMART ROUTING</strong>
              <span>Centre-aware scheduling</span>
            </div>
          </div>

        </div>
      </section>

      {/* CONTROL PANEL */}
      <section className="schedule-control-panel">

        <div className="schedule-control-left">

          <div className="control-icon">
            <Leaf size={19} />
          </div>

          <div>
            <span className="control-label">
              PROCUREMENT PROFILE
            </span>

            <strong>
              {crops.length > 0
                ? "Choose the crop you want to procure"
                : "No crop registered"}
            </strong>
          </div>

        </div>

        {crops.length > 0 ? (
          <div className="crop-select-wrapper">

            <Leaf size={16} />

            <select
              value={selectedCrop}
              onChange={(event) => {
                setSelectedCrop(event.target.value);
                setMessage("");
                setError("");
              }}
            >
              {crops.map((crop) => (
                <option
                  key={crop.id}
                  value={crop.id}
                >
                  {crop.crop_name} — {crop.quantity} {crop.unit}
                </option>
              ))}
            </select>

          </div>
        ) : (
          <div className="no-crop-indicator">
            Register a crop to continue
          </div>
        )}

        <button
          className="schedule-refresh-button"
          onClick={loadData}
          type="button"
        >
          <RefreshCw size={17} />
          <span>Refresh</span>
        </button>

      </section>

      {/* SYSTEM STATUS */}
      <section className="schedule-system-strip">

        <div className="schedule-system-status">
          <span className="system-pulse" />
          <span>PROCUREMENT NETWORK ONLINE</span>
        </div>

        <div className="system-stat">
          <strong>{openSchedules.length}</strong>
          <span>OPEN WINDOWS</span>
        </div>

        <div className="system-divider" />

        <div className="system-stat">
          <strong>{fullSchedules.length}</strong>
          <span>FULL WINDOWS</span>
        </div>

        <div className="system-divider" />

        <div className="system-stat">
          <strong>{filteredSchedules.length}</strong>
          <span>TOTAL WINDOWS</span>
        </div>

      </section>

      {/* SUCCESS */}
      {message && (
        <div className="premium-schedule-success">

          <div className="success-icon-wrap">
            <CheckCircle2 size={20} />
          </div>

          <div className="success-copy">
            <strong>Procurement slot secured</strong>
            <span>{message}</span>
          </div>

          {bookingId && (
            <div className="booking-id-pill">
              BOOKING #{bookingId}
            </div>
          )}

        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="premium-schedule-error">

          <AlertCircle size={20} />

          <div>
            <strong>Action could not be completed</strong>
            <span>{error}</span>
          </div>

        </div>
      )}

      {/* EMPTY STATES */}
      {crops.length === 0 ? (

        <section className="schedule-empty-state">

          <div className="empty-visual">
            <div className="empty-orbit">
              <Leaf size={34} />
            </div>
          </div>

          <div className="empty-copy">

            <span className="empty-eyebrow">
              PROCUREMENT PROFILE REQUIRED
            </span>

            <h2>Register your crop first.</h2>

            <p>
              Your crop profile helps the system match you
              with relevant procurement schedules and available
              capacity.
            </p>

          </div>

        </section>

      ) : filteredSchedules.length === 0 ? (

        <section className="schedule-empty-state no-schedules">

          <div className="empty-visual">
            <div className="empty-orbit">
              <CalendarDays size={34} />
            </div>
          </div>

          <div className="empty-copy">

            <span className="empty-eyebrow">
              NO MATCHING WINDOWS
            </span>

            <h2>No procurement window available.</h2>

            <p>
              There are currently no schedules available
              for {getCropName(selectedCrop)}. Refresh to
              check for newly published windows.
            </p>

            <button
              className="schedule-empty-refresh"
              onClick={loadData}
              type="button"
            >
              <RefreshCw size={16} />
              Check again
            </button>

          </div>

        </section>

      ) : (

        <>
          {/* AVAILABLE WINDOWS */}
          <section className="schedule-list-header">

            <div>
              <span className="schedule-section-eyebrow">
                AVAILABLE WINDOWS
              </span>

              <h2>
                Choose when you want
                <br />
                <span>to arrive.</span>
              </h2>
            </div>

            {nextAvailable && (
              <div className="next-window-card">

                <div className="next-window-icon">
                  <Sparkles size={16} />
                </div>

                <div>
                  <span>NEXT AVAILABLE</span>

                  <strong>
                    {formatDate(nextAvailable.date)}
                  </strong>
                </div>

              </div>
            )}

          </section>

          {/* SCHEDULE CARDS */}
          <section className="premium-schedule-grid">

            {filteredSchedules.map((schedule, index) => {

              const remaining =
                getRemainingSlots(schedule);

              const utilisation =
                getUtilisation(schedule);

              const isFull = remaining <= 0;

              const loadLevel =
                getLoadLevel(utilisation);

              const loadClass =
                getLoadClass(utilisation);

              const isHovered =
                hoveredSchedule === schedule.id;

              return (
                <article
                  className={`premium-schedule-card ${
                    isFull
                      ? "premium-schedule-full"
                      : ""
                  } ${
                    isHovered
                      ? "schedule-card-hovered"
                      : ""
                  }`}
                  key={schedule.id}
                  onMouseEnter={() =>
                    setHoveredSchedule(schedule.id)
                  }
                  onMouseLeave={() =>
                    setHoveredSchedule(null)
                  }
                >

                  <div className="premium-card-top">

                    <div className="card-index">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div
                      className={`premium-status ${
                        isFull
                          ? "premium-status-full"
                          : "premium-status-open"
                      }`}
                    >
                      <span />
                      {isFull ? "FULL" : "OPEN"}
                    </div>

                  </div>

                  <div className="premium-date-block">

                    <div className="date-icon-box">
                      <CalendarDays size={20} />
                    </div>

                    <div>
                      <span>PROCUREMENT DATE</span>

                      <strong>
                        {formatDate(schedule.date)}
                      </strong>
                    </div>

                  </div>

                  <div className="premium-centre-block">

                    <div className="centre-icon-box">
                      <MapPin size={19} />
                    </div>

                    <div className="centre-copy">

                      <span>PROCUREMENT CENTRE</span>

                      <strong>
                        {schedule.centre_name ||
                          "Procurement Centre"}
                      </strong>

                      <small>
                        {schedule.location ||
                          schedule.district ||
                          "Location unavailable"}
                      </small>

                    </div>

                    <ArrowRight
                      className="centre-arrow"
                      size={18}
                    />

                  </div>

                  <div className="premium-time-row">

                    <div className="time-icon-box">
                      <Clock3 size={18} />
                    </div>

                    <div>
                      <span>WINDOW</span>

                      <strong>
                        {schedule.start_time} —{" "}
                        {schedule.end_time}
                      </strong>
                    </div>

                  </div>

                  <div className="schedule-capacity-panel">

                    <div className="capacity-panel-top">

                      <div>
                        <span>LIVE CAPACITY</span>

                        <strong>
                          {schedule.booked_slots || 0}
                          <em>
                            / {schedule.capacity}
                          </em>
                        </strong>
                      </div>

                      <div
                        className={`capacity-load ${loadClass}`}
                      >
                        {loadLevel} LOAD
                      </div>

                    </div>

                    <div className="premium-capacity-track">

                      <div
                        className="premium-capacity-fill"
                        style={{
                          width: `${utilisation}%`,
                        }}
                      />

                    </div>

                    <div className="capacity-panel-bottom">

                      <span>
                        <Users size={13} />

                        {remaining} slot
                        {remaining === 1
                          ? ""
                          : "s"} remaining
                      </span>

                      <strong>
                        {utilisation}% used
                      </strong>

                    </div>

                  </div>

                  <div className="schedule-intelligence-line">

                    <ShieldCheck size={15} />

                    <span>
                      {isFull
                        ? "This window has reached capacity"
                        : utilisation >= 90
                        ? "High demand — limited availability"
                        : utilisation >= 65
                        ? "Moderate demand — reserve soon"
                        : "Good availability for this window"}
                    </span>

                  </div>

                  <button
                    className="premium-book-button"
                    disabled={
                      isFull ||
                      bookingLoading === schedule.id
                    }
                    onClick={() =>
                      handleBooking(schedule)
                    }
                    type="button"
                  >

                    {bookingLoading === schedule.id ? (
                      <>
                        <Loader2
                          size={18}
                          className="spin-icon"
                        />
                        Securing your slot...
                      </>
                    ) : isFull ? (
                      <>
                        Schedule Full
                        <span className="button-disabled-dot" />
                      </>
                    ) : (
                      <>
                        Reserve My Procurement Slot
                        <ArrowRight size={18} />
                      </>
                    )}

                  </button>

                  <div className="card-bottom-meta">

                    <span>
                      <CheckCircle2 size={12} />
                      Digital token generated
                    </span>

                    <span>SECURE</span>

                  </div>

                </article>
              );
            })}

          </section>
        </>
      )}

    </div>
  );
}

export default Schedules;

