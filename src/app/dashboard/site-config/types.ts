export interface SiteConfig {
  siteName: string;
  tagline: string;
  logoUrl: string;
  heroImage: string;
  heroBadgeText: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroSubtitle: string;
  heroTag1Emoji: string;
  heroTag1Label: string;
  heroTag1Url: string;
  heroTag2Emoji: string;
  heroTag2Label: string;
  heroTag2Url: string;
  heroTag3Emoji: string;
  heroTag3Label: string;
  heroTag3Url: string;
  contactEmail: string;
  contactPhone: string;
  contactLocation: string;
  footerTagline: string;
  aboutTitle: string;
  aboutTitleHighlight: string;
  aboutDescription: string;
  aboutStat1Value: string;
  aboutStat1Label: string;
  aboutStat2Value: string;
  aboutStat2Label: string;
  aboutStat3Value: string;
  aboutStat3Label: string;
  // Services section
  servicesBadgeText: string;
  servicesSectionTitle: string;
  servicesSectionHighlight: string;
  servicesSectionSubtitle: string;
  service1Title: string;
  service1Description: string;
  service1Icon: string;
  service2Title: string;
  service2Description: string;
  service2Icon: string;
  service3Title: string;
  service3Description: string;
  service3Icon: string;
  service4Title: string;
  service4Description: string;
  service4Icon: string;
  service5Title: string;
  service5Description: string;
  service5Icon: string;
  // Footer columns
  footerCol1Heading: string;
  footerCol1Link1Label: string;
  footerCol1Link1Url: string;
  footerCol1Link2Label: string;
  footerCol1Link2Url: string;
  footerCol1Link3Label: string;
  footerCol1Link3Url: string;
  footerCol1Link4Label: string;
  footerCol1Link4Url: string;
  footerCol2Heading: string;
  footerCol2Link1Label: string;
  footerCol2Link1Url: string;
  footerCol2Link2Label: string;
  footerCol2Link2Url: string;
  footerCol2Link3Label: string;
  footerCol2Link3Url: string;
  footerCol2Link4Label: string;
  footerCol2Link4Url: string;
  footerCol3Heading: string;
  footerCol3Link1Label: string;
  footerCol3Link1Url: string;
  footerCol3Link2Label: string;
  footerCol3Link2Url: string;
  footerCol3Link3Label: string;
  footerCol3Link3Url: string;
  footerCol3Link4Label: string;
  footerCol3Link4Url: string;
  // Footer social & misc
  footerFacebookUrl: string;
  footerInstagramUrl: string;
  footerTwitterUrl: string;
  footerYoutubeUrl: string;
  footerPoweredByText: string;
}

export const siteConfigDefaults: SiteConfig = {
  siteName: "TourVibe",
  tagline: "Car-based tour management",
  logoUrl: "",
  heroImage: "/cover.jpg",
  heroBadgeText: "Your Journey Starts Here",
  heroTitle: "Discover Ireland.",
  heroTitleHighlight: "Ireland.",
  heroSubtitle:
    "Book your next adventure with our curated selection of scenic road trips across the Emerald Isle.",
  heroTag1Emoji: "🌊",
  heroTag1Label: "Wild Atlantic Way",
  heroTag1Url: "",
  heroTag2Emoji: "🏔️",
  heroTag2Label: "Ring of Kerry",
  heroTag2Url: "",
  heroTag3Emoji: "🌿",
  heroTag3Label: "Cliffs of Moher",
  heroTag3Url: "",
  contactEmail: "hello@tourvibe.ie",
  contactPhone: "+353 1 800 0000",
  contactLocation: "Dublin, Ireland",
  footerTagline:
    "Premium car tour management for modern travelers. Experience the island like never before.",
  aboutTitle: "Born from a passion for unforgettable Irish roads.",
  aboutTitleHighlight: "unforgettable",
  aboutDescription:
    "TourVibe was founded by a team of travel enthusiasts who believed that the real Ireland is best discovered from the window of a car — not a tour bus. Every route we offer has been personally driven, refined and handpicked for its scenery, culture and hidden surprises.",
  aboutStat1Value: "8+",
  aboutStat1Label: "Years operating",
  aboutStat2Value: "50+",
  aboutStat2Label: "Destinations",
  aboutStat3Value: "98%",
  aboutStat3Label: "Happy guests",
  servicesBadgeText: "What We Offer",
  servicesSectionTitle: "Every journey, perfectly arranged",
  servicesSectionHighlight: "perfectly",
  servicesSectionSubtitle:
    "From scenic coastal drives to private airport transfers — we handle every detail so you can focus on the experience.",
  service1Title: "Scenic Road Tours",
  service1Description:
    "Explore breathtaking landscapes on handcrafted routes through Ireland's most iconic coastlines, mountains and countryside.",
  service1Icon: "Compass",
  service2Title: "Airport Transfers",
  service2Description:
    "Stress-free, punctual pickups and drop-offs at all major airports — so your journey starts and ends smoothly.",
  service2Icon: "Plane",
  service3Title: "Group Adventures",
  service3Description:
    "Shared experiences for families, friends and travel groups — with spacious vehicles and flexible departure times.",
  service3Icon: "Users",
  service4Title: "Custom Itineraries",
  service4Description:
    "Tell us your dream destinations and we'll craft a tailor-made route that fits your interests, time and budget.",
  service4Icon: "Map",
  service5Title: "24/7 Guest Support",
  service5Description:
    "Our team is always on call — whether you need a route change, local recommendation or emergency assistance.",
  service5Icon: "Headset",
  // Footer columns
  footerCol1Heading: "Services",
  footerCol1Link1Label: "City Tours",
  footerCol1Link1Url: "#",
  footerCol1Link2Label: "Airport Transfers",
  footerCol1Link2Url: "#",
  footerCol1Link3Label: "Corporate Travel",
  footerCol1Link3Url: "#",
  footerCol1Link4Label: "Private Chauffeur",
  footerCol1Link4Url: "#",
  footerCol2Heading: "Company",
  footerCol2Link1Label: "About Us",
  footerCol2Link1Url: "/#about",
  footerCol2Link2Label: "Our Fleet",
  footerCol2Link2Url: "#",
  footerCol2Link3Label: "Blog",
  footerCol2Link3Url: "/blog",
  footerCol2Link4Label: "Reviews",
  footerCol2Link4Url: "/#reviews",
  footerCol3Heading: "Support",
  footerCol3Link1Label: "Help Center",
  footerCol3Link1Url: "#",
  footerCol3Link2Label: "Terms of Service",
  footerCol3Link2Url: "#",
  footerCol3Link3Label: "Privacy Policy",
  footerCol3Link3Url: "#",
  footerCol3Link4Label: "Safety",
  footerCol3Link4Url: "#",
  // Footer social & misc
  footerFacebookUrl: "",
  footerInstagramUrl: "",
  footerTwitterUrl: "",
  footerYoutubeUrl: "",
  footerPoweredByText: "Powered by TourVibe",
};
