import React, { useEffect, useRef, useState } from 'react';
import { ScanBarcode, Search, Camera, AlertCircle, Plus, RotateCcw } from 'lucide-react';
import { Category, ProductItem } from '../types/disposal';
import { CATEGORIES, SUGGESTED_CHIPS } from '../data/products';
import {
  FilterChip,
  GlassButton,
  GlassCard,
  GlassInput,
  Modal,
  PrimaryButton,
  ResultSkeleton,
} from './GlassUI';

interface ProductCheckerProps {
  products: ProductItem[];
  recentSearches: string[];
  onSelectProduct: (product: ProductItem, searchLabel?: string) => void;
  onSubmitSuggestion: (name: string, category: Category, notes: string) => void;
}

type CheckerStatus = 'idle' | 'loading' | 'not-found' | 'error';

const SAMPLE_BARCODES = [
  { code: '078742123451', label: 'Plastic bag (HDPE/LDPE)' },
  { code: '049000042566', label: 'Aluminum beverage can' },
  { code: '038000138416', label: 'Corrugated cardboard box' },
  { code: '012000001291', label: 'PET plastic water bottle' },
];

export const ProductChecker: React.FC<ProductCheckerProps> = ({
  products,
  recentSearches,
  onSelectProduct,
  onSubmitSuggestion,
}) => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<CheckerStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [lastSearched, setLastSearched] = useState('');

  const [scannerOpen, setScannerOpen] = useState(false);
  const [cameraState, setCameraState] = useState<'requesting' | 'active' | 'unavailable'>('requesting');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestName, setSuggestName] = useState('');
  const [suggestCategory, setSuggestCategory] = useState<Category>('Packaging');
  const [suggestNotes, setSuggestNotes] = useState('');

  // Stop camera stream cleanly when modal closes
  useEffect(() => {
    if (!scannerOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      return;
    }

    let cancelled = false;
    setCameraState('requesting');

    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
          setCameraState('active');
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          if (!cancelled) {
            setCameraState('unavailable');
          }
        });
    } else {
      setCameraState('unavailable');
    }

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [scannerOpen]);

  const findProductMatch = (raw: string): ProductItem | undefined => {
    const normalized = raw.trim().toLowerCase();
    if (!normalized) return undefined;

    // Exact barcode or name match first
    const exact = products.find(
      (p) =>
        p.barcode === normalized ||
        p.name.toLowerCase() === normalized ||
        p.aliases.some((a) => a.toLowerCase() === normalized)
    );
    if (exact) return exact;

    // Partial match
    return products.find(
      (p) =>
        p.name.toLowerCase().includes(normalized) ||
        normalized.includes(p.name.toLowerCase()) ||
        p.aliases.some(
          (a) => a.toLowerCase().includes(normalized) || normalized.includes(a.toLowerCase())
        )
    );
  };

  const runSearch = (rawQuery: string, forceError = false) => {
    const trimmed = rawQuery.trim();
    if (!trimmed) {
      setStatus('error');
      setErrorMsg('Enter a product name or barcode before checking.');
      return;
    }

    setLastSearched(trimmed);
    setStatus('loading');
    setErrorMsg('');

    window.setTimeout(() => {
      if (forceError) {
        setStatus('error');
        setErrorMsg('Unable to reach the material lookup service. Please try again.');
        return;
      }

      const match = findProductMatch(trimmed);
      if (match) {
        setStatus('idle');
        onSelectProduct(match, trimmed);
      } else {
        setSuggestName(trimmed);
        setStatus('not-found');
      }
    }, 380);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  const handleBarcodeLookup = (code: string) => {
    setScannerOpen(false);
    setQuery(code);
    runSearch(code);
  };

  const handleSuggestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestName.trim()) return;
    onSubmitSuggestion(suggestName.trim(), suggestCategory, suggestNotes.trim());
    setSuggestOpen(false);
    setSuggestNotes('');
    setStatus('idle');
    setQuery('');
  };

  return (
    <section className="w-full px-6 md:px-12 lg:px-16 py-12 lg:py-20 min-h-[calc(100vh-170px)] flex flex-col justify-center">
      <div className="max-w-4xl mx-auto w-full space-y-10">
        {/* Heading */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-[-0.04em] text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.9)]">
            Check any product in seconds.
          </h1>
          <p className="text-base md:text-lg text-gray-100 max-w-2xl mx-auto [text-shadow:0_1px_12px_rgba(0,0,0,0.9)]">
            Type an everyday item or scan its barcode to see whether microbes can break it down,
            what it leaves behind, and what to switch to.
          </p>
        </div>

        {/* Centered liquid-glass search bar */}
        <form onSubmit={handleFormSubmit} className="w-full">
          <div className="liquid-glass rounded-xl border border-white/20 p-2 sm:p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="flex items-center gap-3 flex-1 px-3 py-1.5">
              <Search className="w-5 h-5 text-gray-300 shrink-0" aria-hidden="true" />
              <label htmlFor="product-search-input" className="sr-only">
                Product name or barcode
              </label>
              <input
                id="product-search-input"
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (status === 'error' || status === 'not-found') {
                    setStatus('idle');
                  }
                }}
                placeholder="Type a product, e.g. plastic bag, banana peel"
                className="w-full bg-transparent text-base text-white placeholder:text-gray-300 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <GlassButton
                type="button"
                onClick={() => setScannerOpen(true)}
                aria-label="Scan Barcode"
                title="Scan Barcode"
                className="px-4 py-3"
              >
                <ScanBarcode className="w-4 h-4" aria-hidden="true" />
                <span className="sm:hidden lg:inline">Scan Barcode</span>
              </GlassButton>

              <PrimaryButton type="submit" className="px-7 py-3 flex-1 sm:flex-initial">
                Check
              </PrimaryButton>
            </div>
          </div>
        </form>

        {/* Suggested & Recent searches */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs text-gray-300 whitespace-nowrap shrink-0">
              Suggested items
            </span>
            <div className="flex flex-wrap gap-2.5">
              {SUGGESTED_CHIPS.map((chip) => (
                <FilterChip
                  key={chip}
                  label={chip}
                  active={query.toLowerCase() === chip.toLowerCase()}
                  onClick={() => {
                    setQuery(chip);
                    runSearch(chip);
                  }}
                />
              ))}
            </div>
          </div>

          {recentSearches.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-xs text-gray-300 whitespace-nowrap shrink-0">
                Recent searches
              </span>
              <div className="flex flex-wrap gap-2.5">
                {recentSearches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setQuery(item);
                      runSearch(item);
                    }}
                    className="liquid-glass border border-white/20 rounded-lg px-3.5 py-1.5 text-xs text-white hover:bg-white hover:text-black transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic States: Loading, Not Found, Error, Empty */}
        {status === 'loading' && <ResultSkeleton />}

        {status === 'not-found' && (
          <GlassCard className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <h2 className="text-xl font-normal text-white">
                No match found for &ldquo;{lastSearched}&rdquo;
              </h2>
              <p className="text-sm text-gray-300">
                Try a simpler material keyword (like &ldquo;plastic cup&rdquo; or &ldquo;wool&rdquo;)
                or submit this item for our biology team to verify.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <GlassButton
                type="button"
                onClick={() => {
                  setQuery('');
                  setStatus('idle');
                }}
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                Reset
              </GlassButton>
              <PrimaryButton type="button" onClick={() => setSuggestOpen(true)}>
                <Plus className="w-4 h-4" aria-hidden="true" />
                Suggest this item
              </PrimaryButton>
            </div>
          </GlassCard>
        )}

        {status === 'error' && (
          <GlassCard
            className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-white shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1">
                <h2 className="text-base font-medium text-white">Check could not run</h2>
                <p className="text-sm text-gray-300">{errorMsg}</p>
              </div>
            </div>
            <GlassButton
              type="button"
              onClick={() => {
                setStatus('idle');
                setErrorMsg('');
              }}
            >
              Try again
            </GlassButton>
          </GlassCard>
        )}

        {status === 'idle' && (
          <GlassCard className="overflow-hidden grid grid-cols-1 md:grid-cols-12 items-stretch">
            <div className="md:col-span-5 bg-stage relative min-h-[260px] md:min-h-[300px]">
              <div
                className="hero-bg"
                style={{
                  backgroundImage: `url('/assets/aistudio/image_3_f5698fe3.png')`,
                }}
                role="img"
                aria-label="Single-use plastic cup, foil wrapper, and plastic bag resting beside decomposing autumn leaves on soil"
              />
            </div>

            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <p className="text-xs text-gray-300 tabular-nums">
                  {products.length} verified materials indexed
                </p>
                <h2 className="text-2xl sm:text-3xl font-normal tracking-[-0.04em] text-white">
                  Natural fibers return to soil. Synthetic polymers linger.
                </h2>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  Select a suggested product above, enter any material, or scan a retail barcode
                  to compare decomposition timelines side by side.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <GlassButton
                  type="button"
                  size="sm"
                  onClick={() => {
                    setQuery('Plastic bag');
                    runSearch('Plastic bag');
                  }}
                >
                  Inspect Plastic Bag
                </GlassButton>
                <GlassButton
                  type="button"
                  size="sm"
                  onClick={() => {
                    setQuery('Banana peel');
                    runSearch('Banana peel');
                  }}
                >
                  Inspect Banana Peel
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Camera / Barcode Scanner Modal */}
      <Modal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        title="Scan product barcode"
        maxWidthClass="max-w-xl"
      >
        <div className="space-y-6">
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/20 flex items-center justify-center">
            {cameraState === 'active' ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="relative z-[1] w-full h-full object-cover"
              />
            ) : (
              <div className="relative z-[3] text-center p-6 space-y-2">
                <Camera className="w-8 h-8 text-gray-300 mx-auto" aria-hidden="true" />
                <p className="text-sm text-white">
                  {cameraState === 'requesting'
                    ? 'Requesting camera access...'
                    : 'Camera preview unavailable in this browser context.'}
                </p>
                <p className="text-xs text-gray-300">
                  Use one of the sample product barcodes below to test instant lookup.
                </p>
              </div>
            )}

            {/* Minimal viewfinder brackets */}
            <div
              className="pointer-events-none absolute inset-8 z-[3] border border-white/30 rounded-xl"
              aria-hidden="true"
            />
          </div>

          <div className="space-y-3">
            <p className="text-xs text-gray-300">Sample barcode scans</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SAMPLE_BARCODES.map((sample) => (
                <button
                  key={sample.code}
                  type="button"
                  onClick={() => handleBarcodeLookup(sample.code)}
                  className="liquid-glass border border-white/20 rounded-lg px-4 py-3 text-left hover:bg-white hover:text-black transition-colors cursor-pointer group"
                >
                  <div className="text-sm font-medium">{sample.label}</div>
                  <div className="text-xs text-gray-300 group-hover:text-gray-700 tabular-nums">
                    UPC {sample.code}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Suggest New Item Modal */}
      <Modal
        open={suggestOpen}
        onClose={() => setSuggestOpen(false)}
        title="Suggest a new product"
      >
        <form onSubmit={handleSuggestSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="suggest-name" className="block text-xs text-gray-300">
              Product name
            </label>
            <GlassInput
              id="suggest-name"
              value={suggestName}
              onChange={(e) => setSuggestName(e.target.value)}
              placeholder="e.g. Compostable phone case"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="suggest-cat" className="block text-xs text-gray-300">
              Category
            </label>
            <select
              id="suggest-cat"
              value={suggestCategory}
              onChange={(e) => setSuggestCategory(e.target.value as Category)}
              className="w-full liquid-glass border border-white/20 rounded-xl px-4 py-3 text-sm text-white bg-black focus:outline-none focus:border-white"
            >
              {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                <option key={cat} value={cat} className="bg-black text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="suggest-notes" className="block text-xs text-gray-300">
              Material notes or packaging label (optional)
            </label>
            <textarea
              id="suggest-notes"
              rows={3}
              value={suggestNotes}
              onChange={(e) => setSuggestNotes(e.target.value)}
              placeholder="Any resin code, fiber blend, or certification printed on the item"
              className="w-full liquid-glass border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:border-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <GlassButton type="button" onClick={() => setSuggestOpen(false)}>
              Cancel
            </GlassButton>
            <PrimaryButton type="submit">Submit for review</PrimaryButton>
          </div>
        </form>
      </Modal>
    </section>
  );
};
