import { listCategories } from "@lib/data/categories";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import "./jmdmall-footer.css";

export default async function JMDMALLFooter() {
  const allProductCategories = await listCategories();
  const productCategories = (allProductCategories || []).filter(
    (category) => !category.parent_category
  );

  if (!productCategories?.length) return null;

  return (
    <footer className="jmdmall-footer">
      <div className="footer-container">
        <div className="footer-categories-header">
          <span className="footer-label">SHOP BY CATEGORIES</span>
        </div>
        <ul className="footer-categories-grid">
          {productCategories.map((category) => (
            <li key={category.id}>
              <LocalizedClientLink
                href={`/categories/${category.handle}`}
                className="footer-category-link"
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
