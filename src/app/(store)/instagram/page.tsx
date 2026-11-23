export const dynamic = "force-dynamic";

import Link from "next/link";
import { getCachedStoreTheme } from "@/lib/theme-cache";
import { resolveStoreTheme } from "@/lib/themes-registry";
import {
  ExternalLink,
  Heart,
  Instagram,
  ShoppingBag,
  Sparkles,
  Play,
  ArrowRight,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";

export default async function InstagramPage() {
  let dbTheme: any = null;
  try {
    dbTheme = await getCachedStoreTheme();
  } catch (e) {}

  let customOverrides: any = {};
  try {
    if (dbTheme?.socialLinksJson) {
      customOverrides = JSON.parse(dbTheme.socialLinksJson);
    }
  } catch (e) {}

  const themeDef = resolveStoreTheme(dbTheme?.activeTheme || "AITHRITHI_MAROON", dbTheme);

  const instagramUrl = customOverrides.instagramUrl || "https://instagram.com/aithrithi.in";
  const instagramHandle = customOverrides.instagramHandle || "@aithrithi.in";
  const rawNumber = customOverrides.whatsappNumber || dbTheme?.supportPhone || "+919496590984";
  const cleanNumber = rawNumber.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent("Hello Aithrithi! I loved your Instagram collection and would like to inquire about designs.")}`;

  const posts =
    Array.isArray(customOverrides.instagramPosts) && customOverrides.instagramPosts.length > 0
      ? customOverrides.instagramPosts
      : [
          {
            id: "ig-1",
            imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
            caption: "Crimson Zari Kanjivaram Silk Saree · Devika's signature handloom edition draped with royal elegance.",
            likes: "4.8k",
            postUrl: instagramUrl,
            category: "Handloom Saree",
            isVideo: false,
          },
          {
            id: "ig-2",
            imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
            caption: "Pure Tussar Silk Saree in Raw Honey Gold · Handwoven with generational heritage craftsmanship.",
            likes: "3.2k",
            postUrl: instagramUrl,
            category: "Tussar Silk",
            isVideo: true,
          },
          {
            id: "ig-3",
            imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
            caption: "Festive Embroidered Kurti Set with Banarasi Dupatta · Styled for grand celebrations.",
            likes: "2.9k",
            postUrl: instagramUrl,
            category: "Designer Kurti",
            isVideo: false,
          },
          {
            id: "ig-4",
            imageUrl: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80",
            caption: "Regal Emerald Green Chanderi Silk · Delicate zari motifs finished by hand.",
            likes: "5.1k",
            postUrl: instagramUrl,
            category: "Chanderi Silk",
            isVideo: true,
          },
          {
            id: "ig-5",
            imageUrl: "https://images.unsplash.com/photo-1610030469668-935a8df2d2d0?auto=format&fit=crop&w=800&q=80",
            caption: "Pastel Mulberry Handloom Drape · The art of effortless Indian luxury.",
            likes: "3.6k",
            postUrl: instagramUrl,
            category: "Mulberry Silk",
            isVideo: false,
          },
          {
            id: "ig-6",
            imageUrl: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=800&q=80",
            caption: "Artisan BTS · Behind the looms in Varanasi & Kanchipuram weaving Devika's new festive line.",
            likes: "6.4k",
            postUrl: instagramUrl,
            category: "Atelier BTS",
            isVideo: true,
          },
        ];

  return (
    <div className="min-h-screen bg-[#FAF7F5] pb-24 font-sans text-slate-900">
      {/* Top Banner / Hero Profile Card */}
      <section className="bg-gradient-to-b from-[#58111A] to-[#36080F] text-white pt-8 sm:pt-14 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle Decorative Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C5A880_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-5">
          {/* Instagram Camera Icon with Gradient Ring */}
          <div className="inline-flex p-1 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-xl">
            <div className="p-3.5 rounded-full bg-[#58111A] text-white">
              <Instagram className="w-8 h-8 sm:w-10 sm:h-10 text-[#FAF7F5]" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#C5A880] text-xs font-serif font-medium tracking-[0.16em] uppercase mb-2 border border-[#C5A880]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Instagram Gallery</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-white flex items-center justify-center gap-2.5">
              <span>Aithrithi by Devika</span>
              <CheckCircle2 className="w-6 h-6 text-sky-400 fill-sky-400" />
            </h1>
            <p className="text-base sm:text-lg font-serif italic text-[#C5A880] mt-1">
              {instagramHandle}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto leading-relaxed font-sans font-normal">
            Immerse yourself in generational handloom mastery, authentic bridal drapes, and behind-the-scenes moments from Devika&apos;s weaving ateliers. Tag{" "}
            <span className="text-[#C5A880] font-semibold">#AithrithiDevika</span> to be featured.
          </p>

          {/* Social Stats Pill */}
          <div className="inline-flex items-center gap-6 sm:gap-10 py-2.5 px-6 rounded-2xl bg-white/5 border border-white/10 text-xs text-stone-200">
            <div>
              <strong className="block text-sm sm:text-base font-serif text-white">{posts.length}</strong>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-stone-400">Curated Looks</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div>
              <strong className="block text-sm sm:text-base font-serif text-white">28.4K</strong>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-stone-400">Community</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div>
              <strong className="block text-sm sm:text-base font-serif text-white">100%</strong>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-stone-400">Pure Handloom</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white font-serif font-medium tracking-[0.14em] uppercase text-xs shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 active:scale-95"
            >
              <Instagram className="w-4 h-4" />
              <span>Follow on Instagram</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-serif font-medium tracking-[0.14em] uppercase text-xs shadow-md transition-all duration-300 hover:scale-105 flex items-center gap-2 active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>

            <Link
              href="/shop"
              className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-serif font-medium tracking-[0.14em] uppercase text-xs transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Shop All Collections</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Lookbook Gallery Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-14 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-black/5 pb-4">
          <div>
            <span className="text-[11px] font-serif font-medium tracking-[0.18em] uppercase text-[#C5A880] block">
              Curated Lookbook
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-slate-900">
              Atelier Looks & Reels
            </h2>
          </div>
          <p className="text-xs text-stone-500 font-sans max-w-sm">
            Click on any look to open on Instagram or browse matched artisanal handlooms in our store.
          </p>
        </div>

        {/* Gallery Masonry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {posts.map((post: any, idx: number) => (
            <div
              key={post.id || idx}
              className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-500 flex flex-col justify-between"
            >
              {/* Media Image Container */}
              <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden">
                <img
                  src={post.imageUrl}
                  alt={post.caption || "Aithrithi Instagram Look"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-serif font-medium uppercase tracking-[0.14em] bg-[#58111A]/90 text-white backdrop-blur-sm border border-[#C5A880]/30 shadow-xs">
                    {post.category || "Atelier Look"}
                  </span>

                  {post.isVideo && (
                    <span className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                    </span>
                  )}
                </div>

                {/* Bottom Floating Stats on Image */}
                <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between text-xs font-serif z-10">
                  <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    <span>{post.likes || "2.5k"}</span>
                  </div>

                  <a
                    href={post.postUrl || instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-900 backdrop-blur-md transition-colors"
                    title="View on Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Caption & Actions */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <p className="text-xs text-stone-700 leading-relaxed font-sans line-clamp-2">
                  {post.caption}
                </p>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                  <a
                    href={post.postUrl || instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-serif font-medium tracking-[0.12em] uppercase text-[#58111A] hover:underline flex items-center gap-1"
                  >
                    <span>View on Instagram</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <Link
                    href="/shop"
                    className="px-3 py-1.5 rounded-lg bg-[#58111A] hover:bg-[#36080F] text-white text-[11px] font-serif font-medium tracking-[0.12em] uppercase transition flex items-center gap-1"
                  >
                    <span>Shop Style</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Callout */}
        <div className="text-center pt-8 border-t border-stone-200">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#58111A] text-white font-serif font-medium tracking-[0.14em] uppercase text-xs hover:bg-[#36080F] shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Instagram className="w-4 h-4" />
            <span>Follow {instagramHandle} on Instagram for Daily Looks</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>
    </div>
  );
}
