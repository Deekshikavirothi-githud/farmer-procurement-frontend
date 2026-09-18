import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Cpu,
  MapPin,
  Menu,
  MoveRight,
  Radio,
  Sparkles,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";

const modules = [
  {
    number: "01",
    title: "Schedule Intelligence",
    short: "Know before you go.",
    description:
      "Procurement schedules become visible in one clear flow, reducing uncertainty before a farmer reaches the centre.",
    icon: CalendarDays,
    metric: "LIVE SCHEDULE",
  },
  {
    number: "02",
    title: "Digital Queue",
    short: "See your place in line.",
    description:
      "A digital queue turns an invisible waiting process into a trackable journey with live position updates.",
    icon: Users,
    metric: "QUEUE POSITION",
  },
  {
    number: "03",
    title: "Wait-Time Intelligence",
    short: "Turn waiting into a prediction.",
    description:
      "Historical and live procurement signals can be used to estimate expected waiting time and centre congestion.",
    icon: Clock3,
    metric: "AI ESTIMATE",
  },
  {
    number: "04",
    title: "Smart Recommendations",
    short: "Make the next decision smarter.",
    description:
      "The system connects schedule, queue and centre conditions to surface useful next-step recommendations.",
    icon: Sparkles,
    metric: "SMART ACTION",
  },
];

function Landing({ onEnter, onRegister }) {
  const [activeModule, setActiveModule] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveModule((current) => (current + 1) % modules.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setMenuOpen(false);
  };

  const ActiveIcon = modules[activeModule].icon;

  return (
    <div
      className="fpis-landing"
    >
      {/* =========================================================
          CINEMATIC BACKGROUND
      ========================================================== */}

      <div className="fpis-ocean-background">
        <div className="fpis-ocean-sky" />
        <div className="fpis-ocean-glow" />
        <div className="fpis-ocean-horizon" />

        <div className="fpis-wave fpis-wave-one" />
        <div className="fpis-wave fpis-wave-two" />
        <div className="fpis-wave fpis-wave-three" />

        <div className="fpis-grain" />
      </div>

      <div className="fpis-cursor-glow" />

      {/* =========================================================
          NAVIGATION
      ========================================================== */}

      <header className={`fpis-nav ${scrolled ? "is-scrolled" : ""}`}>
        <div
          className="fpis-brand"
          onClick={() => scrollTo("fpis-home")}
          role="button"
          tabIndex={0}
        >
          <div className="fpis-brand-mark">
            <span />
            <span />
            <span />
          </div>

          <div>
            <div className="fpis-brand-name">FPIS</div>
            <div className="fpis-brand-sub">FARMER PROCUREMENT</div>
          </div>
        </div>

        <nav className={`fpis-desktop-nav ${menuOpen ? "open" : ""}`}>
          <button onClick={() => scrollTo("fpis-home")}>Home</button>
          <button onClick={() => scrollTo("fpis-system")}>System</button>
          <button onClick={() => scrollTo("fpis-intelligence")}>
            Intelligence
          </button>
          <button onClick={() => scrollTo("fpis-journey")}>Journey</button>
        </nav>

        <div className="fpis-nav-actions">
          <button
            className="fpis-nav-login"
            onClick={onEnter}
          >
            Sign in
          </button>

          <button
            className="fpis-nav-cta"
            onClick={onRegister}
          >
            Create profile
            <ArrowRight size={15} />
          </button>

          <button
            className="fpis-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* =========================================================
          CINEMATIC HERO
      ========================================================== */}

      <section id="fpis-home" className="fpis-hero fpis-hero-cinematic fpis-hero-v2">
        <div className="fpis-hero-v2-bg" aria-hidden="true">
          <div className="fpis-hero-v2-image" />
          <div className="fpis-hero-v2-overlay" />
          <div className="fpis-hero-v2-glow" />
          <div className="fpis-hero-v2-grid" />
          <div className="fpis-hero-v2-grain" />
        </div>

        <div className="fpis-hero-v2-content">
          <div className="fpis-hero-v2-eyebrow">
            <span className="fpis-live-dot" />
            FARMER PROCUREMENT INTELLIGENCE SYSTEM / 2026
          </div>

          <div className="fpis-hero-v2-title-wrap">
            <div className="fpis-hero-v2-kicker">THE FARMER JOURNEY, REIMAGINED</div>

            <h1 className="fpis-hero-v2-title" aria-label="Procurement made transparent">
              <span className="fpis-hero-v2-word fpis-hero-v2-word-1">Procurement</span>
              <span className="fpis-hero-v2-word fpis-hero-v2-word-2">made</span>
              <span className="fpis-hero-v2-word fpis-hero-v2-word-3">transparent.</span>
            </h1>
          </div>

          <p className="fpis-hero-v2-description">
            One intelligent ecosystem connecting farmers, procurement centres,
            schedules, queues and payments — so every step becomes visible.
          </p>

          <div className="fpis-hero-v2-actions">
            <button className="fpis-primary-button fpis-hero-v2-primary" onClick={onRegister}>
              Create farmer profile
              <ArrowRight size={18} />
            </button>

            <button
              className="fpis-text-button fpis-hero-v2-secondary"
              onClick={onEnter}
            >
              Enter system
              <MoveRight size={17} />
            </button>
          </div>
        </div>

        <div className="fpis-hero-v2-console">
          <div className="fpis-hero-v2-console-top">
            <span>FPIS / LIVE CONSOLE</span>
            <span><i /> ACTIVE</span>
          </div>

          <div className="fpis-hero-v2-console-main">
            <div>
              <small>NEXT PROCUREMENT</small>
              <strong>08:30 <em>AM</em></strong>
              <span><MapPin size={13} /> PROCUREMENT CENTRE</span>
            </div>

            <div className="fpis-hero-v2-console-stat">
              <small>EXPECTED WAIT</small>
              <strong>42<em>MIN</em></strong>
            </div>
          </div>

          <div className="fpis-hero-v2-progress"><span /></div>

          <div className="fpis-hero-v2-console-footer">
            <span>QUEUE POSITION <b>#08</b></span>
            <span>CONFIDENCE <b>94%</b></span>
          </div>
        </div>

        <div className="fpis-hero-v2-float fpis-hero-v2-float-one">
          <span>LIVE QUEUE</span>
          <strong>08</strong>
          <small>farmers ahead</small>
        </div>

        <div className="fpis-hero-v2-float fpis-hero-v2-float-two">
          <span>STATUS</span>
          <strong>READY</strong>
          <small>next slot confirmed</small>
        </div>

        <div className="fpis-hero-v2-bottom">
          <div className="fpis-hero-v2-meta">
            <div><span>01</span><strong>FARMER-FIRST</strong><small>Built around the procurement journey</small></div>
            <div><span>02</span><strong>LIVE VISIBILITY</strong><small>Schedules, queues and status in one flow</small></div>
            <div><span>03</span><strong>INTELLIGENCE LAYER</strong><small>Turn procurement signals into action</small></div>
          </div>

          <button className="fpis-hero-v2-scroll" onClick={() => scrollTo("fpis-problem")}>
            <span>SCROLL TO EXPLORE</span>
            <ChevronDown size={16} />
          </button>
        </div>
      </section>

      {/* =========================================================
          PROBLEM / TRANSFORMATION
      ========================================================== */}

      <section id="fpis-problem" className="fpis-problem-section">
        <div className="fpis-section-label">
          <span>01</span>
          THE GAP
        </div>

        <div className="fpis-problem-grid">
          <div className="fpis-problem-heading">
            <p className="fpis-small-kicker">BEFORE FPIS</p>

            <h2>
              Waiting shouldn't
              <br />
              mean <em>guessing.</em>
            </h2>
          </div>

          <div className="fpis-problem-copy">
            <p>
              A farmer should not have to depend on uncertainty to know
              when, where or how their produce will be procured.
            </p>

            <div className="fpis-problem-lines">
              <div>
                <span>01</span>
                Unknown schedules
              </div>

              <div>
                <span>02</span>
                Invisible queues
              </div>

              <div>
                <span>03</span>
                Uncertain waiting time
              </div>

              <div>
                <span>04</span>
                Fragmented updates
              </div>
            </div>
          </div>
        </div>

        <div className="fpis-transformation">
          <div className="fpis-transform-side">
            <span className="fpis-transform-label">UNCERTAINTY</span>

            <div className="fpis-transform-stack">
              <div>WHEN?</div>
              <div>WHERE?</div>
              <div>HOW LONG?</div>
            </div>
          </div>

          <div className="fpis-transform-arrow">
            <div className="fpis-transform-line" />
            <ArrowRight size={25} />
          </div>

          <div className="fpis-transform-side fpis-transform-after">
            <span className="fpis-transform-label">FPIS</span>

            <div className="fpis-transform-stack">
              <div>YOUR SCHEDULE</div>
              <div>YOUR QUEUE</div>
              <div>YOUR ESTIMATE</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CINEMATIC SYSTEM FLOW
      ========================================================== */}

      <section id="fpis-system" className="fpis-system-section fpis-flow-section">
        <div className="fpis-flow-orbit" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className="fpis-section-header fpis-flow-header">
          <div>
            <div className="fpis-section-label">
              <span>02</span>
              THE PROCUREMENT FLOW
            </div>

            <h2>
              From uncertainty
              <br />
              <span>to one visible journey.</span>
            </h2>
          </div>

          <p>
            Four connected intelligence layers follow the farmer from the
            moment a schedule becomes relevant to the moment the next action
            becomes clear.
          </p>
        </div>

        <div className="fpis-flow-track" aria-label="Procurement intelligence modules">
          <div className="fpis-flow-line">
            <div className="fpis-flow-line-fill" />
          </div>

          {modules.map((module, index) => {
            const Icon = module.icon;
            const isActive = activeModule === index;

            return (
              <button
                key={module.number}
                className={`fpis-flow-card ${isActive ? "active" : ""}`}
                onMouseEnter={() => setActiveModule(index)}
                onFocus={() => setActiveModule(index)}
                onClick={() => setActiveModule(index)}
              >
                <div className="fpis-flow-card-top">
                  <span className="fpis-flow-number">{module.number}</span>
                  <span className="fpis-flow-live">
                    <i />
                    {isActive ? "LIVE" : "READY"}
                  </span>
                </div>

                <div className="fpis-flow-icon">
                  <Icon size={23} strokeWidth={1.7} />
                </div>

                <div className="fpis-flow-copy">
                  <span className="fpis-flow-kicker">{module.metric}</span>
                  <h3>{module.title}</h3>
                  <p>{module.short}</p>
                </div>

                <div className="fpis-flow-expand">
                  <span>{isActive ? module.description : "Explore layer"}</span>
                  <ArrowRight size={16} />
                </div>

                <div className="fpis-flow-progress">
                  <span style={{ width: `${isActive ? 100 : 22 + index * 8}%` }} />
                </div>
              </button>
            );
          })}
        </div>

        <div className="fpis-flow-command">
          <div className="fpis-command-status">
            <span className="fpis-command-dot" />
            SYSTEM FLOW / ACTIVE
          </div>

          <div className="fpis-command-center">
            <span>FARMER</span>
            <MoveRight size={15} />
            <span>SCHEDULE</span>
            <MoveRight size={15} />
            <span>QUEUE</span>
            <MoveRight size={15} />
            <span>INTELLIGENCE</span>
            <MoveRight size={15} />
            <span>ACTION</span>
          </div>

          <span className="fpis-command-index">
            0{activeModule + 1} / 04
          </span>
        </div>
      </section>

      {/* =========================================================
          INTELLIGENCE
      ========================================================== */}

      <section
        id="fpis-intelligence"
        className="fpis-intelligence-section"
      >
        <div className="fpis-intelligence-visual">
          <div className="fpis-radar">
            <div className="fpis-radar-circle circle-one" />
            <div className="fpis-radar-circle circle-two" />
            <div className="fpis-radar-circle circle-three" />

            <div className="fpis-radar-sweep" />

            <div className="fpis-radar-center">
              <Cpu size={24} />
              <span>AI</span>
            </div>

            <div className="fpis-radar-point point-one" />
            <div className="fpis-radar-point point-two" />
            <div className="fpis-radar-point point-three" />
            <div className="fpis-radar-point point-four" />
          </div>

          <div className="fpis-intel-floating intel-one">
            <span>QUEUE LOAD</span>
            <strong>68%</strong>
          </div>

          <div className="fpis-intel-floating intel-two">
            <span>WAIT ESTIMATE</span>
            <strong>42 min</strong>
          </div>

          <div className="fpis-intel-floating intel-three">
            <span>CENTRE STATUS</span>
            <strong>ACTIVE</strong>
          </div>
        </div>

        <div className="fpis-intelligence-content">
          <div className="fpis-section-label">
            <span>03</span>
            THE INTELLIGENCE
          </div>

          <h2>
            Data that
            <br />
            <span>becomes a decision.</span>
          </h2>

          <p>
            Procurement data should not just be stored. It should help
            people understand what happens next.
          </p>

          <div className="fpis-intelligence-list">
            <div>
              <span>01</span>
              <div>
                <strong>Historical signals</strong>
                <small>
                  Learn from previous procurement activity.
                </small>
              </div>
            </div>

            <div>
              <span>02</span>
              <div>
                <strong>Live conditions</strong>
                <small>
                  Combine current queue and centre information.
                </small>
              </div>
            </div>

            <div>
              <span>03</span>
              <div>
                <strong>Actionable insight</strong>
                <small>
                  Turn signals into understandable estimates.
                </small>
              </div>
            </div>
          </div>

          <button
            className="fpis-outline-button"
            onClick={onRegister}
          >
            Explore intelligence
            <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* =========================================================
          PROCUREMENT JOURNEY
      ========================================================== */}

      <section id="fpis-journey" className="fpis-journey-section">
        <div className="fpis-section-header journey-header">
          <div>
            <div className="fpis-section-label">
              <span>04</span>
              THE JOURNEY
            </div>

            <h2>
              From field
              <br />
              <span>to payment.</span>
            </h2>
          </div>

          <p>
            A connected digital journey that gives farmers visibility
            across the procurement lifecycle.
          </p>
        </div>

        <div className="fpis-journey-line">
          <div className="fpis-journey-progress" />

          {[
            ["01", "PROFILE", "Farmer identity"],
            ["02", "CROP", "Produce details"],
            ["03", "SCHEDULE", "Procurement date"],
            ["04", "QUEUE", "Digital position"],
            ["05", "PROCURE", "Status tracking"],
            ["06", "PAYMENT", "Payment visibility"],
          ].map(([number, title, description], index) => (
            <div
              className="fpis-journey-step"
              key={number}
            >
              <div className="fpis-journey-dot">
                {index < 4 ? <CheckCircle2 size={15} /> : number}
              </div>

              <span>{number}</span>
              <strong>{title}</strong>
              <small>{description}</small>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          LIVE DASHBOARD PREVIEW
      ========================================================== */}

      <section className="fpis-dashboard-preview-section">
        <div className="fpis-dashboard-window">
          <div className="fpis-dashboard-topbar">
            <div className="fpis-window-brand">
              <div className="fpis-mini-logo">
                <span />
                <span />
                <span />
              </div>

              FPIS / FARMER CONSOLE
            </div>

            <div className="fpis-window-status">
              <span />
              SYSTEM ONLINE
            </div>
          </div>

          <div className="fpis-dashboard-body">
            <div className="fpis-dashboard-intro">
              <div>
                <span>GOOD MORNING</span>
                <h3>Procurement overview</h3>
              </div>

              <div className="fpis-dashboard-date">
                TODAY / 18 SEP 2026
              </div>
            </div>

            <div className="fpis-dashboard-grid">
              <div className="fpis-dash-card large">
                <div className="fpis-dash-card-head">
                  <span>MY NEXT PROCUREMENT</span>
                  <CalendarDays size={15} />
                </div>

                <div className="fpis-dash-main-value">
                  08:30
                  <small>AM</small>
                </div>

                <div className="fpis-dash-location">
                  <MapPin size={14} />
                  Procurement Centre
                </div>

                <div className="fpis-dash-progress">
                  <div>
                    <span>Preparation</span>
                    <strong>78%</strong>
                  </div>

                  <div className="fpis-progress-track">
                    <span />
                  </div>
                </div>
              </div>

              <div className="fpis-dash-card">
                <div className="fpis-dash-card-head">
                  <span>QUEUE</span>
                  <Users size={15} />
                </div>

                <div className="fpis-dash-number">
                  #08
                </div>

                <span className="fpis-dash-positive">
                  Live position
                </span>
              </div>

              <div className="fpis-dash-card">
                <div className="fpis-dash-card-head">
                  <span>WAIT ESTIMATE</span>
                  <Clock3 size={15} />
                </div>

                <div className="fpis-dash-number">
                  42<span> min</span>
                </div>

                <span className="fpis-dash-positive">
                  Intelligence estimate
                </span>
              </div>

              <div className="fpis-dash-card wide">
                <div className="fpis-dash-card-head">
                  <span>CENTRE ACTIVITY</span>
                  <TrendingUp size={15} />
                </div>

                <div className="fpis-mini-chart">
                  <span style={{ height: "28%" }} />
                  <span style={{ height: "43%" }} />
                  <span style={{ height: "35%" }} />
                  <span style={{ height: "60%" }} />
                  <span style={{ height: "49%" }} />
                  <span style={{ height: "78%" }} />
                  <span style={{ height: "66%" }} />
                  <span style={{ height: "91%" }} />
                  <span style={{ height: "73%" }} />
                  <span style={{ height: "83%" }} />
                  <span style={{ height: "58%" }} />
                  <span style={{ height: "69%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================== */}

      <section className="fpis-final-section">
        <div className="fpis-final-glow" />

        <div className="fpis-final-content">
          <div className="fpis-section-label">
            <span>05</span>
            START HERE
          </div>

          <h2>
            Know the next step.
            <br />
            <span>Before you take it.</span>
          </h2>

          <p>
            Build your procurement journey around information, visibility
            and intelligent decisions.
          </p>

          <div className="fpis-final-actions">
            <button
              className="fpis-primary-button large-button"
              onClick={onRegister}
            >
              Create your profile
              <ArrowRight size={19} />
            </button>

            <button
              className="fpis-text-button"
              onClick={onEnter}
            >
              Already registered?
              <MoveRight size={17} />
            </button>
          </div>
        </div>

        <div className="fpis-final-footer">
          <span>FPIS / FARMER PROCUREMENT INTELLIGENCE SYSTEM</span>
          <span>DESIGNED FOR TRANSPARENCY</span>
        </div>
      </section>
    </div>
  );
}

export default Landing;