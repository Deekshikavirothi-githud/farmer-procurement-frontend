
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Leaf,
  Package,
  Sprout,
  X,
  ShieldCheck,
} from "lucide-react";
import API from "../api";

function CropRegistration({ onSuccess, onClose }) {
  const [form, setForm] = useState({
    crop_name: "",
    quantity: "",
    unit: "kg",
    season: "",
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
    setLoading(true);

    try {
      await API.post("/api/farmer/crops", {
        crop_name: form.crop_name,
        quantity: Number(form.quantity),
        unit: form.unit,
        season: form.season || null,
      });

      setSuccess("Crop registered successfully.");

      setForm({
        crop_name: "",
        quantity: "",
        unit: "kg",
        season: "",
      });

      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 800);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Crop registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-crop-page">

      <div className="crop-background-grid" />
      <div className="crop-glow crop-glow-one" />
      <div className="crop-glow crop-glow-two" />

      <button
        className="premium-crop-close"
        onClick={onClose}
        type="button"
        aria-label="Close"
      >
        <X size={18} />
      </button>

      <div className="crop-layout">

        {/* LEFT — BRAND / VISUAL */}

        <section className="crop-visual-panel">

          <div className="crop-system-label">
            <span className="crop-live-dot" />
            PROCUREMENT PROFILE / 01
          </div>

          <div className="crop-visual-content">

            <div className="crop-orbit-system">

              <div className="crop-orbit orbit-outer" />
              <div className="crop-orbit orbit-middle" />
              <div className="crop-orbit orbit-inner" />

              <div className="crop-orbit-node node-top">
                <Leaf size={14} />
              </div>

              <div className="crop-orbit-node node-right">
                <Package size={14} />
              </div>

              <div className="crop-orbit-node node-bottom">
                <Sprout size={14} />
              </div>

              <div className="crop-core">
                <Leaf size={34} />
                <span>FPI</span>
              </div>

            </div>

            <div className="crop-visual-copy">

              <span>YOUR PRODUCE</span>

              <h2>
                Give your crop
                <br />
                <em>a place in the network.</em>
              </h2>

              <p>
                Your crop profile helps the procurement system
                connect your produce with relevant schedules,
                centres and available capacity.
              </p>

            </div>

          </div>

          <div className="crop-network-status">

            <div>
              <span className="network-dot" />
              <strong>NETWORK READY</strong>
            </div>

            <span>FARMER → CROP → PROCUREMENT</span>

          </div>

        </section>


        {/* RIGHT — FORM */}

        <section className="crop-form-panel">

          <div className="crop-form-header">

            <div className="crop-form-icon">
              <Sprout size={21} />
            </div>

            <div>
              <span>PROCUREMENT PROFILE</span>
              <strong>Crop registration</strong>
            </div>

          </div>

          <div className="crop-heading">

            <span className="crop-eyebrow">
              STEP 01 / CROP DATA
            </span>

            <h1>
              Register your
              <br />
              <span>crop.</span>
            </h1>

            <p>
              Tell us what you plan to submit for procurement.
              This information will be used to match your crop
              with available procurement windows.
            </p>

          </div>


          <form onSubmit={handleSubmit}>

            {/* CROP NAME */}

            <div className="premium-input-group">

              <label>
                <span>CROP NAME</span>
                <small>01</small>
              </label>

              <div className="premium-input-wrap">

                <Leaf size={17} />

                <input
                  type="text"
                  name="crop_name"
                  placeholder="e.g. Paddy"
                  value={form.crop_name}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* QUANTITY + UNIT */}

            <div className="premium-form-row">

              <div className="premium-input-group">

                <label>
                  <span>QUANTITY</span>
                  <small>02</small>
                </label>

                <div className="premium-input-wrap">

                  <Package size={17} />

                  <input
                    type="number"
                    name="quantity"
                    placeholder="Enter quantity"
                    min="0.1"
                    step="0.1"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>


              <div className="premium-input-group">

                <label>
                  <span>UNIT</span>
                  <small>03</small>
                </label>

                <div className="premium-select-wrap">

                  <select
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                  >
                    <option value="kg">
                      Kilograms
                    </option>

                    <option value="quintal">
                      Quintal
                    </option>

                    <option value="ton">
                      Tonnes
                    </option>
                  </select>

                </div>

              </div>

            </div>


            {/* SEASON */}

            <div className="premium-input-group">

              <label>
                <span>SEASON</span>
                <small>04</small>
              </label>

              <div className="premium-select-wrap season-select">

                <Sprout size={17} />

                <select
                  name="season"
                  value={form.season}
                  onChange={handleChange}
                >

                  <option value="">
                    Select procurement season
                  </option>

                  <option value="Kharif">
                    Kharif
                  </option>

                  <option value="Rabi">
                    Rabi
                  </option>

                  <option value="Zaid">
                    Zaid
                  </option>

                </select>

              </div>

            </div>


            {/* ERROR */}

            {error && (
              <div className="premium-crop-alert error">

                <div>
                  <X size={16} />
                </div>

                <span>{error}</span>

              </div>
            )}


            {/* SUCCESS */}

            {success && (
              <div className="premium-crop-alert success">

                <div>
                  <CheckCircle2 size={16} />
                </div>

                <span>{success}</span>

              </div>
            )}


            {/* SUBMIT */}

            <button
              type="submit"
              className="premium-crop-submit"
              disabled={loading}
            >

              <span>
                {loading
                  ? "REGISTERING CROP..."
                  : "REGISTER CROP"}
              </span>

              {!loading && (
                <span className="submit-arrow">
                  <ArrowRight size={18} />
                </span>
              )}

            </button>

          </form>


          <div className="crop-form-footer">

            <div>
              <ShieldCheck size={14} />
              <span>YOUR PROCUREMENT DATA IS SECURE</span>
            </div>

            <span>FPI / 2026</span>

          </div>

        </section>

      </div>

    </div>
  );
}

export default CropRegistration;

