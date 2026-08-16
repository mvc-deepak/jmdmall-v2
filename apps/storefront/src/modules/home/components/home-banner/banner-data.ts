export interface BannerConfig {
  type: "hero" | "features" | "offer";
  eyebrow?: string;
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  discount?: string;
  coupon?: string;
  features?: Array<{
    icon: "lightning" | "star" | "shield";
    title: string;
    description: string;
  }>;
}

export const bannerConfigs: BannerConfig[] = [
  {
    type: "hero",
    eyebrow: "THIS WEEK",
    title: "BIG SAVINGS",
    description: "Up to 40% OFF on everyday essentials",
    discount: "40%",
    buttonText: "SHOP NOW",
    buttonUrl: "/categories",
  },
  {
    type: "features",
    title: "FRESH GROCERIES",
    description: "Everything you need, delivered fast",
    buttonText: "EXPLORE GROCERIES",
    buttonUrl: "/categories/groceries",
    features: [
      {
        icon: "lightning",
        title: "10 Mins",
        description: "Fast Delivery",
      },
      {
        icon: "star",
        title: "Best Prices",
        description: "Guaranteed",
      },
      {
        icon: "shield",
        title: "100% Original",
      },
    ],
  },
  {
    type: "offer",
    eyebrow: "LIMITED TIME OFFER",
    title: "₹100 OFF",
    description: "On your first order above ₹999",
    coupon: "WELCOME100",
    buttonText: "CLAIM OFFER",
    buttonUrl: "/offers",
  },
];
