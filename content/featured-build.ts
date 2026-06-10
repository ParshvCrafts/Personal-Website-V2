export interface StoryBeat {
  label: string; // "Problem" | "Approach" | "Result"
  heading: string;
  body: string;
}

export const FEATURED_BUILD = {
  id: "interlace-fashion-search",
  eyebrow: "Featured Build",
  title: "Interlace — Multimodal Fashion Search",
  image: "interlace.jpg",
  githubUrl: "https://github.com/ParshvCrafts/Multimodal_Search_Engine",
  liveUrl: "https://interlace-fashion.vercel.app/",
  beats: [
    {
      label: "Problem",
      heading: "Search that understands intent",
      body: "Across 29,000 real ASOS products, keyword search collapses on queries like “effortless summer look, not too casual.” Shoppers describe intent; catalogs index keywords.",
    },
    {
      label: "Approach",
      heading: "A 9-step NLU retrieval pipeline",
      body: "FashionCLIP embeddings feed dual FAISS IVFFlat indexes fused by Reciprocal Rank Fusion, with BM25 lexical scoring, multilingual handling, spell correction, and progressive filter relaxation that guarantees non-empty results.",
    },
    {
      label: "Result",
      heading: "Production system on free-tier infra",
      body: "Text, image, and blended text-plus-image queries return semantically ranked results. FastAPI on HuggingFace Spaces, Next.js 15 on Vercel, with Recall@k / Precision@k / MRR evaluated by a formal SearchEvaluator.",
    },
  ] satisfies { label: string; heading: string; body: string }[],
} as const;
