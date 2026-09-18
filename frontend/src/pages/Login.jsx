
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  ShieldCheck,
  Sprout,
  Users,
} from "lucide-react";

import API from "../api";

export default function Login({ onLogin, onRegister }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!phone || !password) {
      setError("Please enter your phone number and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/api/auth/login", {
        phone,
        password,
      });

      const data = response.data;

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user_role", data.role || "FARMER");

      if (onLogin) {
        onLogin(data.access_token, data.role || "FARMER");
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Login failed. Please check your phone number and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-auth-page">
      <div className="auth-grid-background"></div>
      <div className="auth-glow auth-glow-one"></div>
      <div className="auth-glow auth-glow-two"></div>

      {/* LEFT EXPERIENCE */}

      <section className="auth-visual-panel">
        <div className="auth-brand">
          <div className="auth-brand-symbol">
            <Sprout size={22} strokeWidth={2.2} />
          </div>

          <div className="auth-brand-copy">
            <strong>
              FARMER <span>PROCUREMENT</span>
            </strong>
            <small>INTELLIGENCE SYSTEM</small>
          </div>
        </div>

        <div className="auth-visual-content">
          <div className="auth-status">
            <span className="auth-status-dot"></span>
            PROCUREMENT NETWORK · ONLINE
          </div>

          <div className="auth-index">
            <span>FP</span>
            <span>01 / ACCESS</span>
          </div>

          <h1>
            Procurement
            <br />
            <span>without uncertainty.</span>
          </h1>

          <p className="auth-visual-description">
            One intelligent platform to discover procurement schedules,
            secure your slot, monitor your queue and stay informed until
            payment.
          </p>

          <div className="auth-system-visual">
            <div className="auth-orbit orbit-large"></div>
            <div className="auth-orbit orbit-medium"></div>
            <div className="auth-orbit orbit-small"></div>

            <div className="auth-orbit-core">
              <Sprout size={27} />
              <strong>LIVE</strong>
              <span>PROCUREMENT</span>
            </div>

            <div className="auth-orbit-node auth-node-top">
              <Clock3 size={15} />
              <span>SLOT</span>
            </div>

            <div className="auth-orbit-node auth-node-right">
              <Users size={15} />
              <span>QUEUE</span>
            </div>

            <div className="auth-orbit-node auth-node-bottom">
              <CheckCircle2 size={15} />
              <span>STATUS</span>
            </div>
          </div>

          <div className="auth-capability-grid">
            <div>
              <span>01</span>
              <strong>SMART SCHEDULING</strong>
              <p>Plan before travelling.</p>
            </div>

            <div>
              <span>02</span>
              <strong>LIVE QUEUE</strong>
              <p>Know your position.</p>
            </div>

            <div>
              <span>03</span>
              <strong>INTELLIGENCE</strong>
              <p>Understand waiting time.</p>
            </div>
          </div>
        </div>

        <div className="auth-visual-footer">
          <span>SMART AGRICULTURE</span>
          <i></i>
          <span>REAL-TIME INTELLIGENCE</span>
          <i></i>
          <span>TRANSPARENT ACCESS</span>
        </div>
      </section>

      {/* RIGHT LOGIN */}

      <section className="auth-form-panel">
        <div className="auth-panel-top">
          <span>FARMER PORTAL</span>

          <div className="auth-secure-indicator">
            <ShieldCheck size={15} />
            SECURE CONNECTION
          </div>
        </div>

        <div className="premium-auth-card">
          <div className="auth-card-line"></div>

          <div className="auth-card-heading">
            <div className="auth-lock-icon">
              <LockKeyhole size={20} />
            </div>

            <div>
              <span className="auth-card-eyebrow">
                SECURE ACCESS
              </span>

              <h2>
                Welcome
                <br />
                <span>back.</span>
              </h2>
            </div>

            <p>
              Sign in to access your procurement dashboard,
              schedules and active bookings.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="premium-auth-form"
          >
            <div className="premium-auth-field">
              <div className="auth-label-row">
                <label>PHONE NUMBER</label>
                <span>+91</span>
              </div>

              <div className="premium-input-shell">
                <div className="country-code">+91</div>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  maxLength="15"
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="premium-auth-field">
              <div className="auth-label-row">
                <label>PASSWORD</label>
                <span>PRIVATE</span>
              </div>

              <div className="premium-input-shell password-shell">
                <LockKeyhole size={17} />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="premium-auth-error">
                <div>!</div>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="premium-auth-submit"
              disabled={loading}
            >
              <span>
                {loading
                  ? "AUTHENTICATING..."
                  : "ENTER PROCUREMENT SYSTEM"}
              </span>

              {!loading ? (
                <ArrowRight size={20} />
              ) : (
                <span className="auth-spinner"></span>
              )}
            </button>
          </form>

          <div className="auth-register-divider">
            <span>NEW TO THE SYSTEM?</span>
          </div>

          <button
            type="button"
            className="premium-register-button"
            onClick={onRegister}
          >
            <span>Create Farmer Account</span>
            <ArrowRight size={17} />
          </button>

          <div className="auth-card-security">
            <ShieldCheck size={16} />

            <div>
              <strong>Protected access</strong>
              <span>
                Your procurement information is secured through
                authenticated access.
              </span>
            </div>
          </div>
        </div>

        <div className="auth-panel-footer">
          <span>FP / 2026</span>
          <span>FARMER PROCUREMENT INTELLIGENCE</span>
          <span>v1.0</span>
        </div>
      </section>
    </div>
  );
}

