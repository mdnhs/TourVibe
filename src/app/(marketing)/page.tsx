import { Compass, Headset, Map, Plane, Users } from "lucide-react";

import { db } from "@/lib/db";
import { seededAdminCredentials } from "@/lib/seed";
import { Hero } from "@/components/landing/hero";
import { PopularTours } from "@/components/landing/popular-tours";
import { PopularCars } from "@/components/landing/popular-cars";
import { Services } from "@/components/landing/services";
import { About } from "@/components/landing/about";
import { Reviews } from "@/components/landing/reviews";
import { Contact } from "@/components/landing/contact";

export default async function Home() {
  // Fetch real-time statistics
  const statsData = {
    tourCount: (
      db.prepare("SELECT COUNT(*) as count FROM tour_package").get() as {
        count: number;
      }
    ).count,
    reviewCount: (
      db.prepare("SELECT COUNT(*) as count FROM review").get() as {
        count: number;
      }
    ).count,
    avgRating:
      (
        db.prepare("SELECT AVG(rating) as avg FROM review").get() as {
          avg: number | null;
        }
      ).avg || 0,
    vehicleCount: (
      db.prepare("SELECT COUNT(*) as count FROM vehicle").get() as {
        count: number;
      }
    ).count,
    touristCount: (
      db
        .prepare("SELECT COUNT(*) as count FROM user WHERE role = 'tourist'")
        .get() as {
        count: number;
      }
    ).count,
  };

  // Fetch dynamic reviews
  const dynamicReviews = db
    .prepare(
      `
    SELECT r.comment as quote, u.name, u.role, r.rating
    FROM review r
    JOIN user u ON r.userId = u.id
    ORDER BY r.createdAt DESC
    LIMIT 3
  `,
    )
    .all() as { quote: string; name: string; role: string; rating: number }[];

  // Fallback if no reviews exist
  const displayReviews =
    dynamicReviews.length > 0
      ? dynamicReviews.map((r) => ({
          quote: r.quote,
          name: r.name,
          role: r.role === "tourist" ? `Tourist` : r.role.replace("_", " "),
        }))
      : [
          {
            quote:
              "Everything felt polished, from the airport pickup to the hill-view stopovers. The driver updates were especially useful.",
            name: "Mila Fernandes",
            role: "Tourist from Lisbon",
          },
          {
            quote:
              "Our family trip through the Wild Atlantic Way was flawless — the driver knew every hidden gem along the route.",
            name: "Rafid Hasan",
            role: "Family traveler from Dhaka",
          },
          {
            quote:
              "The itinerary looked premium and the transport was punctual. It felt like a proper guided road experience.",
            name: "Ethan Blake",
            role: "Weekend traveler",
          },
        ];

  // Fetch popular tours with avg rating and review count
  const popularTours = db
    .prepare(
      `
    SELECT
      tp.id, tp.name, tp.description, tp.price, tp.duration, tp.maxPersons, tp.thumbnail,
      AVG(r.rating) as avgRating,
      COUNT(r.id) as reviewCount
    FROM tour_package tp
    LEFT JOIN review r ON r.tourPackageId = tp.id
    GROUP BY tp.id
    ORDER BY reviewCount DESC, tp.createdAt DESC
    LIMIT 6
  `,
    )
    .all() as {
      id: string;
      name: string;
      description: string | null;
      price: number;
      duration: string;
      maxPersons: number;
      thumbnail: string;
      avgRating: number | null;
      reviewCount: number;
    }[];

  // Fetch popular cars ordered by tour appearances
  const popularCars = db
    .prepare(
      `
    SELECT
      v.id, v.make, v.model, v.year, v.licensePlate, v.thumbnail,
      COUNT(tpv.tourPackageId) as tourCount
    FROM vehicle v
    LEFT JOIN tour_package_vehicle tpv ON tpv.vehicleId = v.id
    GROUP BY v.id
    ORDER BY tourCount DESC, v.createdAt DESC
    LIMIT 6
  `,
    )
    .all() as {
      id: string;
      make: string;
      model: string;
      year: number;
      licensePlate: string;
      thumbnail: string;
      tourCount: number;
    }[];

  // Fetch a flagship ride (the latest tour package)
  const flagshipTour = db
    .prepare(
      `
    SELECT tp.name, tp.price, tp.duration, tp.maxPersons,
           (SELECT COUNT(*) FROM tour_package_vehicle WHERE tourPackageId = tp.id) as vehicleCount
    FROM tour_package tp
    ORDER BY tp.createdAt DESC
    LIMIT 1
  `,
    )
    .get() as
    | {
        name: string;
        price: number;
        duration: string;
        maxPersons: number;
        vehicleCount: number;
      }
    | undefined;

  // Fetch one driver for the flagship ride display
  const flagshipDriver = db
    .prepare(
      `
    SELECT name FROM user WHERE role = 'driver' LIMIT 1
  `,
    )
    .get() as { name: string } | undefined;

  const services = [
    {
      title: "Scenic Road Tours",
      description:
        "Explore breathtaking landscapes on handcrafted routes through Ireland's most iconic coastlines, mountains and countryside.",
      icon: Compass,
    },
    {
      title: "Airport Transfers",
      description:
        "Stress-free, punctual pickups and drop-offs at all major airports — so your journey starts and ends smoothly.",
      icon: Plane,
    },
    {
      title: "Group Adventures",
      description:
        "Shared experiences for families, friends and travel groups — with spacious vehicles and flexible departure times.",
      icon: Users,
    },
    {
      title: "Custom Itineraries",
      description:
        "Tell us your dream destinations and we'll craft a tailor-made route that fits your interests, time and budget.",
      icon: Map,
    },
    {
      title: "24/7 Guest Support",
      description:
        "Our team is always on call — whether you need a route change, local recommendation or emergency assistance.",
      icon: Headset,
    },
  ];

  const stats = [
    { label: "Tour Packages", value: `${statsData.tourCount}+` },
    { label: "Fleet Vehicles", value: `${statsData.vehicleCount}+` },
    { label: "Happy Travelers", value: `${statsData.touristCount}+` },
    { label: "Guest Reviews", value: `${statsData.reviewCount}+` },
  ];

  return (
    <div className="min-h-screen text-slate-900">
      <Hero stats={stats} />

      <PopularTours tours={popularTours} />

      <PopularCars cars={popularCars} />

      <Services services={services} />

      <About />

      <Reviews reviews={displayReviews} />

      <Contact />
    </div>
  );
}
