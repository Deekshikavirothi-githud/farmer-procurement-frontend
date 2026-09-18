import { useEffect, useMemo, useState } from "react";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Navigation,
  RefreshCw,
  Sparkles,
  TrendingDown,
  Users,
  Zap,
} from "lucide-react";

import API from "../api";

function SmartRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadCrops = async () => {
    try {
      const response = await API.get("/api/farmer/crops");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.crops || [];

      setCrops(data);
    } catch (err) {
      console.error("Unable to load crops:", err);
    }
  };

  const loadRecommendations = async (crop = "") => {
    try {
      setError("");

      if (recommendations.length === 0) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await API.get("/api/smart-procurement", {
        params: crop ? { crop_name: crop } : {},
      });

      const data = response.data;

      setRecommendations(
        Array.isArray(data)
          ? data
          : data?.recommendations || []
      );
    } catch (err) {
      console.error("Smart procurement error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load smart recommendations."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCrops();
    loadRecommendations();
  }, []);

  const handleCropChange = (event) => {
    const crop = event.target.value;

    setSelectedCrop(crop);
    loadRecommendations(crop);
  };

  const bestMatch = useMemo(() => {
    return (
      recommendations.find((item) => item.best_match) ||
      recommendations[0]
    );
  }, [recommendations]);

  const alternatives = useMemo(() => {
    return recommendations
      .filter(
        (item) =>
          item.schedule_id !== bestMatch?.schedule_id
      )
      .slice(0, 4);
  }, [recommendations, bestMatch]);

  const getLoadClass = (level) => {
    if (level === "LOW") return "load-low";
    if (level === "HIGH") return "load-high";
    return "load-medium";
  };

  if (loading) {
    return (
      <section className="smart-procurement-section">
        <div className="smart-loading-intro">
          <div className="smart-ai-pulse">
            <Sparkles size={20} />
          </div>

          <div>
            <span>SMART PROCUREMENT ENGINE</span>
            <h2>
              Analysing the best
              <strong> procurement path.</strong>
            </h2>
            <p>
              Comparing availability, centre load and
              schedule capacity for your procurement.
            </p>
          </div>
        </div>

        <div className="smart-loading-grid">
          <div className="smart-skeleton smart-skeleton-main" />
          <div className="smart-skeleton" />
          <div className="smart-skeleton" />
        </div>
      </section>
    );
  }

  return (
    <section className="smart-procurement-section">

      {/* TOP HEADER */}

      <div className="smart-section-top">

        <div className="smart-section-heading">

          <div className="smart-eyebrow">
            <span className="smart-live-dot" />
            <Sparkles size={14} />
            SMART PROCUREMENT ENGINE
          </div>

          <h2>
            Let intelligence
            <br />
            find your <em>best slot.</em>
          </h2>

          <p>
            Your procurement options are ranked using
            availability, centre load and schedule capacity.
          </p>

        </div>

        <div className="smart-controls">

          <div className="smart-crop-selector">

            <label htmlFor="smart-crop">
              PROCUREMENT CROP
            </label>

            <div className="smart-select-wrapper">

              <select
                id="smart-crop"
                value={selectedCrop}
                onChange={handleCropChange}
              >
                <option value="">All crops</option>

                {crops.map((crop) => (
                  <option
                    key={crop.id}
                    value={crop.crop_name}
                  >
                    {crop.crop_name}
                  </option>
                ))}
              </select>

            </div>

          </div>

          <button
            className="smart-refresh-button"
            onClick={() =>
              loadRecommendations(selectedCrop)
            }
            disabled={refreshing}
          >
            <RefreshCw
              size={15}
              className={
                refreshing ? "spin-icon" : ""
              }
            />
            Refresh
          </button>

        </div>

      </div>


      {/* ENGINE STATUS STRIP */}

      <div className="smart-engine-strip">

        <div>
          <Zap size={15} />
          <span>INTELLIGENCE ACTIVE</span>
        </div>

        <div className="smart-strip-line" />

        <span>
          Evaluating {recommendations.length || 0} procurement options
        </span>

        <div className="smart-strip-status">
          <span />
          LIVE
        </div>

      </div>


      {/* ERROR */}

      {error && (
        <div className="smart-error">
          <span>!</span>
          {error}
        </div>
      )}


      {/* EMPTY */}

      {!bestMatch && !error && (
        <div className="smart-empty">

          <div className="smart-empty-icon">
            <Navigation size={24} />
          </div>

          <span className="smart-empty-label">
            NO MATCH FOUND
          </span>

          <h3>
            No suitable procurement slots
          </h3>

          <p>
            There are currently no open schedules
            matching your selection.
          </p>

        </div>
      )}


      {/* BEST MATCH */}

      {bestMatch && (
        <>

          <div className="best-match-label">

            <div className="best-match-index">
              <span>01</span>
              <div />
            </div>

            <strong>
              RECOMMENDED FOR YOU
            </strong>

            <span className="best-match-label-line" />

            <span className="best-match-powered">
              AI RANKED
            </span>

          </div>


          <article className="best-match-card">

            <div className="best-match-glow" />

            <div className="best-match-main">

              <div className="best-match-top">

                <div className="recommendation-badge">
                  <Sparkles size={14} />
                  {bestMatch.recommendation ||
                    "BEST MATCH"}
                </div>

                <div className="score-pill">

                  <span>MATCH SCORE</span>

                  <strong>
                    {bestMatch.recommendation_score}
                  </strong>

                  <small>/100</small>

                </div>

              </div>


              <div className="centre-title">

                <div className="centre-icon">
                  <Navigation size={22} />
                </div>

                <div>

                  <span className="centre-overline">
                    PROCUREMENT CENTRE
                  </span>

                  <h3>
                    {bestMatch.centre_name}
                  </h3>

                  <p>
                    <MapPin size={14} />
                    {bestMatch.location},{" "}
                    {bestMatch.district}
                  </p>

                </div>

              </div>


              <div className="recommendation-reason">

                <div className="reason-icon">
                  <CheckCircle2 size={17} />
                </div>

                <div>

                  <span>WHY THIS SLOT?</span>

                  <p>
                    {bestMatch.reason}
                  </p>

                </div>

              </div>


              <div className="best-match-stats">

                <div className="smart-stat">

                  <span>
                    <CalendarDays size={15} />
                    DATE
                  </span>

                  <strong>
                    {bestMatch.date}
                  </strong>

                </div>


                <div className="smart-stat">

                  <span>
                    <Clock3 size={15} />
                    TIME WINDOW
                  </span>

                  <strong>
                    {bestMatch.start_time}
                    {" — "}
                    {bestMatch.end_time}
                  </strong>

                </div>


                <div className="smart-stat">

                  <span>
                    <Users size={15} />
                    AVAILABILITY
                  </span>

                  <strong>
                    {bestMatch.remaining_slots}{" "}
                    <small>slots left</small>
                  </strong>

                </div>

              </div>

            </div>


            {/* RIGHT INTELLIGENCE PANEL */}

            <div className="best-match-side">

              <div className="load-ring-wrapper">

                <div className="load-ring">

                  <div className="load-ring-inner">

                    <strong>
                      {bestMatch.utilisation}%
                    </strong>

                    <span>
                      CENTRE LOAD
                    </span>

                  </div>

                </div>

              </div>


              <div
                className={`load-status ${getLoadClass(
                  bestMatch.load_level
                )}`}
              >
                <TrendingDown size={14} />
                {bestMatch.load_level || "MEDIUM"}
                {" "}LOAD
              </div>


              <div className="smart-side-note">
                <span>RECOMMENDATION</span>
                <strong>
                  Lower congestion
                </strong>
                <p>
                  Selected to help reduce unnecessary
                  waiting at the centre.
                </p>
              </div>


              <button className="smart-book-button">
                Book this slot
                <ArrowRight size={18} />
              </button>

            </div>

          </article>

        </>
      )}


      {/* ALTERNATIVES */}

      {alternatives.length > 0 && (
        <div className="alternative-section">

          <div className="alternative-heading">

            <div>

              <span>
                02 / ALTERNATIVES
              </span>

              <h3>
                Other suitable options
              </h3>

            </div>

            <p>
              Compare before making your decision.
            </p>

          </div>


          <div className="alternative-grid">

            {alternatives.map((item, index) => (

              <article
                className="alternative-card"
                key={item.schedule_id}
              >

                <div className="alternative-card-number">
                  {String(index + 2).padStart(2, "0")}
                </div>


                <div className="alternative-card-content">

                  <div className="alternative-card-header">

                    <div>

                      <span>
                        PROCUREMENT CENTRE
                      </span>

                      <h4>
                        {item.centre_name}
                      </h4>

                      <p>
                        <MapPin size={13} />
                        {item.location}
                      </p>

                    </div>

                    <span
                      className={`mini-load ${getLoadClass(
                        item.load_level
                      )}`}
                    >
                      {item.load_level || "MEDIUM"}
                    </span>

                  </div>


                  <div className="alternative-details">

                    <div>

                      <span>DATE</span>

                      <strong>
                        {item.date}
                      </strong>

                    </div>


                    <div>

                      <span>SLOTS</span>

                      <strong>
                        {item.remaining_slots}
                      </strong>

                    </div>


                    <div>

                      <span>MATCH</span>

                      <strong>
                        {item.recommendation_score}
                      </strong>

                    </div>

                  </div>


                  <button className="alternative-book-button">

                    View slot

                    <ArrowRight size={15} />

                  </button>

                </div>

              </article>

            ))}

          </div>

        </div>
      )}

    </section>
  );
}

export default SmartRecommendations;