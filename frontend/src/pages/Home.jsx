import React from 'react';
import { Link } from 'react-router-dom';
import HomeHeader from '../components/HomeHeader';
import { useAuth } from '../auth';
import '../styles/Home.css';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <HomeHeader />
      <main className="home-content">
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-hero__content">
            <p className="home-eyebrow">Momentum Fitness Tracker</p>
            <h1 id="home-title">Train with consistency.</h1>
            <p className="home-lead">
              Log workouts fast, track progress clearly, and keep building momentum week after week.
            </p>

            <div className="home-hero__actions">
              <Link className="home-cta home-cta--primary" to={user ? '/dashboard' : '/signin'}>
                {user ? 'Open Dashboard' : 'Get Started'}
              </Link>
            </div>

            <p className="home-scroll-hint">Scroll to see features</p>
          </div>

          <div className="home-hero__media" aria-hidden="true">
            <img src="/Runner.png" alt="" className="home-hero__runner" />
          </div>
        </section>

        <section className="home-section" aria-labelledby="what-it-does-title">
          <h2 id="what-it-does-title">What you can do with Momentum</h2>
          <div className="home-feature-grid">
            <article className="home-feature-card">
              <h3>Log workouts without friction</h3>
              <p>Add sessions in seconds with focused forms built for real training days.</p>
            </article>
            <article className="home-feature-card">
              <h3>Review and adjust your training</h3>
              <p>Keep your workout history organized so your plan reflects what you actually do.</p>
            </article>
            <article className="home-feature-card">
              <h3>Stay motivated with trends</h3>
              <p>Use dashboard trends to spot progress early and stay consistent long term.</p>
            </article>
          </div>
        </section>

        <section className="home-section home-section--compact" aria-labelledby="quality-title">
          <h2 id="quality-title">Built for real gym habits</h2>
          <div className="home-quality-grid">
            <div className="home-quality-item">Simple daily flow: log, review, improve</div>
            <div className="home-quality-item">Clean screens that stay readable while training</div>
            <div className="home-quality-item">Progress views that make consistency obvious</div>
            <div className="home-quality-item">Built to support long-term training discipline</div>
          </div>
        </section>
      </main>
    </div>
  );
}