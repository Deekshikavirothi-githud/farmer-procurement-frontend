
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock3,
  IndianRupee,
  RefreshCw,
  Search,
  WalletCards,
  XCircle,
} from "lucide-react";

import API from "../api";

function AdminDashboard() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);

  const loadPayments = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setError("");

      const response = await API.get(
        "/api/admin/payments"
      );

      setPayments(
        response.data?.payments || []
      );
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load payment records."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPayments();

    const interval = setInterval(() => {
      loadPayments(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const updatePaymentStatus = async (
    paymentId,
    status
  ) => {
    try {
      setUpdatingId(paymentId);
      setError("");

      await API.patch(
        `/api/admin/payments/${paymentId}/status`,
        null,
        {
          params: {
            status,
          },
        }
      );

      await loadPayments(true);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Unable to update payment status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredPayments = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return payments.filter((payment) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        payment.payment_status ===
          statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        payment.farmer_name,
        payment.farmer_phone,
        payment.village,
        payment.district,
        payment.centre_name,
        payment.crop_name,
        payment.token_number,
        payment.booking_id,
      ]
        .filter(
          (value) =>
            value !== null &&
            value !== undefined
        )
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        );
    });
  }, [
    payments,
    search,
    statusFilter,
  ]);

  const statistics = useMemo(() => {
    const total = payments.length;

    const paid = payments.filter(
      (payment) =>
        payment.payment_status === "PAID"
    ).length;

    const pending = payments.filter(
      (payment) =>
        payment.payment_status === "PENDING"
    ).length;

    const processing = payments.filter(
      (payment) =>
        payment.payment_status ===
        "PROCESSING"
    ).length;

    const failed = payments.filter(
      (payment) =>
        payment.payment_status === "FAILED"
    ).length;

    const paidAmount = payments
      .filter(
        (payment) =>
          payment.payment_status === "PAID"
      )
      .reduce(
        (sum, payment) =>
          sum + Number(payment.amount || 0),
        0
      );

    const pendingAmount = payments
      .filter(
        (payment) =>
          payment.payment_status !== "PAID"
      )
      .reduce(
        (sum, payment) =>
          sum + Number(payment.amount || 0),
        0
      );

    return {
      total,
      paid,
      pending,
      processing,
      failed,
      paidAmount,
      pendingAmount,
    };
  }, [payments]);

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
        year: "numeric",
      }
    );
  };

  const getStatusClass = (status) => {
    return String(status || "")
      .toLowerCase();
  };

  if (loading) {
    return (
      <section className="admin-dashboard admin-loading">

        <div className="admin-loading-icon">
          <RefreshCw size={24} />
        </div>

        <span>
          ADMIN PROCUREMENT INTELLIGENCE
        </span>

        <h2>
          Loading control centre...
        </h2>

      </section>
    );
  }

  return (
    <section className="admin-dashboard">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="admin-header">

        <div>

          <div className="admin-live-label">
            <span />
            SYSTEM ONLINE
          </div>

          <span className="admin-eyebrow">
            ADMIN CONTROL CENTRE
          </span>

          <h1>
            Procurement
            <br />
            <span>operations.</span>
          </h1>

          <p>
            Monitor procurement activity,
            payment movement and farmer
            transactions from one intelligence
            layer.
          </p>

        </div>

        <button
          className="admin-refresh-button"
          onClick={() =>
            loadPayments(true)
          }
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? "admin-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing"
            : "Refresh Data"}
        </button>

      </div>

      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (
        <div className="admin-error">

          <AlertCircle size={18} />

          <span>
            {error}
          </span>

          <button
            onClick={() =>
              loadPayments(true)
            }
          >
            Retry
          </button>

        </div>
      )}

      {/* ================================================= */}
      {/* KPI CARDS */}
      {/* ================================================= */}

      <div className="admin-kpi-grid">

        <div className="admin-kpi-card">

          <div className="admin-kpi-icon">
            <WalletCards size={21} />
          </div>

          <span>
            TOTAL PAYMENTS
          </span>

          <strong>
            {statistics.total}
          </strong>

          <small>
            Recorded transactions
          </small>

        </div>

        <div className="admin-kpi-card admin-kpi-success">

          <div className="admin-kpi-icon">
            <CheckCircle2 size={21} />
          </div>

          <span>
            COMPLETED
          </span>

          <strong>
            {statistics.paid}
          </strong>

          <small>
            {formatCurrency(
              statistics.paidAmount
            )} processed
          </small>

        </div>

        <div className="admin-kpi-card admin-kpi-warning">

          <div className="admin-kpi-icon">
            <Clock3 size={21} />
          </div>

          <span>
            PENDING
          </span>

          <strong>
            {statistics.pending}
          </strong>

          <small>
            Awaiting processing
          </small>

        </div>

        <div className="admin-kpi-card admin-kpi-processing">

          <div className="admin-kpi-icon">
            <Activity size={21} />
          </div>

          <span>
            PROCESSING
          </span>

          <strong>
            {statistics.processing}
          </strong>

          <small>
            Currently moving
          </small>

        </div>

      </div>

      {/* ================================================= */}
      {/* PAYMENT INTELLIGENCE */}
      {/* ================================================= */}

      <div className="admin-intelligence-grid">

        <div className="admin-intelligence-card">

          <div className="admin-intelligence-heading">

            <div>
              <span>
                PAYMENT FLOW
              </span>

              <h3>
                Financial movement
              </h3>
            </div>

            <IndianRupee size={20} />

          </div>

          <div className="admin-money-row">

            <div>

              <span>
                COMPLETED VALUE
              </span>

              <strong>
                {formatCurrency(
                  statistics.paidAmount
                )}
              </strong>

            </div>

            <div>

              <span>
                OPEN VALUE
              </span>

              <strong>
                {formatCurrency(
                  statistics.pendingAmount
                )}
              </strong>

            </div>

          </div>

          <div className="admin-payment-bar">

            <div
              style={{
                width:
                  statistics.total > 0
                    ? `${
                        (statistics.paid /
                          statistics.total) *
                        100
                      }%`
                    : "0%",
              }}
            />

          </div>

          <small className="admin-payment-bar-label">
            {statistics.total > 0
              ? Math.round(
                  (statistics.paid /
                    statistics.total) *
                    100
                )
              : 0}
            % of payment records completed
          </small>

        </div>

        <div className="admin-intelligence-card">

          <div className="admin-intelligence-heading">

            <div>
              <span>
                SYSTEM HEALTH
              </span>

              <h3>
                Transaction status
              </h3>
            </div>

            <Activity size={20} />

          </div>

          <div className="admin-status-overview">

            <div>
              <span className="status-dot paid" />
              <strong>
                {statistics.paid}
              </strong>
              <small>
                Paid
              </small>
            </div>

            <div>
              <span className="status-dot pending" />
              <strong>
                {statistics.pending}
              </strong>
              <small>
                Pending
              </small>
            </div>

            <div>
              <span className="status-dot processing" />
              <strong>
                {statistics.processing}
              </strong>
              <small>
                Processing
              </small>
            </div>

            <div>
              <span className="status-dot failed" />
              <strong>
                {statistics.failed}
              </strong>
              <small>
                Failed
              </small>
            </div>

          </div>

        </div>

      </div>

      {/* ================================================= */}
      {/* PAYMENT MANAGEMENT */}
      {/* ================================================= */}

      <div className="admin-payment-section">

        <div className="admin-section-heading">

          <div>

            <span>
              01 / PAYMENT MANAGEMENT
            </span>

            <h2>
              Farmer transactions.
            </h2>

          </div>

          <div className="admin-record-count">
            {filteredPayments.length} records
          </div>

        </div>

        {/* FILTER BAR */}

        <div className="admin-filter-bar">

          <div className="admin-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search farmer, crop, centre or token..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

          <div className="admin-status-filters">

            {[
              "ALL",
              "PENDING",
              "PROCESSING",
              "PAID",
              "FAILED",
            ].map((status) => (
              <button
                key={status}
                className={
                  statusFilter === status
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setStatusFilter(status)
                }
              >
                {status}
              </button>
            ))}

          </div>

        </div>

        {/* PAYMENT TABLE */}

        {filteredPayments.length === 0 ? (
          <div className="admin-empty">

            <WalletCards size={28} />

            <h3>
              No payment records
            </h3>

            <p>
              No transactions match the
              current filters.
            </p>

          </div>
        ) : (
          <div className="admin-payment-table-wrapper">

            <table className="admin-payment-table">

              <thead>

                <tr>
                  <th>FARMER</th>
                  <th>PROCUREMENT</th>
                  <th>BOOKING</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>

              </thead>

              <tbody>

                {filteredPayments.map(
                  (payment) => {

                    const status =
                      payment.payment_status;

                    const isUpdating =
                      updatingId ===
                      payment.payment_id;

                    return (
                      <tr
                        key={
                          payment.payment_id
                        }
                      >

                        {/* FARMER */}

                        <td>

                          <div className="admin-farmer-cell">

                            <div className="admin-avatar">
                              {String(
                                payment.farmer_name ||
                                  "F"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>

                              <strong>
                                {payment.farmer_name ||
                                  "Unknown farmer"}
                              </strong>

                              <small>
                                {payment.farmer_phone ||
                                  "—"}
                              </small>

                            </div>

                          </div>

                        </td>

                        {/* PROCUREMENT */}

                        <td>

                          <div className="admin-procurement-cell">

                            <strong>
                              {payment.crop_name ||
                                "—"}
                            </strong>

                            <small>
                              {payment.centre_name ||
                                "—"}
                            </small>

                            <small>
                              {payment.district ||
                                payment.village ||
                                "—"}
                            </small>

                          </div>

                        </td>

                        {/* BOOKING */}

                        <td>

                          <div className="admin-booking-cell">

                            <strong>
                              Token #
                              {payment.token_number ??
                                "—"}
                            </strong>

                            <small>
                              Booking #
                              {payment.booking_id ??
                                "—"}
                            </small>

                            <small>
                              {formatDate(
                                payment.date
                              )}
                            </small>

                          </div>

                        </td>

                        {/* AMOUNT */}

                        <td>

                          <strong className="admin-amount">
                            {formatCurrency(
                              payment.amount
                            )}
                          </strong>

                        </td>

                        {/* STATUS */}

                        <td>

                          <span
                            className={
                              `admin-payment-status ${getStatusClass(
                                status
                              )}`
                            }
                          >

                            {status ===
                              "PAID" && (
                              <CheckCircle2
                                size={15}
                              />
                            )}

                            {status ===
                              "PENDING" && (
                              <Clock3
                                size={15}
                              />
                            )}

                            {status ===
                              "PROCESSING" && (
                              <Activity
                                size={15}
                              />
                            )}

                            {status ===
                              "FAILED" && (
                              <XCircle
                                size={15}
                              />
                            )}

                            {status}

                          </span>

                        </td>

                        {/* ACTION */}

                        <td>

                          <div className="admin-action-group">

                            <select
                              value={
                                status || "PENDING"
                              }
                              disabled={
                                isUpdating
                              }
                              onChange={(
                                event
                              ) =>
                                updatePaymentStatus(
                                  payment.payment_id,
                                  event.target.value
                                )
                              }
                            >

                              <option value="PENDING">
                                Pending
                              </option>

                              <option value="PROCESSING">
                                Processing
                              </option>

                              <option value="PAID">
                                Paid
                              </option>

                              <option value="FAILED">
                                Failed
                              </option>

                            </select>

                            {isUpdating && (
                              <RefreshCw
                                size={15}
                                className="admin-spin"
                              />
                            )}

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <div className="admin-footer">

        <div>

          <span className="admin-footer-live" />

          <div>
            <strong>
              Procurement intelligence active
            </strong>

            <small>
              Payment records automatically
              refresh every 30 seconds.
            </small>
          </div>

        </div>

        <span>
          FARMER PROCUREMENT SYSTEM
        </span>

      </div>

    </section>
  );
}

export default AdminDashboard;

