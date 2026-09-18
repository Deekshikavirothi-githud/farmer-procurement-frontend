import { useEffect, useState } from "react";
import {
  Brain,
  RefreshCw,
  Clock3,
  Users,
  Database,
  Activity,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import API from "../api";

function AIInsights({ bookingId }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    loadPrediction();
  }, [bookingId]);

  const loadPrediction = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(
        `/api/bookings/${bookingId}/prediction`
      );

      setPrediction(response.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "AI prediction is not available yet."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!bookingId) {
    return (
      <section className="ai-insights-page premium-ai-page">
        <div className="ai-background-grid" />

        <div className="ai-empty-state">
          <div className="ai-icon-large">
            <Brain size={34} strokeWidth={1.5} />
          </div>

          <span className="ai-kicker">
            AI PROCUREMENT INTELLIGENCE
          </span>

          <h1>
            Intelligence begins
            <br />
            <span>with a booking.</span>
          </h1>

          <p>
            Book a procurement slot to unlock personalized
            waiting-time intelligence based on queue conditions
            and procurement patterns.
          </p>

          <div className="ai-empty-points">
            <div>
              <Clock3 size={16} />
              <span>Waiting-time prediction</span>
            </div>

            <div>
              <Users size={16} />
              <span>Queue intelligence</span>
            </div>

            <div>
              <Activity size={16} />
              <span>Live procurement signals</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="ai-insights-page premium-ai-page">
        <div className="ai-background-grid" />

        <div className="ai-loading-screen">
          <div className="ai-loading-orb">
            <Brain size={38} strokeWidth={1.4} />
          </div>

          <span>03 / INTELLIGENCE ENGINE</span>

          <h1>
            Reading the
            <br />
            <em>procurement signal.</em>
          </h1>

          <p>
            Analyzing queue conditions and historical
            processing patterns...
          </p>

          <div className="ai-loading-line">
            <span />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="ai-insights-page premium-ai-page">
        <div className="ai-background-grid" />

        <div className="ai-page-header">
          <div>
            <span className="ai-kicker">
              03 / INTELLIGENCE ENGINE
            </span>

            <h1>
              Waiting-time
              <br />
              <span>intelligence.</span>
            </h1>

            <p>
              Your prediction engine is not ready for this
              procurement record yet.
            </p>
          </div>

          <div className="ai-system-status">
            <span className="status-pulse" />
            SYSTEM ONLINE
          </div>
        </div>

        <div className="ai-not-ready-card">
          <div className="ai-not-ready-icon">
            <Database size={28} />
          </div>

          <div className="ai-not-ready-copy">
            <span>MODEL STATUS</span>

            <h2>Learning from procurement data</h2>

            <p>
              {error}
            </p>

            <p>
              The intelligence engine becomes more reliable as
              historical queue and waiting-time records grow.
            </p>

            <button
              className="ai-primary-button"
              onClick={loadPrediction}
            >
              <RefreshCw size={17} />
              Refresh prediction
            </button>
          </div>
        </div>
      </section>
    );
  }

  const data = prediction?.prediction
    ? prediction.prediction
    : prediction || {};

  const waitTime =
    data.waiting_time ??
    data.predicted_waiting_time ??
    data.estimated_waiting_time ??
    data.prediction ??
    null;

  const peopleAhead =
    data.people_ahead ??
    data.queue_position ??
    null;

  const numericWait =
    waitTime !== null ? Number(waitTime) : null;

  const waitLabel =
    numericWait !== null && !Number.isNaN(numericWait)
      ? `${numericWait.toFixed(0)} min`
      : "—";

  return (
    <section className="ai-insights-page premium-ai-page">
      <div className="ai-background-grid" />

      {/* HEADER */}
      <div className="ai-page-header">
        <div>
          <div className="ai-kicker-row">
            <span className="ai-kicker">
              03 / AI PROCUREMENT INTELLIGENCE
            </span>

            <span className="ai-live-badge">
              <span className="status-pulse" />
              LIVE MODEL
            </span>
          </div>

          <h1>
            Predict the wait.
            <br />
            <span>Plan your day.</span>
          </h1>

          <p>
            Intelligent waiting-time estimation built from
            current queue conditions and historical procurement
            patterns.
          </p>
        </div>

        <div className="ai-engine-badge">
          <div className="ai-engine-icon">
            <Sparkles size={18} />
          </div>

          <div>
            <span>INTELLIGENCE ENGINE</span>
            <strong>ACTIVE</strong>
          </div>
        </div>
      </div>

      {/* MAIN AI CARD */}
      <div className="ai-main-grid">
        <div className="ai-prediction-card">
          <div className="ai-card-glow" />

          <div className="ai-prediction-top">
            <div>
              <span className="ai-card-label">
                PREDICTED WAITING TIME
              </span>

              <div className="ai-prediction-value">
                {numericWait !== null ? (
                  <>
                    <strong>
                      {numericWait.toFixed(0)}
                    </strong>
                    <span>MIN</span>
                  </>
                ) : (
                  <strong>—</strong>
                )}
              </div>

              <p>
                Estimated time before your procurement
                service begins.
              </p>
            </div>

            <div className="ai-confidence-mark">
              <Brain size={21} />
              <span>AI</span>
            </div>
          </div>

          <div className="ai-prediction-bottom">
            <div className="ai-model-state">
              <span className="status-pulse" />
              MODEL ACTIVE
            </div>

            <span className="ai-booking-reference">
              BOOKING #{bookingId}
            </span>
          </div>
        </div>

        {/* VISUAL */}
        <div className="ai-orbit-card">
          <div className="ai-orbit">
            <div className="ai-orbit-ring ring-one" />
            <div className="ai-orbit-ring ring-two" />
            <div className="ai-orbit-ring ring-three" />

            <div className="ai-orbit-core">
              <Clock3 size={25} />
              <strong>
                {numericWait !== null
                  ? numericWait.toFixed(0)
                  : "—"}
              </strong>
              <span>MIN WAIT</span>
            </div>

            <div className="ai-orbit-node orbit-node-one">
              <Users size={15} />
            </div>

            <div className="ai-orbit-node orbit-node-two">
              <Activity size={15} />
            </div>

            <div className="ai-orbit-node orbit-node-three">
              <Database size={15} />
            </div>
          </div>
        </div>
      </div>

      {/* METRICS */}
      <div className="ai-section-heading">
        <div>
          <span>LIVE SIGNALS</span>
          <h2>
            What the model
            <br />
            <em>is reading.</em>
          </h2>
        </div>

        <p>
          The prediction is generated from measurable
          procurement conditions rather than a static estimate.
        </p>
      </div>

      <div className="ai-metrics-grid">
        <div className="ai-metric-card">
          <div className="ai-metric-icon">
            <Users size={19} />
          </div>

          <span>PEOPLE AHEAD</span>

          <strong>
            {peopleAhead !== null ? peopleAhead : "—"}
          </strong>

          <small>
            Current queue estimate
          </small>

          <div className="metric-line">
            <span />
          </div>
        </div>

        <div className="ai-metric-card">
          <div className="ai-metric-icon">
            <Clock3 size={19} />
          </div>

          <span>WAIT ESTIMATE</span>

          <strong>
            {waitLabel}
          </strong>

          <small>
            Predicted service delay
          </small>

          <div className="metric-line">
            <span />
          </div>
        </div>

        <div className="ai-metric-card">
          <div className="ai-metric-icon">
            <Brain size={19} />
          </div>

          <span>MODEL TYPE</span>

          <strong>AI</strong>

          <small>
            Historical + queue data
          </small>

          <div className="metric-line">
            <span />
          </div>
        </div>

        <div className="ai-metric-card">
          <div className="ai-metric-icon">
            <Activity size={19} />
          </div>

          <span>STATUS</span>

          <strong className="active-value">
            ACTIVE
          </strong>

          <small>
            Intelligence engine online
          </small>

          <div className="metric-line">
            <span />
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="ai-intelligence-section">
        <div className="ai-intelligence-copy">
          <span className="ai-kicker">
            HOW THE INTELLIGENCE WORKS
          </span>

          <h2>
            From queue data
            <br />
            <span>to informed action.</span>
          </h2>

          <p>
            Instead of asking farmers to wait without
            information, the system turns procurement data
            into a simple estimate they can act on.
          </p>

          <div className="ai-action-note">
            <div>
              <ArrowUpRight size={18} />
            </div>

            <p>
              A better estimate means a better decision
              about when to reach the procurement centre.
            </p>
          </div>
        </div>

        <div className="ai-factor-panel">
          <div className="ai-factor-header">
            <span>MODEL INPUTS</span>
            <span>04 SIGNALS</span>
          </div>

          <div className="ai-factor">
            <div className="factor-number">01</div>

            <div>
              <strong>People ahead</strong>
              <span>Current queue pressure</span>
            </div>

            <Users size={18} />
          </div>

          <div className="ai-factor">
            <div className="factor-number">02</div>

            <div>
              <strong>Centre capacity</strong>
              <span>Available processing capacity</span>
            </div>

            <Database size={18} />
          </div>

          <div className="ai-factor">
            <div className="factor-number">03</div>

            <div>
              <strong>Booked slots</strong>
              <span>Current procurement demand</span>
            </div>

            <Activity size={18} />
          </div>

          <div className="ai-factor">
            <div className="factor-number">04</div>

            <div>
              <strong>Historical waiting time</strong>
              <span>Previous processing patterns</span>
            </div>

            <Clock3 size={18} />
          </div>
        </div>
      </div>

      {/* FOOTER ACTION */}
      <div className="ai-refresh-bar">
        <div>
          <span className="status-pulse" />

          <div>
            <strong>
              Prediction generated from procurement signals
            </strong>

            <small>
              Recalculate whenever queue conditions change.
            </small>
          </div>
        </div>

        <button
          className="ai-refresh-button"
          onClick={loadPrediction}
        >
          <RefreshCw size={17} />
          Recalculate
        </button>
      </div>
    </section>
  );
}

export default AIInsights;