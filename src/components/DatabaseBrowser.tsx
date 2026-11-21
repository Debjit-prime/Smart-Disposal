import React, { useMemo, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { Category, ProductItem } from '../types/disposal';
import { CATEGORIES, CATEGORY_IMAGES } from '../data/products';
import { FilterChip, GlassButton, GlassCard, VerdictBadge } from './GlassUI';
import { CurvedCarousel, CurvedCarouselItem } from './CurvedCarousel';

interface DatabaseBrowserProps {
  products: ProductItem[];
  onSelectProduct: (product: ProductItem) => void;
  onOpenCategorySubtopics: (category: Category) => void;
}

type VerdictFilter = 'all' | 'biodegradable' | 'non-biodegradable';
type SortMode = 'fastest' | 'slowest' | 'name';

const CATEGORY_CAROUSEL_LIST: Category[] = [
  'Plastics',
  'Paper',
  'Food Waste',
  'Textiles',
  'Metals',
  'Glass',
  'Packaging',
  'Electronics',
];

export const DatabaseBrowser: React.FC<DatabaseBrowserProps> = ({
  products,
  onSelectProduct,
  onOpenCategorySubtopics,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | Category>('All');
  const [verdictFilter, setVerdictFilter] = useState<VerdictFilter>('all');
  const [sortBy, setSortBy] = useState<SortMode>('fastest');

  const categoryItems: CurvedCarouselItem[] = useMemo(() => {
    return CATEGORY_CAROUSEL_LIST.map((cat) => {
      const count = products.filter((p) => p.category === cat).length;
      return {
        id: cat,
        title: cat,
        meta: `${count} verified ${count === 1 ? 'item' : 'items'}`,
        imageUrl: CATEGORY_IMAGES[cat],
        iconType: 'layers',
      };
    });
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = products.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (verdictFilter === 'biodegradable' && !item.biodegradable) return false;
      if (verdictFilter === 'non-biodegradable' && item.biodegradable) return false;
      if (q) {
        const hit =
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.subTopic.toLowerCase().includes(q) ||
          item.alternative.name.toLowerCase().includes(q) ||
          item.aliases.some((a) => a.toLowerCase().includes(q));
        if (!hit) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'fastest') return a.decompositionDays - b.decompositionDays;
      if (sortBy === 'slowest') return b.decompositionDays - a.decompositionDays;
      return a.name.localeCompare(b.name);
    });
  }, [products, search, selectedCategory, verdictFilter, sortBy]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setVerdictFilter('all');
  };

  return (
    <section className="w-full py-12 lg:py-16 space-y-10 overflow-hidden">
      {/* Header */}
      <div className="px-6 md:px-12 lg:px-16 max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-normal tracking-[-0.04em] text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.9)]">
            Material Database
          </h1>
          <p className="text-base text-gray-100 [text-shadow:0_1px_12px_rgba(0,0,0,0.9)]">
            Select a category in the curved carousel below to filter materials or open its
            sub-topics.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {selectedCategory !== 'All' && (
            <GlassButton
              type="button"
              size="sm"
              onClick={() => onOpenCategorySubtopics(selectedCategory)}
            >
              <span>Explore {selectedCategory} sub-topics</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </GlassButton>
          )}
          <p className="text-sm text-gray-100 tabular-nums [text-shadow:0_1px_10px_rgba(0,0,0,0.9)]">
            Showing {filtered.length} of {products.length} items
          </p>
        </div>
      </div>

      {/* Placement 2: Category Curved Carousel at top */}
      <CurvedCarousel
        items={categoryItems}
        selectedId={selectedCategory === 'All' ? undefined : selectedCategory}
        ariaLabel="Material categories carousel"
        onSelect={(item) => {
          const cat = item.id as Category;
          setSelectedCategory((prev) => (prev === cat ? 'All' : cat));
        }}
      />

      {/* Filter & Grid Content */}
      <div className="px-6 md:px-12 lg:px-16 max-w-7xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="liquid-glass liquid-glass-readable rounded-xl border border-white/25 px-4 py-2.5 flex items-center gap-3 flex-1">
              <Search className="w-4 h-4 text-gray-200 shrink-0" aria-hidden="true" />
              <label htmlFor="db-search" className="sr-only">
                Filter materials
              </label>
              <input
                id="db-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by product, material, or alternative..."
                className="w-full bg-transparent text-sm text-white placeholder:text-gray-200/80 focus:outline-none"
              />
            </div>

            {/* Verdict Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              <FilterChip
                label="All verdicts"
                active={verdictFilter === 'all'}
                onClick={() => setVerdictFilter('all')}
              />
              <FilterChip
                label="Biodegradable"
                active={verdictFilter === 'biodegradable'}
                onClick={() => setVerdictFilter('biodegradable')}
              />
              <FilterChip
                label="Not biodegradable"
                active={verdictFilter === 'non-biodegradable'}
                onClick={() => setVerdictFilter('non-biodegradable')}
              />
            </div>

            {/* Sort Select */}
            <div className="shrink-0">
              <label htmlFor="db-sort" className="sr-only">
                Sort by decomposition time
              </label>
              <select
                id="db-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortMode)}
                className="w-full lg:w-auto liquid-glass liquid-glass-readable border border-white/25 rounded-xl px-4 py-3 text-sm font-medium text-white bg-black/80 focus:outline-none focus:border-white cursor-pointer"
              >
                <option value="fastest" className="bg-black text-white">
                  Decomposition: Fastest first
                </option>
                <option value="slowest" className="bg-black text-white">
                  Decomposition: Slowest first
                </option>
                <option value="name" className="bg-black text-white">
                  Alphabetical (A–Z)
                </option>
              </select>
            </div>
          </div>

          {/* Quick Category Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((category) => (
              <FilterChip
                key={category}
                label={category}
                active={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
              />
            ))}
          </div>
        </div>

        {/* Filtered Grid Below */}
        {filtered.length === 0 ? (
          <GlassCard className="p-10 text-center space-y-4">
            <h2 className="text-xl font-medium text-white">No materials match these filters</h2>
            <p className="text-sm text-gray-200">
              Clear your search term or switch categories to inspect all items.
            </p>
            <div>
              <GlassButton type="button" onClick={resetFilters}>
                Reset filters
              </GlassButton>
            </div>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <GlassCard
                key={item.id}
                onClick={() => onSelectProduct(item)}
                className="p-6 flex flex-col justify-between space-y-6 hover:border-white/50 transition-colors group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 text-xs font-medium text-gray-200">
                    <span className="truncate">
                      {item.category} · {item.subTopic}
                    </span>
                    <span className="tabular-nums text-white/95 shrink-0">
                      {item.decompositionTime}
                    </span>
                  </div>

                  <h2 className="text-xl font-medium tracking-[-0.02em] text-white leading-snug">
                    {item.name}
                  </h2>

                  <div>
                    <VerdictBadge biodegradable={item.biodegradable} compact />
                  </div>
                </div>

                <div className="pt-3.5 border-t border-white/15 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-100 truncate">
                      Switch to <span className="font-medium text-white">{item.alternative.name}</span>
                    </p>
                  </div>
                  <ArrowRight
                    className="w-4 h-4 text-white/80 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0"
                    aria-hidden="true"
                  />
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
