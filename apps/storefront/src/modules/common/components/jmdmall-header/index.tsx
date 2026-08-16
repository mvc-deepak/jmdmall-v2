import Link from "next/link";
import "./jmdmall-header.css";
import "./jmdmall-cart.css";
import {
  SearchIcon,
  UserIcon,
  LocationIcon,
  TruckIcon,
  OfferDot,
} from "./header-icons";
import {
  defaultHeaderConfig,
  navigationLinks,
  type HeaderConfig,
} from "./header-config";
import JMDMALLCartServer from "./jmdmall-cart-server";
import JMDMALLHeaderClient from "./jmdmall-header-client";
import JMDMALLWishlist from "./jmdmall-wishlist";
import { retrieveCustomer } from "@lib/data/customer";

interface JMDMALLHeaderProps {
  config?: Partial<HeaderConfig>;
  onSearch?: (query: string) => void;
}

export default async function JMDMALLHeader({
  config = {},
  onSearch,
}: JMDMALLHeaderProps) {
  const customer = await retrieveCustomer();
  const isLoggedIn = !!customer;

  const headerConfig = {
    ...defaultHeaderConfig,
    ...config,
    isLoggedIn,
    userName: customer?.first_name || customer?.email,
  };

  return (
    <header className="jmdmall-header">
      <div className="jmdmall-header-main">
        {/* Main Header Row */}
        <div className="header-top">
          {/* Logo */}
          <Link href="/" className="jmdmall-logo">
            <div className="logo-text-container">
              <div className="brand-name">
                <span className="brand-jmd">JMD</span>
                <span className="brand-mall">MALL</span>
                <span className="brand-com">.com</span>
              </div>
              <div className="brand-tagline">{headerConfig.tagline}</div>
            </div>
          </Link>

          {/* Desktop Search Box - Client Component */}
          <JMDMALLHeaderClient onSearch={onSearch} />

          {/* Location Selector (Desktop/Tablet) */}
          <Link href="/location" className="location-selector">
            <LocationIcon size={20} />
            <div className="location-text">
              <div className="location-label">
                {headerConfig.locationLabel}
              </div>
              <div className="location-name">{headerConfig.location}</div>
            </div>
          </Link>

          {/* Account Button */}
          <Link
            href={isLoggedIn ? "/us/account" : "/us/account"}
            className="account-button"
          >
            <UserIcon size={20} />
            <div className="account-text">
              {isLoggedIn ? (
                <div className="account-action">
                  {customer?.first_name || customer?.email || "Account"}
                </div>
              ) : (
                <div className="account-action">Login</div>
              )}
            </div>
          </Link>

          <JMDMALLWishlist />

          {/* Cart Button - JMDMALL Blinkit-Style */}
          <JMDMALLCartServer />
        </div>

        {/* Mobile Search Row - Client Component */}
        <JMDMALLHeaderClient isMobileOnly onSearch={onSearch} />

        {/* Quick Navigation (Desktop/Tablet) */}
        <nav className="quick-navigation">
          {navigationLinks.map((link, idx) => (
            <Link
              key={idx}
              href={link.href}
              className={`nav-link ${link.highlight ? "highlight" : ""}`}
            >
              {link.highlight && (
                <span className="offer-indicator">
                  <OfferDot />
                </span>
              )}
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Decorative Elements */}
      <div
        className="header-decoration"
        style={{ top: "-30px", right: "10%", opacity: 0.4 }}
      >
        <div
          className="decoration-circle"
          style={{
            width: "150px",
            height: "150px",
          }}
        />
      </div>
    </header>
  );
}
