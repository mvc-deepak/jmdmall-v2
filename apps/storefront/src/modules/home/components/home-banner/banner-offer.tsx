"use client";

import Link from "next/link";
import { BannerConfig } from "./banner-data";
import { CouponIcon, ArrowRightIcon } from "./svg-icons";

interface OfferBannerProps {
  config: BannerConfig;
}

export const OfferBanner = ({ config }: OfferBannerProps) => {
  return (
    <section className="offer-banner">
      <div className="offer-banner-content">
        {config.eyebrow && <div className="offer-eyebrow">{config.eyebrow}</div>}

        <h2 className="offer-title">{config.title}</h2>

        <p className="offer-description">{config.description}</p>

        {config.coupon && (
          <div className="offer-coupon-code">
            Use code:{" "}
            <span className="offer-coupon-badge">{config.coupon}</span>
          </div>
        )}
      </div>

      <div className="offer-icon-circle">
        <CouponIcon />
      </div>

      <div className="offer-cta-wrapper">
        <Link
          href={config.buttonUrl}
          className="banner-button offer-cta"
        >
          {config.buttonText}
          <ArrowRightIcon />
        </Link>
        <div className="offer-validity">Valid for first-time users only</div>
      </div>
    </section>
  );
};
