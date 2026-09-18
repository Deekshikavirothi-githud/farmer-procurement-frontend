import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Truck,
  WalletCards,
  Users,
  Activity,
  CircleDot,
  AlertCircle,
  ArrowUpRight,
  Sparkles,
  Navigation,
  Zap,
} from "lucide-react";

import API from "../api";

function ProcurementTracker({ bookingId }) {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadBooking = async (showLoader = false) => {
    if (!bookingId) return;

    if (showLoader) {
      setRefreshing(true);
    }

    try {
      setError("");

      const response = await API.get(
        `/api/bookings/${bookingId}`
      );

      const data = response.data;

      const queueResponse = await API.get(
        `/api/bookings/${bookingId}/queue`
      );

      const queue = queueResponse.data;

      setBooking({
        ...(data.booking || data),

        people_ahead:
          queue.people_ahead ?? 0,

        queue_position:
          queue.queue_position ?? 1,

        predicted_waiting_time:
          queue.predicted_waiting_time,

        ai_available:
          queue.ai_available,

        centre_name:
          queue.centre_name,

        date:
          queue.date,

        start_time:
          queue.start_time,

        end_time:
          queue.end_time,

        token_number:
          queue.token_number,

        status:
          queue.status,

        capacity:
          queue.capacity,

        booked_slots:
          queue.booked_slots,
      });
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load procurement tracking information."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBooking();

    const interval = setInterval(() => {
      loadBooking();
    }, 15000);

    return () => clearInterval(interval);
  }, [bookingId]);

  const normalizeStatus = (status) => {
    return String(status || "BOOKED")
      .toUpperCase()
      .replaceAll(" ", "_");
  };

  const getStatusIndex = (status) => {
    const normalized = normalizeStatus(status);

    if (normalized === "BOOKED") return 0;
    if (normalized === "CHECKED_IN") return 1;
    if (normalized === "PROCESSING") return 2;
    if (normalized === "COMPLETED") return 3;

    return 0;
  };

  const getStatusLabel = (status) => {
    const normalized = normalizeStatus(status);

    const labels = {
      BOOKED: "BOOKED",
      CHECKED_IN: "CHECKED IN",
      PROCESSING: "PROCESSING",
      COMPLETED: "COMPLETED",
    };

    return labels[normalized] || normalized;
  };

  const formatDate = (date) => {
    if (!date) return "—";

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

  const formatTime = (time) => {
    if (!time) return "—";

    const [hours, minutes] = String(time).split(":");

    if (hours === undefined || minutes === undefined) {
      return time;
    }

    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getWaitLabel = () => {
    if (
      booking?.predicted_waiting_time === null ||
      booking?.predicted_waiting_time === undefined
    ) {
      return "Calculating";
    }

    return `${booking.predicted_waiting_time} min`;
  };

  const getQueueProgress = () => {
    if (!booking) return 0;

    const capacity = Number(booking.capacity || 0);
    const ahead = Number(booking.people_ahead || 0);

    if (capacity <= 0) return 0;

    return Math.min(
      100,
      Math.max(
        0,
        ((capacity - ahead) / capacity) * 100
      )
    );
  };

  const getRemainingSlots = () => {
    const capacity = Number(booking?.capacity || 0);
    const booked = Number(booking?.booked_slots || 0);

    return Math.max(0, capacity - booked);
  };

  const getUtilisation = () => {
    const capacity = Number(booking?.capacity || 0);
    const booked = Number(booking?.booked_slots || 0);

    if (!capacity) return 0;

    return Math.min(
      100,
      Math.round((booked / capacity) * 100)
    );
  };

  if (!bookingId) {
    return null;
  }

  if (loading) {
    return (
      <section className="premium-tracker-page tracker-loading-screen">
        <div className="tracker-loader-orbit">
          <div className="tracker-loader-core">
            <RefreshCw
              size={25}
              className="tracker-spin"
            />
          </div>
        </div>

        <span className="tracker-loading-eyebrow">
          PROCUREMENT INTELLIGENCE
        </span>

        <h3>Establishing live connection</h3>

        <p>
          Synchronising your procurement journey...
        </p>
      </section>
    );
  }

  if (error && !booking) {
    return (
      <section className="premium-tracker-page tracker-error-screen">
        <div className="tracker-error-card">
          <div className="tracker-error-icon">
            <AlertCircle size={25} />
          </div>

          <div>
            <span>TRACKER ERROR</span>

            <h3>{error}</h3>

            <button
              className="tracker-retry-button"
              onClick={() => loadBooking(true)}
            >
              <RefreshCw size={16} />
              Retry connection
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!booking) {
    return null;
  }

  const currentStatus = normalizeStatus(
    booking.status
  );

  const currentIndex =
    getStatusIndex(booking.status);

  const steps = [
    {
      key: "BOOKED",
      title: "Booking confirmed",
      description:
        "Your procurement slot has been reserved.",
      icon: CheckCircle2,
    },
    {
      key: "CHECKED_IN",
      title: "Centre check-in",
      description:
        "Arrive at the centre and confirm your token.",
      icon: ShieldCheck,
    },
    {
      key: "PROCESSING",
      title: "Procurement",
      description:
        "Your crop is being processed at the centre.",
      icon: Truck,
    },
    {
      key: "COMPLETED",
      title: "Completed",
      description:
        "Procurement completed and payment can be processed.",
      icon: WalletCards,
    },
  ];

  return (
    <section className="premium-tracker-page">

      {/* TOP COMMAND HEADER */}
      <div className="tracker-command-header">

        <div className="tracker-command-copy">

          <div className="tracker-breadcrumb">
            <span>PROCUREMENT</span>
            <span>/</span>
            <strong>LIVE TRACKER</strong>
          </div>

          <div className="tracker-live-badge">
            <span className="tracker-live-pulse"></span>
            LIVE SYSTEM
          </div>

          <h1>
            Procurement
            <br />
            <span>in motion.</span>
          </h1>

          <p>
            A live view of your booking, queue,
            expected waiting time and procurement status.
          </p>

        </div>

        <div className="tracker-command-side">

          <div className="tracker-booking-reference">
            <span>BOOKING REFERENCE</span>

            <strong>
              #{booking.id || booking.booking_id || bookingId}
            </strong>

            <small>
              Live sync enabled
            </small>
          </div>

          <button
            className="premium-tracker-refresh"
            onClick={() => loadBooking(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "tracker-spin"
                  : ""
              }
            />

            {refreshing
              ? "Syncing..."
              : "Refresh data"}
          </button>

        </div>

      </div>

      {/* LIVE STATUS STRIP */}
      <div className="tracker-status-strip">

        <div className="tracker-strip-status">

          <span className="strip-live-dot"></span>

          <div>
            <strong>
              {getStatusLabel(booking.status)}
            </strong>

            <span>
              Procurement status
            </span>
          </div>

        </div>

        <div className="tracker-strip-divider"></div>

        <div className="tracker-strip-item">
          <Activity size={17} />
          <div>
            <strong>
              15 sec
            </strong>
            <span>
              Auto refresh
            </span>
          </div>
        </div>

        <div className="tracker-strip-divider"></div>

        <div className="tracker-strip-item">
          <ShieldCheck size={17} />
          <div>
            <strong>
              Secured
            </strong>
            <span>
              Booking protected
            </span>
          </div>
        </div>

      </div>

      {/* HERO QUEUE AREA */}
      <div className="tracker-command-grid">

        {/* QUEUE CARD */}
        <div className="tracker-live-queue-card">

          <div className="tracker-card-topline">

            <div>
              <span className="tracker-card-eyebrow">
                LIVE QUEUE
              </span>

              <h2>
                Your place
                <br />
                <span>in line.</span>
              </h2>
            </div>

            <div className="tracker-status-chip">
              <span></span>
              {getStatusLabel(booking.status)}
            </div>

          </div>

          <div className="tracker-queue-hero">

            <div className="tracker-queue-ring">

              <div
                className="tracker-queue-ring-progress"
                style={{
                  "--queue-progress": `${getQueueProgress()}%`,
                }}
              ></div>

              <div className="tracker-queue-ring-inner">

                <span>POSITION</span>

                <strong>
                  #{booking.queue_position ?? 1}
                </strong>

                <small>
                  LIVE
                </small>

              </div>

            </div>

            <div className="tracker-queue-message">

              <div className="queue-message-line">
                <Users size={17} />

                <span>
                  {booking.people_ahead ?? 0}
                  {" "}
                  people ahead
                </span>
              </div>

              <h3>
                {booking.people_ahead === 0
                  ? "You're next."
                  : "You're moving forward."}
              </h3>

              <p>
                Your queue position updates
                automatically as procurement activity
                progresses at the centre.
              </p>

            </div>

          </div>

          <div className="tracker-capacity-area">

            <div className="capacity-heading">

              <div>
                <span>
                  CENTRE CAPACITY
                </span>

                <strong>
                  {booking.booked_slots ?? 0}
                  {" / "}
                  {booking.capacity ?? 0}
                </strong>
              </div>

              <div className="capacity-percentage">
                {getUtilisation()}%
              </div>

            </div>

            <div className="capacity-track">
              <div
                className="capacity-fill"
                style={{
                  width: `${getUtilisation()}%`,
                }}
              ></div>
            </div>

            <div className="capacity-footer">
              <span>
                Current booking load
              </span>

              <strong>
                {getRemainingSlots()} slots available
              </strong>
            </div>

          </div>

        </div>

        {/* AI CARD */}
        <div className="tracker-ai-command-card">

          <div className="ai-command-grid-pattern"></div>
          <div className="ai-command-glow"></div>

          <div className="ai-command-content">

            <div className="ai-command-top">

              <div className="ai-command-icon">
                <Sparkles size={20} />
              </div>

              <div>
                <span>
                  INTELLIGENCE LAYER
                </span>

                <strong>
                  AI WAIT PREDICTION
                </strong>
              </div>

            </div>

            <div className="ai-command-heading">
              <span>
                EXPECTED WAIT
              </span>

              <div className="ai-wait-value">
                {booking.predicted_waiting_time !==
                null &&
                booking.predicted_waiting_time !==
                  undefined
                  ? booking.predicted_waiting_time
                  : "—"}

                {booking.predicted_waiting_time !==
                  null &&
                booking.predicted_waiting_time !==
                  undefined ? (
                  <small>MIN</small>
                ) : null}
              </div>
            </div>

            <p>
              Your estimated waiting time is
              calculated from current queue conditions
              and procurement activity.
            </p>

            <div className="ai-signal-list">

              <div>
                <Users size={15} />
                <span>Queue pressure</span>
                <strong>
                  {booking.people_ahead ?? 0}
                  ahead
                </strong>
              </div>

              <div>
                <Activity size={15} />
                <span>Centre load</span>
                <strong>
                  {getUtilisation()}%
                </strong>
              </div>

              <div>
                <Zap size={15} />
                <span>Engine</span>
                <strong>
                  {booking.ai_available
                    ? "ACTIVE"
                    : "STANDBY"}
                </strong>
              </div>

            </div>

          </div>

          <div className="ai-command-corner">
            <ArrowUpRight size={19} />
          </div>

        </div>

      </div>

      {/* ESSENTIAL INFORMATION */}
      <div className="tracker-info-heading">

        <div>
          <span>01 / PROCUREMENT DETAILS</span>

          <h2>
            Everything you need
            <span> at a glance.</span>
          </h2>
        </div>

        <div className="tracker-info-line"></div>

      </div>

      <div className="tracker-detail-grid">

        <div className="tracker-detail-card premium-detail-card">

          <div className="premium-detail-icon">
            <Truck size={19} />
          </div>

          <div>
            <span>CROP</span>

            <strong>
              {booking.crop_name ||
                booking.crop ||
                "Procurement crop"}
            </strong>
          </div>

          <ArrowUpRight
            size={16}
            className="detail-arrow"
          />

        </div>

        <div className="tracker-detail-card premium-detail-card">

          <div className="premium-detail-icon">
            <MapPin size={19} />
          </div>

          <div>
            <span>PROCUREMENT CENTRE</span>

            <strong>
              {booking.centre_name ||
                booking.centre ||
                "—"}
            </strong>

            <small>
              <Navigation size={12} />
              Active procurement location
            </small>
          </div>

          <ArrowUpRight
            size={16}
            className="detail-arrow"
          />

        </div>

        <div className="tracker-detail-card premium-detail-card">

          <div className="premium-detail-icon">
            <Clock3 size={19} />
          </div>

          <div>
            <span>SCHEDULE</span>

            <strong>
              {formatDate(booking.date)}
            </strong>

            <small>
              {formatTime(booking.start_time)}
              {" — "}
              {formatTime(booking.end_time)}
            </small>
          </div>

        </div>

        <div className="tracker-detail-card premium-detail-card">

          <div className="premium-detail-icon">
            <CircleDot size={19} />
          </div>

          <div>
            <span>YOUR TOKEN</span>

            <strong>
              #{booking.token_number ?? "—"}
            </strong>

            <small>
              Keep this token for centre check-in
            </small>
          </div>

        </div>

      </div>

      {/* JOURNEY */}
      <div className="tracker-journey-section">

        <div className="journey-heading">

          <div>
            <span>02 / PROCUREMENT JOURNEY</span>

            <h2>
              From reservation
              <span> to completion.</span>
            </h2>
          </div>

          <div className="journey-progress-counter">
            <strong>
              {currentIndex + 1}
            </strong>
            <span>
              / {steps.length}
            </span>
          </div>

        </div>

        <div className="premium-timeline">

          {steps.map((step, index) => {

            const StepIcon = step.icon;

            const completed =
              index < currentIndex;

            const active =
              index === currentIndex;

            return (
              <div
                key={step.key}
                className={
                  "premium-timeline-step " +
                  (completed
                    ? "is-completed "
                    : "") +
                  (active
                    ? "is-active "
                    : "")
                }
              >

                <div className="timeline-number">
                  {String(index + 1).padStart(
                    2,
                    "0"
                  )}
                </div>

                <div className="timeline-marker-premium">

                  <StepIcon size={19} />

                </div>

                {index <
                  steps.length - 1 && (
                  <div className="premium-timeline-connector">
                    <span></span>
                  </div>
                )}

                <div className="premium-timeline-copy">

                  <div className="timeline-status-label">
                    {completed
                      ? "COMPLETED"
                      : active
                      ? "CURRENT STAGE"
                      : "UPCOMING"}
                  </div>

                  <h3>
                    {step.title}
                  </h3>

                  <p>
                    {step.description}
                  </p>

                </div>

              </div>
            );
          })}

        </div>

      </div>

      {/* FINAL STATUS */}
      <div className="tracker-final-panel">

        <div className="final-status-icon">
          <ShieldCheck size={21} />
        </div>

        <div className="final-status-copy">

          <span>
            PROCUREMENT SYSTEM ACTIVE
          </span>

          <strong>
            Your booking is being monitored in real time.
          </strong>

          <small>
            Queue data refreshes automatically every
            15 seconds.
          </small>

        </div>

        <div className="final-booking-id">
          <span>BOOKING ID</span>
          <strong>
            #{booking.id ||
              booking.booking_id ||
              bookingId}
          </strong>
        </div>

      </div>

    </section>
  );
}

export default ProcurementTracker;