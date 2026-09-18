

import { useEffect, useState } from "react";
import {
  Building2,
  Search,
  MapPin,
  Users,
  Clock,
  RefreshCw,
  Activity,
} from "lucide-react";

import API from "../api";

function AdminCentres() {
  const [centres, setCentres] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCentres = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(
        "/api/admin/centres"
      );

      setCentres(response.data || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to load procurement centres."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCentres();
  }, []);

  const filteredCentres = centres.filter(
    (centre) => {
      const query =
        search.toLowerCase();

      return (
        String(centre.name || "")
          .toLowerCase()
          .includes(query) ||
        String(centre.location || "")
          .toLowerCase()
          .includes(query) ||
        String(centre.district || "")
          .toLowerCase()
          .includes(query) ||
        String(centre.state || "")
          .toLowerCase()
          .includes(query)
      );
    }
  );

  const totalCapacity = centres.reduce(
    (total, centre) =>
      total +
      Number(
        centre.daily_capacity || 0
      ),
    0
  );

  const totalBookings = centres.reduce(
    (total, centre) =>
      total +
      Number(
        centre.total_bookings || 0
      ),
    0
  );

  return (
    <section className="admin-centres">

      <div className="admin-module-header">

        <div>
          <span className="admin-module-eyebrow">
            PROCUREMENT NETWORK / 02
          </span>

          <h1>
            Centre
            <br />
            <span>Intelligence.</span>
          </h1>

          <p>
            Monitor procurement centres,
            operational capacity and booking
            activity across the network.
          </p>
        </div>

        <button
          className="admin-refresh-button"
          onClick={loadCentres}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>

      </div>


      <div className="admin-centre-summary">

        <div className="admin-farmer-stat">
          <div className="admin-stat-icon">
            <Building2 size={20} />
          </div>

          <div>
            <span>
              ACTIVE CENTRES
            </span>

            <strong>
              {centres.length}
            </strong>
          </div>
        </div>


        <div className="admin-farmer-stat">
          <div className="admin-stat-icon">
            <Users size={20} />
          </div>

          <div>
            <span>
              DAILY CAPACITY
            </span>

            <strong>
              {totalCapacity}
            </strong>
          </div>
        </div>


        <div className="admin-farmer-stat">
          <div className="admin-stat-icon">
            <Activity size={20} />
          </div>

          <div>
            <span>
              TOTAL BOOKINGS
            </span>

            <strong>
              {totalBookings}
            </strong>
          </div>
        </div>

      </div>


      <div className="admin-table-panel">

        <div className="admin-table-toolbar">

          <div>
            <strong>
              Procurement Centres
            </strong>

            <span>
              Operational network overview
            </span>
          </div>


          <div className="admin-search-box">

            <Search size={17} />

            <input
              type="text"
              placeholder="Search centre, location..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

        </div>


        {loading && (
          <div className="admin-module-state">

            <RefreshCw
              size={22}
              className="admin-spin"
            />

            <span>
              Loading procurement centres...
            </span>

          </div>
        )}


        {!loading && error && (
          <div className="admin-module-state error">

            <strong>
              Centre network unavailable
            </strong>

            <span>
              {error}
            </span>

            <button
              onClick={loadCentres}
            >
              Try Again
            </button>

          </div>
        )}


        {!loading &&
          !error &&
          filteredCentres.length === 0 && (
            <div className="admin-module-state">

              <Building2 size={28} />

              <strong>
                No centres found
              </strong>

              <span>
                {search
                  ? "Try another search."
                  : "No procurement centres are registered yet."}
              </span>

            </div>
          )}


        {!loading &&
          !error &&
          filteredCentres.length > 0 && (

            <div className="admin-centre-grid">

              {filteredCentres.map(
                (centre) => {

                  const capacity =
                    Number(
                      centre.daily_capacity ||
                        0
                    );

                  const bookings =
                    Number(
                      centre.total_bookings ||
                        0
                    );

                  const utilisation =
                    Number(
                      centre.utilisation ||
                        0
                    );

                  return (
                    <article
                      className="admin-centre-card"
                      key={centre.id}
                    >

                      <div className="admin-centre-card-top">

                        <div className="admin-centre-icon">
                          <Building2
                            size={21}
                          />
                        </div>

                        <span
                          className={
                            utilisation >= 90
                              ? "centre-status high"
                              : utilisation >= 70
                              ? "centre-status medium"
                              : "centre-status normal"
                          }
                        >
                          {utilisation >= 90
                            ? "HIGH LOAD"
                            : utilisation >= 70
                            ? "BUSY"
                            : "OPERATIONAL"}
                        </span>

                      </div>


                      <div className="admin-centre-name">

                        <h3>
                          {centre.name}
                        </h3>

                        <div className="admin-centre-location">

                          <MapPin
                            size={14}
                          />

                          <span>
                            {centre.location}
                          </span>

                        </div>

                        <small>
                          {centre.district},{" "}
                          {centre.state}
                        </small>

                      </div>


                      <div className="admin-centre-metrics">

                        <div>

                          <span>
                            CAPACITY
                          </span>

                          <strong>
                            {capacity}
                          </strong>

                          <small>
                            farmers / day
                          </small>

                        </div>


                        <div>

                          <span>
                            BOOKINGS
                          </span>

                          <strong>
                            {bookings}
                          </strong>

                          <small>
                            total
                          </small>

                        </div>

                      </div>


                      <div className="admin-centre-utilisation">

                        <div className="utilisation-heading">

                          <span>
                            UTILISATION
                          </span>

                          <strong>
                            {utilisation}%
                          </strong>

                        </div>


                        <div className="utilisation-track">

                          <div
                            className="utilisation-fill"
                            style={{
                              width: `${Math.min(
                                100,
                                utilisation
                              )}%`,
                            }}
                          />

                        </div>

                      </div>


                      <div className="admin-centre-hours">

                        <Clock
                          size={14}
                        />

                        <span>
                          {centre.operating_hours ||
                            "Operating hours not specified"}
                        </span>

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

      </div>

    </section>
  );
}

export default AdminCentres;

