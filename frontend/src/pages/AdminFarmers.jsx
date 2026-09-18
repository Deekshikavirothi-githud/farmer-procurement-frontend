import { useEffect, useState } from "react";
import {
  Users,
  Search,
  MapPin,
  Phone,
  Wheat,
  RefreshCw,
  UserRound,
} from "lucide-react";

import API from "../api";

function AdminFarmers() {
  const [farmers, setFarmers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFarmers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/api/admin/farmers");

      setFarmers(response.data || []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Unable to load farmer records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarmers();
  }, []);

  const filteredFarmers = farmers.filter((farmer) => {
    const query = search.toLowerCase();

    return (
      String(farmer.name || "")
        .toLowerCase()
        .includes(query) ||
      String(farmer.phone || "")
        .toLowerCase()
        .includes(query) ||
      String(farmer.village || "")
        .toLowerCase()
        .includes(query) ||
      String(farmer.district || "")
        .toLowerCase()
        .includes(query) ||
      String(farmer.state || "")
        .toLowerCase()
        .includes(query)
    );
  });

  return (
    <section className="admin-farmers">
      <div className="admin-module-header">
        <div>
          <span className="admin-module-eyebrow">
            FARMER NETWORK / 01
          </span>

          <h1>
            Farmer
            <br />
            <span>Registry.</span>
          </h1>

          <p>
            Monitor registered farmers and their
            procurement participation across the network.
          </p>
        </div>

        <button
          className="admin-refresh-button"
          onClick={loadFarmers}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="admin-farmer-summary">
        <div className="admin-farmer-stat">
          <div className="admin-stat-icon">
            <Users size={20} />
          </div>

          <div>
            <span>TOTAL FARMERS</span>
            <strong>{farmers.length}</strong>
          </div>
        </div>

        <div className="admin-farmer-stat">
          <div className="admin-stat-icon">
            <UserRound size={20} />
          </div>

          <div>
            <span>VISIBLE RECORDS</span>
            <strong>{filteredFarmers.length}</strong>
          </div>
        </div>
      </div>

      <div className="admin-table-panel">
        <div className="admin-table-toolbar">
          <div>
            <strong>Registered Farmers</strong>
            <span>
              Live registry from procurement database
            </span>
          </div>

          <div className="admin-search-box">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search farmer, village, district..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
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
            <span>Loading farmer registry...</span>
          </div>
        )}

        {!loading && error && (
          <div className="admin-module-state error">
            <strong>Registry unavailable</strong>
            <span>{error}</span>

            <button onClick={loadFarmers}>
              Try Again
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          filteredFarmers.length === 0 && (
            <div className="admin-module-state">
              <Users size={28} />
              <strong>No farmers found</strong>
              <span>
                {search
                  ? "Try another search."
                  : "No farmer registrations are available yet."}
              </span>
            </div>
          )}

        {!loading &&
          !error &&
          filteredFarmers.length > 0 && (
            <div className="admin-farmer-table-wrapper">
              <table className="admin-farmer-table">
                <thead>
                  <tr>
                    <th>FARMER</th>
                    <th>CONTACT</th>
                    <th>LOCATION</th>
                    <th>PROCUREMENT</th>
                    <th>REGISTERED</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredFarmers.map((farmer) => (
                    <tr key={farmer.id}>
                      <td>
                        <div className="farmer-name-cell">
                          <div className="farmer-avatar">
                            {String(
                              farmer.name || "F"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {farmer.name}
                            </strong>

                            <span>
                              Farmer ID #
                              {farmer.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="farmer-contact">
                          <Phone size={14} />
                          {farmer.phone}
                        </div>
                      </td>

                      <td>
                        <div className="farmer-location">
                          <MapPin size={14} />

                          <div>
                            <strong>
                              {farmer.village}
                            </strong>

                            <span>
                              {farmer.district},{" "}
                              {farmer.state}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="farmer-procurement">
                          <Wheat size={15} />
                          <span>Registered</span>
                        </div>
                      </td>

                      <td>
                        <span className="farmer-date">
                          {farmer.created_at
                            ? new Date(
                                farmer.created_at
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </section>
  );
}

export default AdminFarmers;