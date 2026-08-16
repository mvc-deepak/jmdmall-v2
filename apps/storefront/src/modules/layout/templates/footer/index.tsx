import { listCategories } from "@lib/data/categories";
import { listCollections } from "@lib/data/collections";
import { Text } from "@modules/common/components/ui";

import LocalizedClientLink from "@modules/common/components/localized-client-link";
import MedusaCTA from "@modules/layout/components/medusa-cta";
import JMDMALLFooterPremium from "./jmdmall-footer-premium";
import "./jmdmall-footer.css";

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  });
  const allProductCategories = await listCategories();
  const productCategories = (allProductCategories || []).filter(
    (category) => !category.parent_category
  );

  return (
    <>
      {/* PART 1: Categories Section */}
      <footer className="border-t border-ui-border-base w-full">
        <div className="content-container flex flex-col w-full">
          <div className="flex flex-col gap-y-8 py-12">
            <div>
              {productCategories && productCategories?.length > 0 && (
                <div className="flex flex-col gap-y-2 col-span-full">
                  <span className="txt-small-plus txt-ui-fg-base">
                    Categories
                  </span>
                  <ul className="grid grid-cols-3 gap-x-4 gap-y-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 text-ui-fg-subtle txt-small">
                    {productCategories?.map((c) => {
                      if (c.parent_category) {
                        return;
                      }

                      const children =
                        c.category_children?.map((child) => ({
                          name: child.name,
                          handle: child.handle,
                          id: child.id,
                        })) || null;

                      return (
                        <li key={c.id}>
                          <LocalizedClientLink
                            className="hover:text-ui-fg-base"
                            href={`/categories/${c.handle}`}
                            data-testid="category-link"
                          >
                            {c.name}
                          </LocalizedClientLink>
                          {children && (
                            <ul className="grid grid-cols-1 ml-3 gap-y-2">
                              {children &&
                                children.map((child) => (
                                  <li key={child.id}>
                                    <LocalizedClientLink
                                      className="hover:text-ui-fg-base"
                                      href={`/categories/${child.handle}`}
                                      data-testid="category-link"
                                    >
                                      {child.name}
                                    </LocalizedClientLink>
                                  </li>
                                ))}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-3">
                <span className="txt-small-plus txt-ui-fg-base">
                  Collections
                </span>
                <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2 text-ui-fg-subtle txt-small">
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-ui-fg-base transition-colors"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="flex w-full mb-16 justify-between text-ui-fg-muted">
            <Text className="txt-compact-small">
              © {new Date().getFullYear()} Medusa Store. All rights reserved.
            </Text>
            <MedusaCTA />
          </div>
        </div>
      </footer>

      {/* PART 2: Premium JMDMALL Footer */}
      <JMDMALLFooterPremium categories={[]} />
    </>
  );
}
