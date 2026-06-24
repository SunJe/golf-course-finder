import { collectionLandingPages } from "../lib/collectionLanding";
import { regionLandingPages } from "../lib/regionLanding";
import {
  COLLECTION_BACKGROUND_PROMPTS,
  COURSE_POOL_PROMPTS,
  REGION_BACKGROUND_PROMPTS,
} from "./lib/seoBackgroundPrompts";

console.log("=== Collection background prompts ===\n");
for (const page of collectionLandingPages) {
  const prompt =
    COLLECTION_BACKGROUND_PROMPTS[page.slug] ??
    `Ultra realistic golf course photo for ${page.title}, no text, no logo`;
  console.log(`[${page.slug}]`);
  console.log(`  → public/seo-images/backgrounds/collections/${page.slug}.jpg`);
  console.log(`  prompt: ${prompt}\n`);
}

console.log("\n=== Region background prompts ===\n");
for (const page of regionLandingPages) {
  const prompt =
    REGION_BACKGROUND_PROMPTS[page.slug] ??
    `Ultra realistic golf course photo for ${page.label}, no text, no logo`;
  console.log(`[${page.slug}]`);
  console.log(`  → public/seo-images/backgrounds/regions/${page.slug}.jpg`);
  console.log(`  prompt: ${prompt}\n`);
}

console.log("\n=== Course pool (12 variants) ===\n");
COURSE_POOL_PROMPTS.forEach((prompt, i) => {
  console.log(`[_pool/${i + 1}.jpg] ${prompt}\n`);
});

console.log("Save images, then run: npm run generate:seo-images");
