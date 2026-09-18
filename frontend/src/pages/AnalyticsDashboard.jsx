
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Leaf,
  MapPin,
  RefreshCw,
  TrendingUp,
  Users,
  CalendarDays,
} from "lucide-react";

import API from "../api";

function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadAnalytics = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setError("");

      const response = await API.get(
        "/api/admin/analytics"
      );

      setAnalytics(response.data);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load analytics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();

    const interval = setInterval(() => {
      loadAnalytics(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const overview = analytics?.overview || {};

  const cropDemand =
    analytics?.crop_demand || [];

  const centres =
    analytics?.centre_utilisation || [];

  const bookingStatus =
    analytics?.booking_status || [];

  const dailyTrend =
    analytics?.daily_trend || [];

  const completionRate = useMemo(() => {
    if (!overview.total_bookings) {
      return 0;
    }

    return Math.round(
      (overview.completed_bookings /
        overview.total_bookings) *
        100
    );
  }, [overview]);

  const maxCropBookings = useMemo(() => {
    return Math.max(
      1,
      ...cropDemand.map(
        (item) =>
          Number(item.booking_count || 0)
      )
    );
  }, [cropDemand]);

  const maxTrendBookings = useMemo(() => {
    return Math.max(
      1,
      ...dailyTrend.map(
        (item) =>
          Number(item.bookings || 0)
      )
    );
  }, [dailyTrend]);

  const maxCentreUtilisation = useMemo(() => {
    return Math.max(
      1,
      ...centres.map(
        (item) =>
          Number(item.utilisation || 0)
      )
    );
  }, [centres]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(Number(amount || 0));
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
      }
    );
  };

  if (loading) {
    return (
      <section className="analytics-dashboard analytics-loading">

        <div className="analytics-loading-icon">
          <RefreshCw size={24} />
        </div>

        <span>
          PROCUREMENT INTELLIGENCE
        </span>

        <h2>
          Building analytics...
        </h2>

        <p>
          Reading live procurement data.
        </p>

      </section>
    );
  }

  return (
    <section className="analytics-dashboard">

      {/* ====================================================
          HEADER
          ==================================================== */}

      <div className="analytics-header">

        <div>

          <div className="analytics-live-label">
            <span />
            LIVE INTELLIGENCE
          </div>

          <span className="analytics-eyebrow">
            ADMIN ANALYTICS
          </span>

          <h1>
            See the system.
            <br />
            <span>Understand the flow.</span>
          </h1>

          <p>
            Procurement activity, farmer demand,
            waiting-time intelligence and centre
            performance — unified into one operational
            view.
          </p>

        </div>

        <button
          className="analytics-refresh-button"
          onClick={() =>
            loadAnalytics(true)
          }
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? "analytics-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing"
            : "Refresh Analytics"}
        </button>

      </div>

      {/* ====================================================
          ERROR
          ==================================================== */}

      {error && (
        <div className="analytics-error">

          <Activity size={18} />

          <span>
            {error}
          </span>

          <button
            onClick={() =>
              loadAnalytics(true)
            }
          >
            Retry
          </button>

        </div>
      )}

      {/* ====================================================
          OVERVIEW
          ==================================================== */}

      <div className="analytics-kpi-grid">

        <div className="analytics-kpi-card">

          <div className="analytics-kpi-icon">
            <Users size={21} />
          </div>

          <span>FARMERS</span>

          <strong>
            {overview.total_farmers || 0}
          </strong>

          <small>
            Registered farmers
          </small>

        </div>

        <div className="analytics-kpi-card">

          <div className="analytics-kpi-icon">
            <CalendarDays size={21} />
          </div>

          <span>BOOKINGS</span>

          <strong>
            {overview.total_bookings || 0}
          </strong>

          <small>
            Procurement reservations
          </small>

        </div>

        <div className="analytics-kpi-card">

          <div className="analytics-kpi-icon">
            <CheckCircle2 size={21} />
          </div>

          <span>COMPLETION</span>

          <strong>
            {completionRate}%
          </strong>

          <small>
            Procurement completion rate
          </small>

        </div>

        <div className="analytics-kpi-card">

          <div className="analytics-kpi-icon">
            <Clock3 size={21} />
          </div>

          <span>AVG WAIT</span>

          <strong>
            {overview.average_waiting_time || 0}
            <small className="analytics-inline-unit">
              min
            </small>
          </strong>

          <small>
            Based on recorded queue history
          </small>

        </div>

      </div>

      {/* ====================================================
          MONEY + OPERATIONS
          ==================================================== */}

      <div className="analytics-primary-grid">

        <div className="analytics-money-card">

          <div className="analytics-card-heading">

            <div>
              <span>
                PAYMENT INTELLIGENCE
              </span>

              <h3>
                Financial movement
              </h3>
            </div>

            <IndianRupee size={21} />

          </div>

          <div className="analytics-money-main">

            <div>

              <span>
                COMPLETED VALUE
              </span>

              <strong>
                {formatCurrency(
                  overview.paid_amount
                )}
              </strong>

            </div>

            <div>

              <span>
                OPEN VALUE
              </span>

              <strong>
                {formatCurrency(
                  overview.pending_amount
                )}
              </strong>

            </div>

          </div>

          <div className="analytics-money-visual">

            <div className="analytics-money-orbit">
              <IndianRupee size={25} />
            </div>

            <div>

              <strong>
                {formatCurrency(
                  Number(
                    overview.paid_amount || 0
                  ) +
                    Number(
                      overview.pending_amount ||
                        0
                    )
                )}
              </strong>

              <span>
                TOTAL PAYMENT VALUE
              </span>

            </div>

          </div>

        </div>

        <div className="analytics-operations-card">

          <div className="analytics-card-heading">

            <div>
              <span>
                OPERATIONAL SNAPSHOT
              </span>

              <h3>
                System activity
              </h3>
            </div>

            <Activity size={21} />

          </div>

          <div className="analytics-operation-list">

            <div>
              <span>
                ACTIVE BOOKINGS
              </span>

              <strong>
                {overview.active_bookings || 0}
              </strong>
            </div>

            <div>
              <span>
                COMPLETED
              </span>

              <strong>
                {overview.completed_bookings || 0}
              </strong>
            </div>

            <div>
              <span>
                CENTRES
              </span>

              <strong>
                {overview.total_centres || 0}
              </strong>
            </div>

            <div>
              <span>
                SCHEDULES
              </span>

              <strong>
                {overview.total_schedules || 0}
              </strong>
            </div>

          </div>

        </div>

      </div>

      {/* ====================================================
          CROP DEMAND + TREND
          ==================================================== */}

      <div className="analytics-section-heading">

        <div>
          <span>
            01 / DEMAND INTELLIGENCE
          </span>

          <h2>
            What farmers
            <br />
            are bringing.
          </h2>
        </div>

      </div>

      <div className="analytics-demand-grid">

        <div className="analytics-chart-card">

          <div className="analytics-card-heading">

            <div>
              <span>
                CROP DEMAND
              </span>

              <h3>
                Procurement demand by crop
              </h3>
            </div>

            <Leaf size={21} />

          </div>

          {cropDemand.length === 0 ? (
            <div className="analytics-no-data">
              <Leaf size={26} />
              <p>
                No crop demand data yet.
              </p>
            </div>
          ) : (
            <div className="analytics-horizontal-chart">

              {cropDemand.map(
                (item, index) => {

                  const value =
                    Number(
                      item.booking_count || 0
                    );

                  const width =
                    (value /
                      maxCropBookings) *
                    100;

                  return (
                    <div
                      className="analytics-bar-row"
                      key={`${item.crop_name}-${index}`}
                    >

                      <div className="analytics-bar-label">

                        <strong>
                          {item.crop_name}
                        </strong>

                        <span>
                          {value}
                        </span>

                      </div>

                      <div className="analytics-bar-track">

                        <div
                          className="analytics-bar-fill"
                          style={{
                            width: `${width}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </div>

        <div className="analytics-chart-card">

          <div className="analytics-card-heading">

            <div>
              <span>
                BOOKING TREND
              </span>

              <h3>
                Procurement activity
              </h3>
            </div>

            <TrendingUp size={21} />

          </div>

          {dailyTrend.length === 0 ? (
            <div className="analytics-no-data">
              <TrendingUp size={26} />
              <p>
                No trend data yet.
              </p>
            </div>
          ) : (
            <div className="analytics-trend-chart">

              {dailyTrend.map(
                (item, index) => {

                  const value =
                    Number(
                      item.bookings || 0
                    );

                  const height =
                    Math.max(
                      8,
                      (value /
                        maxTrendBookings) *
                        100
                    );

                  return (
                    <div
                      className="analytics-trend-column"
                      key={`${item.date}-${index}`}
                    >

                      <div
                        className="analytics-trend-bar"
                        style={{
                          height: `${height}%`,
                        }}
                        title={`${value} bookings`}
                      />

                      <span>
                        {formatDate(
                          item.date
                        )}
                      </span>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </div>

      </div>

      {/* ====================================================
          CENTRE PERFORMANCE
          ==================================================== */}

      <div className="analytics-section-heading analytics-centre-heading">

        <div>
          <span>
            02 / CENTRE INTELLIGENCE
          </span>

          <h2>
            Where the system
            <br />
            is under pressure.
          </h2>
        </div>

        <p>
          Centre utilization helps administrators
          identify congestion and understand where
          procurement demand is concentrated.
        </p>

      </div>

      <div className="analytics-centre-grid">

        {centres.length === 0 ? (
          <div className="analytics-no-data analytics-centre-empty">
            <MapPin size={28} />
            <p>
              No centre performance data yet.
            </p>
          </div>
        ) : (
          centres.map(
            (centre) => {

              const utilisation =
                Number(
                  centre.utilisation || 0
                );

              const width =
                Math.min(
                  100,
                  (utilisation /
                    maxCentreUtilisation) *
                    100
                );

              return (
                <div
                  className="analytics-centre-card"
                  key={centre.centre_id}
                >

                  <div className="analytics-centre-top">

                    <div className="analytics-centre-icon">
                      <MapPin size={18} />
                    </div>

                    <span>
                      {utilisation >= 80
                        ? "HIGH LOAD"
                        : utilisation >= 50
                        ? "MODERATE"
                        : "LOW LOAD"}
                    </span>

                  </div>

                  <h3>
                    {centre.centre_name}
                  </h3>

                  <p>
                    {centre.location || "Location unavailable"}
                  </p>

                  <div className="analytics-centre-utilisation">

                    <div className="analytics-centre-number">

                      <strong>
                        {utilisation}%
                      </strong>

                      <span>
                        utilization
                      </span>

                    </div>

                    <div className="analytics-centre-ring">

                      <div
                        style={{
                          background: `conic-gradient(
                            #557461 ${utilisation * 3.6}deg,
                            #e9eeea ${utilisation * 3.6}deg
                          )`,
                        }}
                      >
                        <div />
                      </div>

                    </div>

                  </div>

                  <div className="analytics-centre-bar">

                    <div
                      style={{
                        width: `${width}%`,
                      }}
                    />

                  </div>

                  <div className="analytics-centre-footer">

                    <span>
                      {centre.total_bookings || 0}
                      {" "}bookings
                    </span>

                    <span>
                      {centre.completed_bookings || 0}
                      {" "}completed
                    </span>

                  </div>

                </div>
              );
            }
          )
        )}

      </div>

      {/* ====================================================
          BOOKING STATUS
          ==================================================== */}

      <div className="analytics-status-card">

        <div className="analytics-card-heading">

          <div>
            <span>
              03 / BOOKING INTELLIGENCE
            </span>

            <h3>
              Procurement pipeline
            </h3>
          </div>

          <BarChart3 size={21} />

        </div>

        <div className="analytics-status-grid">

          {bookingStatus.length === 0 ? (
            <div className="analytics-no-data">
              <BarChart3 size={26} />
              <p>
                No booking status data yet.
              </p>
            </div>
          ) : (
            bookingStatus.map(
              (item, index) => {

                const count =
                  Number(
                    item.count || 0
                  );

                const total =
                  Number(
                    overview.total_bookings ||
                      0
                  );

                const percentage =
                  total > 0
                    ? Math.round(
                        (count / total) *
                          100
                      )
                    : 0;

                return (
                  <div
                    className="analytics-status-item"
                    key={`${item.status}-${index}`}
                  >

                    <div>

                      <span>
                        {item.status}
                      </span>

                      <strong>
                        {count}
                      </strong>

                    </div>

                    <div className="analytics-status-track">

                      <div
                        style={{
                          width: `${percentage}%`,
                        }}
                      />

                    </div>

                    <small>
                      {percentage}% of bookings
                    </small>

                  </div>
                );
              }
            )
          )}

        </div>

      </div>

      {/* ====================================================
          FOOTER
          ==================================================== */}

      <div className="analytics-footer">

        <div>

          <span className="analytics-footer-dot" />

          <div>
            <strong>
              Intelligence layer active
            </strong>

            <small>
              Analytics automatically refresh every
              30 seconds.
            </small>
          </div>

        </div>

        <span>
          FARMER PROCUREMENT INTELLIGENCE
        </span>

      </div>

    </section>
  );
}

export default AnalyticsDashboard;

