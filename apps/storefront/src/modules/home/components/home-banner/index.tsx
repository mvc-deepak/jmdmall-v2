"use client";

import "./home-banner.css";
import { HeroBanner } from "./banner-hero";
import { FeaturesBanner } from "./banner-features";
import { OfferBanner } from "./banner-offer";
import { bannerConfigs } from "./banner-data";

export default function HomeBanner() {
  return (
    <div className="home-banner-container">
      <HeroBanner config={bannerConfigs[0]} />
      <FeaturesBanner config={bannerConfigs[1]} />
      <OfferBanner config={bannerConfigs[2]} />
    </div>
  );
}
