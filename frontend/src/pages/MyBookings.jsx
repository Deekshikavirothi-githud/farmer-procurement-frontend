import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Leaf,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Ticket,
  Truck,
  Users,
  Activity,
  ChevronRight,
} from "lucide-react";
import API from "../api";

function MyBookings({ onTrackBooking }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/api/farmer/bookings");

      setBookings(response.data || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to load your bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  const openBooking = (booking) => {
    if (!booking?.id) return;

    localStorage.setItem(
      "active_booking_id",
      String(booking.id)
    );

    if (onTrackBooking) {
      onTrackBooking(booking);
    }
  };

  const activeBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const status = String(
        booking.status || "BOOKED"
      ).toUpperCase();

      return !["COMPLETED", "CANCELLED"].includes(status);
    });
  }, [bookings]);

  const completedBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const status = String(
        booking.status || ""
      ).toUpperCase();

      return status === "COMPLETED";
    });
  }, [bookings]);

  const getStatusClass = (status) => {
    const normalized = String(
      status || "BOOKED"
    ).toLowerCase();

    if (normalized.includes("complete")) {
      return "booking-status-completed";
    }

    if (normalized.includes("cancel")) {
      return "booking-status-cancelled";
    }

    if (
      normalized.includes("progress") ||
      normalized.includes("check") ||
      normalized.includes("process")
    ) {
      return "booking-status-progress";
    }

    return "booking-status-booked";
  };

  const getJourneyStep = (status) => {
    const normalized = String(
      status || "BOOKED"
    ).toUpperCase();

    if (normalized.includes("COMPLETE")) return 3;
    if (
      normalized.includes("PROCESS") ||
      normalized.includes("PROGRESS")
    ) {
      return 2;
    }
    if (normalized.includes("CHECK")) return 1;

    return 0;
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

  if (loading) {
    return (
      <section className="premium-bookings-page">
        <div className="bookings-loading">
          <div className="loading-orb">
            <Loader2 size={28} className="spin-icon" />
          </div>

          <span>Synchronising procurement activity</span>
          <small>
            Connecting to your live booking data...
          </small>
        </div>
      </section>
    );
  }

  return (
    <section className="premium-bookings-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <div className="bookings-hero">

        <div className="bookings-hero-copy">

          <div className="bookings-eyebrow">
            <span className="eyebrow-line"></span>
            PROCUREMENT CONTROL
            <span className="eyebrow-dot"></span>
            LIVE SYSTEM
          </div>

          <h1>
            Your procurement.
            <br />
            <span>Under control.</span>
          </h1>

          <p>
            Every booking, token and procurement window
            in one intelligent workspace. Know where you
            need to be, when you need to arrive and what
            happens next.
          </p>

          <div className="booking-hero-points">
            <div>
              <CheckCircle2 size={15} />
              <span>Schedule visibility</span>
            </div>

            <div>
              <CheckCircle2 size={15} />
              <span>Digital token tracking</span>
            </div>

            <div>
              <CheckCircle2 size={15} />
              <span>Live procurement status</span>
            </div>
          </div>

        </div>

        {/* COMMAND PANEL */}

        <div className="booking-command-card">

          <div className="command-glow"></div>

          <div className="command-card-top">
            <div className="command-icon">
              <Activity size={19} />
            </div>

            <div>
              <span>PROCUREMENT CONTROL</span>
              <small>PERSONAL ACTIVITY</small>
            </div>

            <div className="command-live">
              <span></span>
              LIVE
            </div>
          </div>

          <div className="command-main-number">
            {String(bookings.length).padStart(2, "0")}
          </div>

          <div className="command-label">
            Total procurement bookings
          </div>

          <div className="command-divider"></div>

          <div className="command-stats">

            <div>
              <strong>
                {String(activeBookings.length).padStart(2, "0")}
              </strong>
              <span>Active journeys</span>
            </div>

            <div>
              <strong>
                {String(completedBookings.length).padStart(2, "0")}
              </strong>
              <span>Completed</span>
            </div>

          </div>

        </div>

      </div>

      {/* SYSTEM STRIP */}

      <div className="booking-system-strip">

        <div className="system-strip-status">
          <span className="system-pulse"></span>
          PROCUREMENT NETWORK OPERATIONAL
        </div>

        <div className="system-strip-line"></div>

        <div className="system-strip-item">
          <ShieldCheck size={15} />
          Secure booking records
        </div>

        <div className="system-strip-item">
          <Activity size={15} />
          Live journey tracking
        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="premium-booking-error">

          <div className="error-copy">
            <span>SYNC ERROR</span>
            <strong>{error}</strong>
          </div>

          <button
            type="button"
            onClick={loadBookings}
          >
            <RefreshCw size={16} />
            Retry sync
          </button>

        </div>
      )}

      {/* EMPTY */}

      {bookings.length === 0 ? (
        <div className="premium-bookings-empty">

          <div className="empty-visual">

            <div className="empty-ring ring-one"></div>
            <div className="empty-ring ring-two"></div>

            <div className="empty-core">
              <Leaf size={34} />
            </div>

          </div>

          <span className="bookings-eyebrow">
            NO PROCUREMENT BOOKINGS
          </span>

          <h2>
            Your next procurement
            <br />
            <span>starts here.</span>
          </h2>

          <p>
            Once you reserve a procurement slot,
            your token, schedule and tracking details
            will appear here.
          </p>

        </div>
      ) : (
        <>

          {/* =================================================
              ACTIVE BOOKINGS
          ================================================= */}

          <div className="bookings-section-heading">

            <div>
              <span className="bookings-section-index">
                01 / ACTIVE JOURNEYS
              </span>

              <h2>
                Procurement
                <span> bookings</span>
              </h2>

              <p>
                Your upcoming and currently active
                procurement journeys.
              </p>
            </div>

            <button
              className="bookings-refresh-button"
              onClick={loadBookings}
              type="button"
            >
              <RefreshCw size={16} />
              Refresh data
            </button>

          </div>

          {activeBookings.length === 0 ? (
            <div className="no-active-bookings">
              <CheckCircle2 size={22} />

              <div>
                <strong>No active procurement journey</strong>
                <span>
                  Your completed procurement activity remains
                  available in history below.
                </span>
              </div>
            </div>
          ) : (
            <div className="premium-bookings-grid">

              {activeBookings.map((booking) => {

                const status =
                  booking.status || "BOOKED";

                const journeyStep =
                  getJourneyStep(status);

                return (
                  <article
                    className="premium-booking-card"
                    key={booking.id}
                  >

                    {/* CARD HEADER */}

                    <div className="premium-booking-top">

                      <div className="booking-token-block">

                        <span>YOUR DIGITAL TOKEN</span>

                        <div className="token-display">
                          <small>#</small>
                          {booking.token_number}
                        </div>

                      </div>

                      <div
                        className={`premium-booking-status ${getStatusClass(
                          status
                        )}`}
                      >
                        <span className="status-live-dot"></span>
                        {status}
                      </div>

                    </div>

                    {/* JOURNEY */}

                    <div className="booking-journey">

                      <div
                        className={`journey-node ${
                          journeyStep >= 0
                            ? "active"
                            : ""
                        }`}
                      >
                        <Ticket size={15} />
                      </div>

                      <div
                        className={`journey-line ${
                          journeyStep >= 1
                            ? "completed"
                            : ""
                        }`}
                      ></div>

                      <div
                        className={`journey-node ${
                          journeyStep >= 1
                            ? "active"
                            : ""
                        }`}
                      >
                        <Truck size={15} />
                      </div>

                      <div
                        className={`journey-line ${
                          journeyStep >= 2
                            ? "completed"
                            : ""
                        }`}
                      ></div>

                      <div
                        className={`journey-node ${
                          journeyStep >= 3
                            ? "active"
                            : ""
                        }`}
                      >
                        <CheckCircle2 size={15} />
                      </div>

                    </div>

                    <div className="journey-labels">
                      <span>Booked</span>
                      <span>Procurement</span>
                      <span>Complete</span>
                    </div>

                    {/* CROP */}

                    <div className="booking-primary-info">

                      <div className="crop-icon-box">
                        <Leaf size={22} />
                      </div>

                      <div>
                        <span>CROP</span>

                        <h3>
                          {booking.crop_name || "Crop"}
                        </h3>

                        <p>
                          {booking.quantity ?? "—"}{" "}
                          {booking.unit || ""}
                        </p>
                      </div>

                      <div className="crop-verified">
                        <ShieldCheck size={14} />
                        REGISTERED
                      </div>

                    </div>

                    {/* DETAILS */}

                    <div className="booking-detail-grid">

                      <div className="booking-detail-item">

                        <div className="detail-icon">
                          <MapPin size={16} />
                        </div>

                        <div>
                          <span>
                            PROCUREMENT CENTRE
                          </span>

                          <strong>
                            {booking.centre_name || "—"}
                          </strong>

                          <small>
                            {booking.centre_location ||
                              "Location unavailable"}
                          </small>
                        </div>

                      </div>

                      <div className="booking-detail-item">

                        <div className="detail-icon">
                          <CalendarDays size={16} />
                        </div>

                        <div>
                          <span>DATE</span>

                          <strong>
                            {formatDate(booking.date)}
                          </strong>
                        </div>

                      </div>

                      <div className="booking-detail-item">

                        <div className="detail-icon">
                          <Clock3 size={16} />
                        </div>

                        <div>
                          <span>TIME WINDOW</span>

                          <strong>
                            {booking.start_time || "—"}
                            {" – "}
                            {booking.end_time || "—"}
                          </strong>
                        </div>

                      </div>

                      <div className="booking-detail-item">

                        <div className="detail-icon">
                          <Users size={16} />
                        </div>

                        <div>
                          <span>BOOKING ID</span>

                          <strong>
                            #{booking.id}
                          </strong>
                        </div>

                      </div>

                    </div>

                    {/* TRACK CTA */}

                    <button
                      className="premium-track-button"
                      onClick={() =>
                        openBooking(booking)
                      }
                      type="button"
                    >
                      <span>
                        Open live procurement tracker
                      </span>

                      <span className="track-arrow">
                        <ArrowRight size={18} />
                      </span>
                    </button>

                    <div className="booking-security-note">
                      <ShieldCheck size={14} />
                      Booking secured in procurement system
                    </div>

                  </article>
                );
              })}

            </div>
          )}

          {/* =================================================
              HISTORY
          ================================================= */}

          {completedBookings.length > 0 && (
            <section className="booking-history-section">

              <div className="bookings-section-heading compact">

                <div>
                  <span className="bookings-section-index">
                    02 / HISTORY
                  </span>

                  <h2>
                    Completed
                    <span> procurement</span>
                  </h2>

                  <p>
                    Your previous procurement activity.
                  </p>
                </div>

              </div>

              <div className="completed-bookings-list">

                {completedBookings.map((booking) => (

                  <div
                    className="completed-booking-row"
                    key={booking.id}
                  >

                    <div className="completed-token">
                      #{booking.token_number}
                    </div>

                    <div className="completed-crop">
                      <Leaf size={17} />
                      <strong>
                        {booking.crop_name || "Crop"}
                      </strong>
                    </div>

                    <div className="completed-centre">
                      <MapPin size={15} />
                      <span>
                        {booking.centre_name || "Centre"}
                      </span>
                    </div>

                    <div className="completed-date">
                      {formatDate(booking.date)}
                    </div>

                    <div className="completed-status">
                      <CheckCircle2 size={15} />
                      COMPLETED
                    </div>

                    <ChevronRight
                      size={16}
                      className="history-arrow"
                    />

                  </div>

                ))}

              </div>

            </section>
          )}

        </>
      )}

      {/* =====================================================
          TRUST BAR
      ===================================================== */}

      <div className="booking-trust-bar">

        <div>
          <ShieldCheck size={18} />

          <span>
            Your procurement information is securely managed.
          </span>
        </div>

        <div className="trust-separator"></div>

        <div>
          <Clock3 size={17} />

          <span>
            Track your procurement journey in real time.
          </span>
        </div>

      </div>

    </section>
  );
}

export default MyBookings;