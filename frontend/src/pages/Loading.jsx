import { useEffect, useState } from "react";
import {
  Activity,
  Database,
  Leaf,
  Radio,
  ShieldCheck,
  Wifi,
} from "lucide-react";

function Loading({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [ready, setReady] = useState(false);

  const messages = [
    "INITIALIZING PROCUREMENT CORE",
    "CONNECTING FARMER NETWORK",
    "SYNCING PROCUREMENT CENTRES",
    "LOADING SCHEDULE INTELLIGENCE",
    "CALIBRATING QUEUE ENGINE",
    "ACTIVATING AI PREDICTION LAYER",
  ];

  useEffect(() => {
    const start = Date.now();
    const duration = 3000;

    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - start;
      const value = Math.min(
        100,
        Math.round((elapsed / duration) * 100)
      );

      setProgress(value);

      if (value >= 100) {
        clearInterval(progressTimer);

        setReady(true);

        setTimeout(() => {
          onComplete();
        }, 650);
      }
    }, 30);

    return () => clearInterval(progressTimer);
  }, [onComplete]);

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setMessageIndex((prev) =>
        Math.min(prev + 1, messages.length - 1)
      );
    }, 480);

    return () => clearInterval(messageTimer);
  }, []);

  return (
    <div className={`loading-screen ${ready ? "loading-ready" : ""}`}>
      {/* Ambient background */}
      <div className="loading-ambient loading-ambient-one" />
      <div className="loading-ambient loading-ambient-two" />

      {/* Technical grid */}
      <div className="loading-grid" />

      {/* Scan line */}
      <div className="loading-scan" />

      {/* Top telemetry */}
      <div className="loading-topbar">
        <div className="loading-system-id">
          <span className="loading-live-dot" />
          FPIS / CORE SYSTEM
        </div>

        <div className="loading-top-status">
          <span>SECURE CHANNEL</span>
          <span>2026.01</span>
        </div>
      </div>

      {/* Main visual */}
      <div className="loading-center">

        <div className="loading-network">

          <div className="loading-ring loading-ring-one" />
          <div className="loading-ring loading-ring-two" />
          <div className="loading-ring loading-ring-three" />

          <div className="loading-orbit loading-orbit-one">
            <span />
          </div>

          <div className="loading-orbit loading-orbit-two">
            <span />
          </div>

          <div className="loading-node loading-node-one">
            <Leaf size={13} />
          </div>

          <div className="loading-node loading-node-two">
            <Database size={13} />
          </div>

          <div className="loading-node loading-node-three">
            <Activity size={13} />
          </div>

          <div className="loading-node loading-node-four">
            <Radio size={13} />
          </div>

          <div className="loading-core">
            <div className="loading-core-glow" />
            <span>FP</span>
          </div>

        </div>

        {/* Brand */}
        <div className="loading-brand-block">
          <div className="loading-brand">
            FARMER <span>PROCUREMENT</span>
          </div>

          <div className="loading-subtitle">
            INTELLIGENCE SYSTEM
          </div>
        </div>

        {/* Status */}
        <div className="loading-status">

          <div className="loading-status-line">
            <span className="loading-status-marker">
              {String(messageIndex + 1).padStart(2, "0")}
            </span>

            <span className="loading-message">
              {messages[messageIndex]}
            </span>
          </div>

          <div className="loading-progress">
            <div
              className="loading-progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="loading-progress-meta">
            <span>SYSTEM INITIALIZATION</span>
            <strong>
              {String(progress).padStart(3, "0")}%
            </strong>
          </div>

        </div>

      </div>

      {/* Bottom telemetry */}
      <div className="loading-bottom">

        <div className="loading-telemetry">
          <div>
            <Wifi size={12} />
            <span>NETWORK</span>
            <strong>ONLINE</strong>
          </div>

          <div>
            <Database size={12} />
            <span>DATA CORE</span>
            <strong>SYNC</strong>
          </div>

          <div>
            <ShieldCheck size={12} />
            <span>SECURITY</span>
            <strong>ACTIVE</strong>
          </div>
        </div>

        <div className="loading-location">
          PROCUREMENT / INTELLIGENCE / PLATFORM
        </div>

      </div>

      {/* Corner coordinates */}
      <div className="loading-corner loading-corner-left">
        17.6868° N
        <br />
        83.2185° E
      </div>

      <div className="loading-corner loading-corner-right">
        SYSTEM
        <br />
        {ready ? "READY" : "BOOTING"}
      </div>

    </div>
  );
}

export default Loading;