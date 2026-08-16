"use client";

import Link from "next/link";
import { BannerConfig } from "./banner-data";
import { ArrowRightIcon } from "./svg-icons";

interface HeroBannerProps {
  config: BannerConfig;
}

export const HeroBanner = ({ config }: HeroBannerProps) => {
  return (
    <section className="hero-banner">
      <div className="hero-banner-content">
        {config.eyebrow && <div className="hero-eyebrow">{config.eyebrow}</div>}

        <h2 className="hero-title">{config.title}</h2>

        <p className="hero-description">
          Up to{" "}
          <span className="hero-discount-highlight">{config.discount} OFF</span>{" "}
          on everyday essentials
        </p>

        <Link
          href={config.buttonUrl}
          className="banner-button hero-cta"
          style={{
            backgroundColor: "#000",
            color: "#fff",
          }}
        >
          {config.buttonText}
          <ArrowRightIcon />
        </Link>
      </div>

      <div className="hero-discount-circle">
        <div className="hero-discount-label">UP TO</div>
        <div className="hero-discount-value">{config.discount}</div>
        <div className="hero-discount-text">OFF</div>

        <div
          className="discount-circle-decoration"
          style={{ top: "10%", left: "10%" }}
        >
          <div className="decoration-dot" />
        </div>
        <div
          className="discount-circle-decoration"
          style={{ bottom: "15%", right: "12%" }}
        >
          <div className="decoration-line" />
        </div>
      </div>
    </section>
  );
};
