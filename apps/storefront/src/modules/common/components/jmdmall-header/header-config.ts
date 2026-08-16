export interface HeaderConfig {
  brandName: string;
  tagline: string;
  locationLabel: string;
  location: string;
  deliveryTitle: string;
  deliverySubtitle: string;
  cartCount: number;
  cartTotal?: string;
  isLoggedIn: boolean;
  userName?: string;
}

export const defaultHeaderConfig: HeaderConfig = {
  brandName: "jmdmall",
  tagline: "जय माता दी",
  locationLabel: "Deliver to",
  location: "New Delhi",
  deliveryTitle: "Fast Delivery",
  deliverySubtitle: "At your doorstep",
  cartCount: 0,
  isLoggedIn: false,
};

export const navigationLinks = [
  { label: "All Categories", href: "/categories" },
  { label: "Today's Offers", href: "/offers", highlight: true },
  { label: "New Arrivals", href: "/new" },
  { label: "Best Sellers", href: "/bestsellers" },
  { label: "Groceries", href: "/categories/groceries" },
  { label: "Daily Essentials", href: "/categories/essentials" },
];
