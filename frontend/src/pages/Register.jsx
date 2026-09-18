
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Sprout,
  UserRound,
} from "lucide-react";

import API from "../api";

export default function Register({
  onRegistered,
  onBack,
  onRegisterSuccess,
  onBackToLogin,
}) {
  const goBack = onBack || onBackToLogin;
  const registrationSuccess = onRegistered || onRegisterSuccess;

  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    village: "",
    district: "",
    state: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const {
      name,
      phone,
      password,
      village,
      district,
      state,
    } = form;

    if (
      !name ||
      !phone ||
      !password ||
      !village ||
      !district ||
      !state
    ) {
      setError("Please fill in all the required fields.");
      return;
    }

    if (phone.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/api/auth/register", {
        name,
        phone,
        password,
        village,
        district,
        state,
      });

      setSuccess(
        response.data?.message ||
          "Registration successful. You can now sign in."
      );

      setForm({
        name: "",
        phone: "",
        password: "",
        village: "",
        district: "",
        state: "",
      });

      setTimeout(() => {
        if (registrationSuccess) {
          registrationSuccess();
        }
      }, 1200);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-auth-page register-auth-page">
      <div className="auth-grid-background"></div>
      <div className="auth-glow auth-glow-one"></div>
      <div className="auth-glow auth-glow-two"></div>

      {/* LEFT PANEL */}

      <section className="auth-visual-panel register-visual-panel">
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
            FARMER NETWORK · READY
          </div>

          <div className="auth-index">
            <span>FP</span>
            <span>02 / REGISTER</span>
          </div>

          <h1>
            Your procurement
            <br />
            <span>starts here.</span>
          </h1>

          <p className="auth-visual-description">
            Create your digital farmer profile and connect
            your crop, schedule, booking and procurement
            journey through one intelligent system.
          </p>

          <div className="register-system-visual">
            <div className="register-orbit register-orbit-one"></div>
            <div className="register-orbit register-orbit-two"></div>
            <div className="register-orbit register-orbit-three"></div>

            <div className="register-system-core">
              <Sprout size={30} />
              <strong>FARMER</strong>
              <span>PROFILE</span>
            </div>

            <div className="register-data-node register-node-one">
              <UserRound size={15} />
              <span>PROFILE</span>
            </div>

            <div className="register-data-node register-node-two">
              <MapPin size={15} />
              <span>LOCATION</span>
            </div>

            <div className="register-data-node register-node-three">
              <CheckCircle2 size={15} />
              <span>ACCESS</span>
            </div>
          </div>

          <div className="auth-capability-grid">
            <div>
              <span>01</span>
              <strong>ONE PROFILE</strong>
              <p>Keep your procurement data connected.</p>
            </div>

            <div>
              <span>02</span>
              <strong>PLAN AHEAD</strong>
              <p>Find schedules before travelling.</p>
            </div>

            <div>
              <span>03</span>
              <strong>STAY INFORMED</strong>
              <p>Track your procurement digitally.</p>
            </div>
          </div>
        </div>

        <div className="auth-visual-footer">
          <span>SMART AGRICULTURE</span>
          <i></i>
          <span>DIGITAL PROCUREMENT</span>
          <i></i>
          <span>REAL-TIME ACCESS</span>
        </div>
      </section>

      {/* RIGHT PANEL */}

      <section className="auth-form-panel register-form-panel">
        <div className="auth-panel-top">
          <span>FARMER PORTAL</span>

          <div className="auth-secure-indicator">
            <ShieldCheck size={15} />
            SECURE REGISTRATION
          </div>
        </div>

        <div className="premium-auth-card premium-register-card">
          <div className="auth-card-line"></div>

          <div className="auth-card-heading">
            <div className="auth-lock-icon">
              <UserRound size={20} />
            </div>

            <div className="auth-heading-text">
              <span className="auth-card-eyebrow">
                FARMER REGISTRATION
              </span>

              <h2>
                Create your
                <br />
                <span>profile.</span>
              </h2>
            </div>

            <p>
              Enter your basic details to create your secure
              farmer account and access the procurement
              intelligence platform.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="premium-auth-form register-premium-form"
          >
            {/* SECTION 01 */}

            <div className="register-section-label">
              <span>01</span>
              FARMER DETAILS
            </div>

            <div className="premium-auth-field">
              <div className="auth-label-row">
                <label>FULL NAME</label>
                <span>REQUIRED</span>
              </div>

              <div className="premium-input-shell">
                <UserRound size={17} />

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="premium-auth-field">
              <div className="auth-label-row">
                <label>PHONE NUMBER</label>
                <span>+91</span>
              </div>

              <div className="premium-input-shell">
                <div className="country-code">+91</div>

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  maxLength="15"
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="premium-auth-field">
              <div className="auth-label-row">
                <label>PASSWORD</label>
                <span>MIN. 6 CHARACTERS</span>
              </div>

              <div className="premium-input-shell">
                <LockKeyhole size={17} />

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a secure password"
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* SECTION 02 */}

            <div className="register-section-label register-location-section">
              <span>02</span>
              FARM LOCATION
            </div>

            <div className="register-location-grid">
              <div className="premium-auth-field">
                <div className="auth-label-row">
                  <label>VILLAGE</label>
                </div>

                <div className="premium-input-shell">
                  <MapPin size={16} />

                  <input
                    type="text"
                    name="village"
                    value={form.village}
                    onChange={handleChange}
                    placeholder="Village"
                  />
                </div>
              </div>

              <div className="premium-auth-field">
                <div className="auth-label-row">
                  <label>DISTRICT</label>
                </div>

                <div className="premium-input-shell">
                  <input
                    type="text"
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    placeholder="District"
                  />
                </div>
              </div>
            </div>

            <div className="premium-auth-field">
              <div className="auth-label-row">
                <label>STATE</label>
              </div>

              <div className="premium-input-shell">
                <MapPin size={16} />

                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="State"
                />
              </div>
            </div>

            {/* MESSAGES */}

            {error && (
              <div className="premium-auth-error">
                <div>!</div>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="premium-auth-success">
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              className="premium-auth-submit"
              disabled={loading}
            >
              <span>
                {loading
                  ? "CREATING PROFILE..."
                  : "CREATE FARMER ACCOUNT"}
              </span>

              {!loading ? (
                <ArrowRight size={20} />
              ) : (
                <span className="auth-spinner"></span>
              )}
            </button>
          </form>

          {/* BACK TO LOGIN */}

          <div className="auth-register-divider">
            <span>ALREADY REGISTERED?</span>
          </div>

          <button
            type="button"
            className="premium-register-button"
            onClick={goBack}
          >
            <span>Back to Sign In</span>
            <ArrowRight size={17} />
          </button>

          {/* SECURITY */}

          <div className="auth-card-security">
            <ShieldCheck size={16} />

            <div>
              <strong>Protected farmer profile</strong>

              <span>
                Your registration details are used to securely
                connect you with procurement services.
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

