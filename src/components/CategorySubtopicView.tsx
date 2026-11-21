import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Category, ProductItem } from '../types/disposal';
import { CATEGORY_SUBTOPICS, getSubTopicImageUrl } from '../data/products';
import { FilterChip, GlassButton, GlassCard, VerdictBadge } from './GlassUI';
import { CurvedCarousel, CurvedCarouselItem } from './CurvedCarousel';

interface CategorySubtopicViewProps {
  category: Category;
  products: ProductItem[];
  onChangeCategory: (category: Category) => void;
  onSelectProduct: (product: ProductItem) => void;
  onBackToDatabase: () => void;
}

const ALL_CATEGORIES: Category[] = [
  'Plastics',
  'Paper',
  'Food Waste',
  'Textiles',
  'Metals',
  'Glass',
  'Packaging',
  'Electronics',
];

export const CategorySubtopicView: React.FC<CategorySubtopicViewProps> = ({
  category,
  products,
  onChangeCategory,
  onSelectProduct,
  onBackToDatabase,
}) => {
  const subTopics = CATEGORY_SUBTOPICS[category] || [];
  const [selectedSubTopic, setSelectedSubTopic] = useState<string | 'All'>('All');

  const categoryProducts = useMemo(
    () => products.filter((p) => p.category === category),
    [products, category]
  );

  const subTopicItems: CurvedCarouselItem[] = useMemo(() => {
    return subTopics.map((sub) => {
      const count = categoryProducts.filter((p) => p.subTopic === sub).length;
      return {
        id: sub,
        title: sub,
        meta: `${category} · ${count} ${count === 1 ? 'item' : 'items'}`,
        imageUrl: getSubTopicImageUrl(category, sub),
        iconType: 'compass',
      };
    });
  }, [subTopics, categoryProducts, category]);

  const displayedProducts = useMemo(() => {
    if (selectedSubTopic === 'All') return categoryProducts;
    return categoryProducts.filter((p) => p.subTopic === selectedSubTopic);
  }, [categoryProducts, selectedSubTopic]);

  return (
    <section className="w-full py-12 lg:py-16 space-y-10 overflow-hidden">
      {/* Breadcrumb & Header */}
      <div className="px-6 md:px-12 lg:px-16 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <GlassButton type="button" size="sm" onClick={onBackToDatabase}>
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Back to Database</span>
          </GlassButton>

          <div className="flex flex-wrap items-center gap-2">
            {ALL_CATEGORIES.map((cat) => (
              <FilterChip
                key={cat}
                label={cat}
                active={cat === category}
                onClick={() => {
                  onChangeCategory(cat);
                  setSelectedSubTopic('All');
                }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2 max-w-3xl">
          <p className="text-xs text-gray-100 [text-shadow:0_1px_10px_rgba(0,0,0,0.9)]">
            {category} &gt; {subTopics.join(', ')}
          </p>
          <h1 className="text-4xl md:text-5xl font-normal tracking-[-0.04em] text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.9)]">
            {category} Sub-Topics
          </h1>
          <p className="text-base text-gray-100 [text-shadow:0_1px_12px_rgba(0,0,0,0.9)]">
            Select a sub-category card below to inspect specific forms, resin behaviors, and
            lower-waste swaps.
          </p>
        </div>
      </div>

      {/* Placement 5: Sub-category Curved Carousel at top of page */}
      <CurvedCarousel
        items={subTopicItems}
        selectedId={selectedSubTopic === 'All' ? undefined : selectedSubTopic}
        ariaLabel={`${category} sub-topics carousel`}
        onSelect={(item) =>
          setSelectedSubTopic((prev) => (prev === item.id ? 'All' : item.id))
        }
      />

      {/* Sub-topic Filter Chips + Matching Items Grid */}
      <div className="px-6 md:px-12 lg:px-16 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <FilterChip
              label={`All ${category}`}
              active={selectedSubTopic === 'All'}
              onClick={() => setSelectedSubTopic('All')}
            />
            {subTopics.map((sub) => (
              <FilterChip
                key={sub}
                label={sub}
                active={selectedSubTopic === sub}
                onClick={() => setSelectedSubTopic(sub)}
              />
            ))}
          </div>
          <p className="text-xs text-gray-100 tabular-nums [text-shadow:0_1px_10px_rgba(0,0,0,0.9)]">
            {displayedProducts.length} matching{' '}
            {displayedProducts.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {displayedProducts.length === 0 ? (
          <GlassCard className="p-8 text-center space-y-3">
            <h2 className="text-xl font-medium text-white">
              No items logged under {selectedSubTopic} yet
            </h2>
            <p className="text-sm text-gray-200">
              Show all {category} items or select another sub-topic card above.
            </p>
            <div>
              <GlassButton type="button" size="sm" onClick={() => setSelectedSubTopic('All')}>
                Show all {category}
              </GlassButton>
            </div>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProducts.map((item) => (
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
                  <VerdictBadge biodegradable={item.biodegradable} compact />
                </div>

                <div className="pt-3.5 border-t border-white/15 flex items-center justify-between gap-3">
                  <p className="text-xs sm:text-sm text-gray-100 truncate">
                    Switch to <span className="font-medium text-white">{item.alternative.name}</span>
                  </p>
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
