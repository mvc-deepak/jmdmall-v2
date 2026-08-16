"use client";

import Link from "next/link";
import { BannerConfig } from "./banner-data";
import {
  BasketIcon,
  LightningIcon,
  StarIcon,
  ShieldIcon,
  ArrowRightIcon,
} from "./svg-icons";

interface FeaturesBannerProps {
  config: BannerConfig;
}

const getFeatureIcon = (
  icon: "lightning" | "star" | "shield"
) => {
  switch (icon) {
    case "lightning":
      return <LightningIcon />;
    case "star":
      return <StarIcon />;
    case "shield":
      return <ShieldIcon />;
    default:
      return null;
  }
};

export const FeaturesBanner = ({ config }: FeaturesBannerProps) => {
  return (
    <section className="features-banner">
      <div className="features-banner-main">
        <div className="features-icon-wrapper">
          <BasketIcon />
        </div>

        <h2 className="features-title">{config.title}</h2>

        <p className="features-description">{config.description}</p>

        <Link
          href={config.buttonUrl}
          className="banner-button features-cta"
        >
          {config.buttonText}
          <ArrowRightIcon />
        </Link>
      </div>

      <div className="features-divider" />

      <div className="features-list">
        {config.features?.map((feature, idx) => (
          <div key={idx} className="feature-item">
            <div className="feature-item-icon">
              {getFeatureIcon(feature.icon)}
            </div>
            <div className="feature-item-title">{feature.title}</div>
            {feature.description ? (
              <div className="feature-item-subtitle">{feature.description}</div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
};
