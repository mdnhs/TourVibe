import { prisma } from "./src/lib/prisma";

async function main() {
  try {
    const settings = await prisma.settings.findMany();
    console.log("Settings found:", settings);
    
    const seo = await prisma.settings.findUnique({ where: { key: "seo" } });
    console.log("SEO settings:", seo);
    
    process.exit(0);
  } catch (error) {
    console.error("Error querying settings:", error);
    process.exit(1);
  }
}

main();
