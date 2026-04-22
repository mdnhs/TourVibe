import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSeoSettings } from "@/app/dashboard/seo/actions";

interface TourPackage {
  id: string;
  name: string;
  description: string | null;
  price: number;
  thumbnail: string;
  updatedAt: string;
}

export async function GET() {
  const settings = await getSeoSettings();
  const siteUrl = settings.siteUrl || "https://example.com";
  
  const tours = await db.tourPackage.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      thumbnail: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const items = tours.map((tour) => {
    const tourUrl = `${siteUrl}/tours/${tour.id}`;
    const imageUrl = tour.thumbnail.startsWith("http") 
      ? tour.thumbnail 
      : `${siteUrl}${tour.thumbnail}`;
    
    // Facebook Catalog XML Item
    return `
    <item>
      <g:id>${tour.id}</g:id>
      <g:title><![CDATA[${tour.name}]]></g:title>
      <g:description><![CDATA[${tour.description || tour.name}]]></g:description>
      <g:link>${tourUrl}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>in stock</g:availability>
      <g:price>${tour.price} USD</g:price>
      <g:brand>${settings.siteTitle}</g:brand>
      <g:google_product_category>Travel > Adventure Travel</g:google_product_category>
    </item>`;
  }).join("");

  const xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>${settings.siteTitle} - Tour Packages</title>
    <link>${siteUrl}</link>
    <description>${settings.description}</description>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
