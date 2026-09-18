import { useEffect, useState } from "react";
import {
  MapPin,
  Clock3,
  Users,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import API from "../api";

function AlternativeCentres() {
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCentres = async () => {
    try {
      setLoading(true);

      const response = await API.get(
        "/api/recommendations/alternative-centres"
      );

      setCentres(
        Array.isArray(response.data)
          ? response.data
          : response.data?.centres || []
      );
    } catch (error) {
      console.error(
        "Unable to load alternative centres:",
        error
      );

      setCentres([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCentres();
  }, []);

  return (
    <section className="alternative-centres">
      <div className="alternative-header">
        <div>
          <span className="alternative-eyebrow">
            SMART ALTERNATIVES
          </span>

          <h2>
            Avoid the
            <br />
            <span>long queue.</span>
          </h2>

          <p>
            If another procurement centre has better
            availability, we'll surface it for you.
          </p>
        </div>

        <button
          className="alternative-refresh"
          onClick={loadCentres}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? "ai-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="alternative-loading">
          <Sparkles size={22} />
          <span>
            Analysing centre availability...
          </span>
        </div>
      ) : centres.length === 0 ? (
        <div className="alternative-empty">
          <MapPin size={22} />

          <div>
            <strong>
              No alternative centres available
            </strong>

            <p>
              We'll show better options when
              procurement data is available.
            </p>
          </div>
        </div>
      ) : (
        <div className="alternative-grid">
          {centres.slice(0, 3).map((centre, index) => (
            <div
              className="alternative-card"
              key={centre.id || index}
            >
              <div className="alternative-card-top">
                <div className="alternative-icon">
                  <MapPin size={20} />
                </div>

                <span className="alternative-badge">
                  {index === 0
                    ? "LOW QUEUE"
                    : "AVAILABLE"}
                </span>
              </div>

              <h3>
                {centre.centre_name ||
                  centre.name ||
                  "Procurement Centre"}
              </h3>

              <div className="alternative-detail">
                <MapPin size={15} />
                <span>
                  {centre.location ||
                    centre.centre_location ||
                    "Nearby"}
                </span>
              </div>

              <div className="alternative-detail">
                <Clock3 size={15} />
                <span>
                  {centre.operating_hours ||
                    "Operating hours available"}
                </span>
              </div>

              <div className="alternative-detail">
                <Users size={15} />
                <span>
                  {centre.available_slots ??
                    centre.remaining_slots ??
                    "--"}{" "}
                  slots available
                </span>
              </div>

              <div className="alternative-footer">
                <div>
                  <span>Queue load</span>

                  <strong>
                    {centre.queue_load ||
                      centre.load ||
                      "Low"}
                  </strong>
                </div>

                <button className="alternative-action">
                  Explore
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default AlternativeCentres;