import Link from "next/link";
import { CarFront } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <CarFront className="h-6 w-6 text-amber-600" />
              <span className="text-xl font-bold tracking-tight">TourVibe</span>
            </Link>
            <p className="text-sm text-slate-500">
              Premium car tour management for modern travelers. Experience the city like never before.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-slate-900">Services</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>City Tours</li>
              <li>Airport Transfers</li>
              <li>Corporate Travel</li>
              <li>Private Chauffeur</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-slate-900">Company</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>About Us</li>
              <li>Our Fleet</li>
              <li>Reviews</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-slate-900">Support</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>Help Center</li>
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
              <li>Safety</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} TourVibe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
