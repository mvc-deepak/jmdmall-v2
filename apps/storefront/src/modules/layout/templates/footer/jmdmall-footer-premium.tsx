"use client";

import LocalizedClientLink from "@modules/common/components/localized-client-link";
import "./jmdmall-footer-premium.css";

export default function JMDMALLFooterPremium({
  categories = [],
}: {
  categories: Array<{ id: string; name: string; handle: string }>;
}) {
  if (!categories?.length) return null;

  return (
    <footer className="jmd-footer">
      <div className="jmd-footer-container">
        <div className="jmd-footer-header">
          <span className="jmd-footer-label">Shop by Categories</span>
        </div>
        <ul className="jmd-footer-categories">
          {categories.map((category) => (
            <li key={category.id}>
              <LocalizedClientLink
                href={`/categories/${category.handle}`}
                className="jmd-category-link"
              >
                {category.name}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
