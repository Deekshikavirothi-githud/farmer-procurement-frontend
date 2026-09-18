import React, { useEffect, useState } from "react";
import "./App.css";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Loading from "./pages/Loading";

import CropRegistration from "./pages/CropRegistration";
import Schedules from "./pages/Schedules";
import MyBookings from "./pages/MyBookings";
import ProcurementTracker from "./pages/ProcurementTracker";
import AIInsights from "./pages/AIInsights";
import SmartRecommendations from "./pages/SmartRecommendations";

import AdminDashboard from "./pages/AdminDashboard";
import AdminFarmers from "./pages/AdminFarmers";
import AdminCentres from "./pages/AdminCentres";
import AdminSchedules from "./pages/AdminSchedules";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

function App() {
  const [activePage, setActivePage] = useState(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");

    if (token && role === "ADMIN") {
      return "admin";
    }

    if (token) {
      return "dashboard";
    }

    return localStorage.getItem("active_page") || "landing";
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  const navigate = (page) => {
    setActivePage(page);
    localStorage.setItem("active_page", page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleLogin = (data) => {
    if (data?.access_token) {
      localStorage.setItem("access_token", data.access_token);
    }

    if (data?.role) {
      localStorage.setItem("role", data.role);
    }

    const role = data?.role || localStorage.getItem("role");

    if (role === "ADMIN") {
      navigate("admin");
    } else {
      navigate("dashboard");
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("role");
    localStorage.removeItem("active_page");

    navigate("landing");
  };

  if (loading) {
    return <Loading />;
  }

  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");

  /* ============================================================
     PUBLIC FLOW
     ============================================================ */

  if (!token) {
    if (activePage === "landing") {
      return (
        <Landing
          onEnter={() => navigate("login")}
          onRegister={() => navigate("register")}
        />
      );
    }

    if (activePage === "register") {
      return (
        <Register
          onRegisterSuccess={() => navigate("login")}
          onBackToLogin={() => navigate("login")}
        />
      );
    }

    return (
      <Login
        onLogin={handleLogin}
        onRegister={() => navigate("register")}
      />
    );
  }

  /* ============================================================
     ADMIN APPLICATION
     ============================================================ */

  if (role === "ADMIN") {
    return (
      <div className="app-shell">
        <nav className="app-navbar">
          <div
            className="app-logo"
            onClick={() => navigate("admin")}
          >
            <div className="app-logo-mark">
              <span />
              <span />
              <span />
            </div>

            <div>
              <strong>FPIS</strong>
              <small>ADMIN CONSOLE</small>
            </div>
          </div>

          <div className="app-nav-links">
            <button onClick={() => navigate("admin")}>
              Overview
            </button>

            <button onClick={() => navigate("admin-farmers")}>
              Farmers
            </button>

            <button onClick={() => navigate("admin-centres")}>
              Centres
            </button>

            <button onClick={() => navigate("admin-schedules")}>
              Schedules
            </button>

            <button onClick={() => navigate("analytics")}>
              Analytics
            </button>
          </div>

          <button
            className="app-logout-button"
            onClick={logout}
          >
            Sign out
          </button>
        </nav>

        <main className="app-content">
          {activePage === "admin" && (
            <AdminDashboard />
          )}

          {activePage === "admin-farmers" && (
            <AdminFarmers />
          )}

          {activePage === "admin-centres" && (
            <AdminCentres />
          )}

          {activePage === "admin-schedules" && (
            <AdminSchedules />
          )}

          {activePage === "analytics" && (
            <AnalyticsDashboard />
          )}
        </main>
      </div>
    );
  }

  /* ============================================================
     FARMER APPLICATION
     ============================================================ */

  return (
    <div className="app-shell farmer-shell">
      <nav className="app-navbar farmer-navbar">
        <div
          className="app-logo"
          onClick={() => navigate("dashboard")}
        >
          <div className="app-logo-mark">
            <span />
            <span />
            <span />
          </div>

          <div>
            <strong>FPIS</strong>
            <small>FARMER INTELLIGENCE</small>
          </div>
        </div>

        <div className="app-nav-links">
          <button
            className={
              activePage === "dashboard" ? "active" : ""
            }
            onClick={() => navigate("dashboard")}
          >
            Dashboard
          </button>

          <button
            className={
              activePage === "crop" ? "active" : ""
            }
            onClick={() => navigate("crop")}
          >
            My Crop
          </button>

          <button
            className={
              activePage === "schedules" ? "active" : ""
            }
            onClick={() => navigate("schedules")}
          >
            Schedules
          </button>

          <button
            className={
              activePage === "bookings" ? "active" : ""
            }
            onClick={() => navigate("bookings")}
          >
            My Bookings
          </button>

          <button
            className={
              activePage === "tracker" ? "active" : ""
            }
            onClick={() => navigate("tracker")}
          >
            Track
          </button>

          <button
            className={
              activePage === "ai" ? "active" : ""
            }
            onClick={() => navigate("ai")}
          >
            Intelligence
          </button>
        </div>

        <button
          className="app-logout-button"
          onClick={logout}
        >
          Sign out
        </button>
      </nav>

      <main className="app-content">
        {/* ======================================================
           FARMER DASHBOARD
        ======================================================= */}

        {activePage === "dashboard" && (
          <div className="farmer-dashboard">
            <section className="dashboard-hero">
              <div>
                <span className="dashboard-kicker">
                  FARMER PROCUREMENT INTELLIGENCE
                </span>

                <h1>
                  Your procurement,
                  <br />
                  <em>made visible.</em>
                </h1>

                <p>
                  Track schedules, queues, procurement status and
                  intelligent waiting-time insights from one place.
                </p>
              </div>

              <div className="dashboard-hero-status">
                <span />
                SYSTEM ONLINE
              </div>
            </section>

            <section className="dashboard-quick-grid">
              <button
                onClick={() => navigate("crop")}
                className="dashboard-action-card"
              >
                <span>01</span>
                <strong>Register crop</strong>
                <small>Add your produce details</small>
              </button>

              <button
                onClick={() => navigate("schedules")}
                className="dashboard-action-card"
              >
                <span>02</span>
                <strong>Find schedule</strong>
                <small>Explore available procurement slots</small>
              </button>

              <button
                onClick={() => navigate("bookings")}
                className="dashboard-action-card"
              >
                <span>03</span>
                <strong>View booking</strong>
                <small>Check your procurement appointment</small>
              </button>

              <button
                onClick={() => navigate("ai")}
                className="dashboard-action-card"
              >
                <span>04</span>
                <strong>Open intelligence</strong>
                <small>See waiting-time insights</small>
              </button>
            </section>

            <section className="dashboard-module">
              <SmartRecommendations />
            </section>

            <section className="dashboard-module">
              <ProcurementTracker />
            </section>
          </div>
        )}

        {/* ======================================================
           CROP
        ======================================================= */}

        {activePage === "crop" && (
          <CropRegistration />
        )}

        {/* ======================================================
           SCHEDULES
        ======================================================= */}

        {activePage === "schedules" && (
          <Schedules />
        )}

        {/* ======================================================
           BOOKINGS
        ======================================================= */}

        {activePage === "bookings" && (
          <MyBookings />
        )}

        {/* ======================================================
           TRACKER
        ======================================================= */}

        {activePage === "tracker" && (
          <ProcurementTracker />
        )}

        {/* ======================================================
           AI
        ======================================================= */}

        {activePage === "ai" && (
          <AIInsights />
        )}
      </main>
    </div>
  );
}

export default App;