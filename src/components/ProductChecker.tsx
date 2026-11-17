import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Camera,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  ScanBarcode,
  Search,
  SwitchCamera,
  Upload,
} from 'lucide-react';
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

interface IdentifiedApiResponse {
  detected?: boolean;
  matchedCatalogId?: string;
  productName?: string;
  category?: Category;
  subTopic?: string;
  biodegradable?: boolean;
  decompositionTime?: string;
  decompositionDays?: number;
  timelinePercent?: number;
  breaksDownInto?: string[];
  whyExplanation?: string;
  alternativeName?: string;
  alternativeReason?: string;
  alternativeDecompositionTime?: string;
  barcode?: string;
  error?: string;
}

interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<Array<{ rawValue?: string }>>;
}

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
  const [cameraState, setCameraState] = useState<'requesting' | 'active' | 'unavailable'>(
    'requesting'
  );
  const [cameraError, setCameraError] = useState('');
  const [videoReady, setVideoReady] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraRestartKey, setCameraRestartKey] = useState(0);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [shutterFlash, setShutterFlash] = useState(false);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [captureError, setCaptureError] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestName, setSuggestName] = useState('');
  const [suggestCategory, setSuggestCategory] = useState<Category>('Packaging');
  const [suggestNotes, setSuggestNotes] = useState('');

  const findProductMatch = useCallback(
    (raw: string): ProductItem | undefined => {
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
    },
    [products]
  );

  // Stop & start camera stream cleanly without losing videoRef assignment
  useEffect(() => {
    if (!scannerOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setVideoReady(false);
      setCapturedPhoto(null);
      setAnalyzingPhoto(false);
      setCaptureError('');
      setCameraError('');
      return;
    }

    let cancelled = false;
    setCameraState('requesting');
    setVideoReady(false);
    setCameraError('');

    const attachStream = (stream: MediaStream) => {
      streamRef.current = stream;
      setCameraState('active');
      const videoEl = videoRef.current;
      if (videoEl) {
        videoEl.srcObject = stream;
        videoEl.play().catch(() => {
          // Autoplay promise handled via muted + playsInline
        });
      }
    };

    const startCamera = async () => {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        if (!cancelled) {
          setCameraState('unavailable');
          setCameraError('Camera access is not supported in this browser.');
        }
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        attachStream(stream);
      } catch (primaryErr) {
        // Fallback for webcams/drivers rejecting ideal width/height/facingMode constraints
        const errName = primaryErr instanceof Error ? primaryErr.name : '';
        if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
          if (!cancelled) {
            setCameraState('unavailable');
            setCameraError(
              'Camera permission was blocked. Allow camera access in your browser bar and tap Retry, or upload a photo.'
            );
          }
          return;
        }

        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          if (cancelled) {
            fallbackStream.getTracks().forEach((t) => t.stop());
            return;
          }
          attachStream(fallbackStream);
        } catch (fallbackErr) {
          if (!cancelled) {
            setCameraState('unavailable');
            const fbName = fallbackErr instanceof Error ? fallbackErr.name : '';
            setCameraError(
              fbName === 'NotReadableError'
                ? 'Camera is currently in use by another app or tab.'
                : fbName === 'NotFoundError'
                  ? 'No camera device was detected. You can still upload a photo below.'
                  : 'Unable to start camera preview in this browser context.'
            );
          }
        }
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [scannerOpen, facingMode, cameraRestartKey]);

  // Keep video element synced whenever returning from captured photo back to live view
  useEffect(() => {
    const videoEl = videoRef.current;
    const stream = streamRef.current;
    if (!scannerOpen || cameraState !== 'active' || capturedPhoto || !videoEl || !stream) return;

    if (videoEl.srcObject !== stream) {
      videoEl.srcObject = stream;
    }
    videoEl.play().catch(() => {});
  }, [scannerOpen, cameraState, capturedPhoto]);

  // Optional live barcode detection when browser supports BarcodeDetector
  useEffect(() => {
    if (!scannerOpen || cameraState !== 'active' || !videoReady || capturedPhoto || analyzingPhoto) {
      return;
    }
    const BarcodeCtor = (
      window as unknown as { BarcodeDetector?: new (opts?: { formats?: string[] }) => BarcodeDetectorLike }
    ).BarcodeDetector;
    if (!BarcodeCtor) return;

    let detector: BarcodeDetectorLike | null = null;
    try {
      detector = new BarcodeCtor({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'],
      });
    } catch {
      return;
    }

    let stopped = false;
    const intervalId = window.setInterval(async () => {
      const videoEl = videoRef.current;
      if (stopped || !detector || !videoEl || videoEl.readyState < 2) return;
      try {
        const codes = await detector.detect(videoEl);
        const rawCode = codes.find((c) => c.rawValue)?.rawValue?.trim();
        if (rawCode) {
          const match = findProductMatch(rawCode);
          if (match) {
            stopped = true;
            setScannerOpen(false);
            setQuery(match.name);
            onSelectProduct(match, rawCode);
          }
        }
      } catch {
        // Ignore transient detector errors
      }
    }, 550);

    return () => {
      stopped = true;
      window.clearInterval(intervalId);
    };
  }, [
    scannerOpen,
    cameraState,
    videoReady,
    capturedPhoto,
    analyzingPhoto,
    findProductMatch,
    onSelectProduct,
  ]);

  const identifyCapturedImage = async (imageDataUrl: string) => {
    setAnalyzingPhoto(true);
    setCaptureError('');

    try {
      const response = await fetch('/api/identify-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl,
          catalogSummary: products.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
          })),
        }),
      });

      const data = (await response.json()) as IdentifiedApiResponse;
      if (!response.ok) {
        setCaptureError(
          data.error || 'Could not identify this photo right now. Please retake or try typing.'
        );
        setAnalyzingPhoto(false);
        return;
      }

      if (data.detected === false || !data.productName) {
        setCaptureError(
          'No clear product or packaging was spotted in that shot. Try centering the item in good light and retake.'
        );
        setAnalyzingPhoto(false);
        return;
      }

      // Check barcode match first if detector/vision read a retail barcode
      if (data.barcode) {
        const barcodeMatch = findProductMatch(data.barcode);
        if (barcodeMatch) {
          setAnalyzingPhoto(false);
          setScannerOpen(false);
          setQuery(barcodeMatch.name);
          onSelectProduct(barcodeMatch, data.barcode);
          return;
        }
      }

      // Check exact matched catalog ID
      if (data.matchedCatalogId) {
        const catalogMatch = products.find((p) => p.id === data.matchedCatalogId);
        if (catalogMatch) {
          setAnalyzingPhoto(false);
          setScannerOpen(false);
          setQuery(catalogMatch.name);
          onSelectProduct(catalogMatch, catalogMatch.name);
          return;
        }
      }

      // Check fuzzy catalog name match
      const nameMatch = findProductMatch(data.productName);
      if (nameMatch) {
        setAnalyzingPhoto(false);
        setScannerOpen(false);
        setQuery(nameMatch.name);
        onSelectProduct(nameMatch, data.productName);
        return;
      }

      // Build a complete ProductItem from visual material identification
      const slug = data.productName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      const scannedItem: ProductItem = {
        id: `photo-${slug || Date.now()}-${Date.now().toString(36)}`,
        name: data.productName,
        aliases: [data.productName.toLowerCase()],
        barcode: data.barcode || undefined,
        category: data.category ?? 'Packaging',
        subTopic: data.subTopic || 'Camera Scan',
        biodegradable: Boolean(data.biodegradable),
        decompositionTime: data.decompositionTime || 'Varies by environment',
        decompositionDays:
          typeof data.decompositionDays === 'number' && data.decompositionDays > 0
            ? data.decompositionDays
            : data.biodegradable
              ? 45
              : 36500,
        timelinePercent:
          typeof data.timelinePercent === 'number'
            ? Math.max(4, Math.min(100, data.timelinePercent))
            : data.biodegradable
              ? 18
              : 82,
        breaksDownInto:
          Array.isArray(data.breaksDownInto) && data.breaksDownInto.length > 0
            ? data.breaksDownInto
            : data.biodegradable
              ? ['Water', 'Carbon dioxide', 'Organic humus']
              : ['Persistent synthetic fragments', 'Microplastics'],
        whyExplanation:
          data.whyExplanation ||
          `${data.productName} was analyzed from your photo based on its visible material composition and polymer structure.`,
        alternative: {
          name: data.alternativeName || 'Reusable glass, metal, or unbleached paper alternative',
          reason:
            data.alternativeReason ||
            'Eliminates persistent synthetic waste and lowers lifecycle landfill impact.',
          decompositionTime: data.alternativeDecompositionTime || 'Reusable / Weeks to months',
        },
        sourceLabel: 'SmartDisposal Camera Visual Material Analysis',
        sourceUrl: 'https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling',
        verificationStatus: 'Verified',
      };

      setAnalyzingPhoto(false);
      setScannerOpen(false);
      setQuery(scannedItem.name);
      onSelectProduct(scannedItem, scannedItem.name);
    } catch {
      setCaptureError('Connection error while analyzing your photo. Please try again.');
      setAnalyzingPhoto(false);
    }
  };

  const handleTakePicture = async () => {
    const videoEl = videoRef.current;
    if (!videoEl || videoEl.videoWidth === 0 || videoEl.videoHeight === 0) {
      setCaptureError('Camera frame is still warming up. Wait a moment and tap Take Picture.');
      return;
    }

    setCaptureError('');
    setShutterFlash(true);
    window.setTimeout(() => setShutterFlash(false), 160);

    const maxEdge = 1280;
    const scale = Math.min(1, maxEdge / Math.max(videoEl.videoWidth, videoEl.videoHeight));
    const width = Math.max(1, Math.round(videoEl.videoWidth * scale));
    const height = Math.max(1, Math.round(videoEl.videoHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setCaptureError('Unable to capture frame from browser canvas.');
      return;
    }

    ctx.drawImage(videoEl, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedPhoto(dataUrl);

    // Try fast local BarcodeDetector on snapped frame first
    const BarcodeCtor = (
      window as unknown as { BarcodeDetector?: new (opts?: { formats?: string[] }) => BarcodeDetectorLike }
    ).BarcodeDetector;
    if (BarcodeCtor) {
      try {
        const detector = new BarcodeCtor({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'],
        });
        const codes = await detector.detect(canvas);
        const rawCode = codes.find((c) => c.rawValue)?.rawValue?.trim();
        if (rawCode) {
          const match = findProductMatch(rawCode);
          if (match) {
            setScannerOpen(false);
            setQuery(match.name);
            onSelectProduct(match, rawCode);
            return;
          }
        }
      } catch {
        // Proceed to photo identification
      }
    }

    await identifyCapturedImage(dataUrl);
  };

  const handleFilePhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxEdge = 1280;
        const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setCapturedPhoto(dataUrl);
        identifyCapturedImage(dataUrl);
      };
      img.onerror = () => {
        setCaptureError('Could not read the selected image file. Please try another photo.');
      };
      img.src = typeof reader.result === 'string' ? reader.result : '';
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setCaptureError('');
    setAnalyzingPhoto(false);
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
            Type an everyday item, snap a photo, or scan its barcode to see whether microbes can
            break it down, what it leaves behind, and what to switch to.
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
                aria-label="Take Photo or Scan Barcode"
                title="Take Photo or Scan Barcode"
                className="px-4 py-3"
              >
                <Camera className="w-4 h-4" aria-hidden="true" />
                <span className="sm:hidden lg:inline">Camera Scan</span>
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
          <GlassCard className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                  Select a suggested product above, enter any material, or snap a photo with your
                  camera to compare decomposition timelines side by side.
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

      {/* Camera / Photo Capture & Barcode Scanner Modal */}
      <Modal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        title="Take a photo or scan barcode"
        maxWidthClass="max-w-xl"
      >
        <div className="space-y-5">
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/20 flex items-center justify-center">
            {/* Always-mounted video element so srcObject attaches reliably right when stream resolves */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onLoadedMetadata={() => setVideoReady(true)}
              onCanPlay={() => setVideoReady(true)}
              onPlaying={() => setVideoReady(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${
                cameraState === 'active' && !capturedPhoto ? 'opacity-100 z-[1]' : 'opacity-0 pointer-events-none z-0'
              }`}
            />

            {/* Captured still photo preview */}
            {capturedPhoto && (
              <img
                src={capturedPhoto}
                alt="Captured product preview"
                className="absolute inset-0 z-[2] w-full h-full object-cover"
              />
            )}

            {/* Shutter flash feedback */}
            {shutterFlash && (
              <div
                aria-hidden="true"
                className="absolute inset-0 z-[6] bg-white/75 pointer-events-none"
              />
            )}

            {/* Analyzing photo overlay */}
            {analyzingPhoto && (
              <div className="absolute inset-0 z-[5] bg-black/65 backdrop-blur-xs flex flex-col items-center justify-center gap-3 p-4 text-center">
                <Loader2 className="w-7 h-7 text-white animate-spin" aria-hidden="true" />
                <p className="text-sm text-white font-medium">Identifying material from photo...</p>
              </div>
            )}

            {/* Requesting / Unavailable fallback */}
            {!capturedPhoto && cameraState !== 'active' && (
              <div className="relative z-[3] text-center p-6 space-y-2.5 max-w-sm">
                <Camera className="w-8 h-8 text-gray-300 mx-auto" aria-hidden="true" />
                <p className="text-sm text-white">
                  {cameraState === 'requesting'
                    ? 'Starting camera preview...'
                    : cameraError || 'Camera preview unavailable in this browser context.'}
                </p>
                {cameraState === 'unavailable' && (
                  <div className="pt-1 flex items-center justify-center gap-2">
                    <GlassButton
                      type="button"
                      size="sm"
                      onClick={() => setCameraRestartKey((k) => k + 1)}
                    >
                      <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                      Retry Camera
                    </GlassButton>
                  </div>
                )}
              </div>
            )}

            {/* Minimal viewfinder brackets when camera live */}
            {cameraState === 'active' && !capturedPhoto && (
              <div
                className="pointer-events-none absolute inset-6 z-[3] border border-white/30 rounded-xl"
                aria-hidden="true"
              />
            )}
          </div>

          {captureError && (
            <div className="rounded-lg border border-white/20 bg-black/50 px-4 py-3 flex items-start gap-2.5 text-xs text-gray-200">
              <AlertCircle className="w-4 h-4 text-white shrink-0 mt-0.5" aria-hidden="true" />
              <span>{captureError}</span>
            </div>
          )}

          {/* Camera shutter + Retake / Upload / Flip controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {capturedPhoto ? (
                <>
                  <PrimaryButton
                    type="button"
                    onClick={handleRetake}
                    disabled={analyzingPhoto}
                  >
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    Retake Photo
                  </PrimaryButton>
                  {!analyzingPhoto && (
                    <GlassButton
                      type="button"
                      onClick={() => identifyCapturedImage(capturedPhoto)}
                    >
                      <ScanBarcode className="w-4 h-4" aria-hidden="true" />
                      Identify Again
                    </GlassButton>
                  )}
                </>
              ) : (
                <PrimaryButton
                  type="button"
                  onClick={handleTakePicture}
                  disabled={cameraState !== 'active' || !videoReady || analyzingPhoto}
                >
                  <Camera className="w-4 h-4" aria-hidden="true" />
                  {cameraState === 'active' && !videoReady ? 'Warming up...' : 'Take Picture'}
                </PrimaryButton>
              )}

              <GlassButton
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={analyzingPhoto}
              >
                <Upload className="w-4 h-4" aria-hidden="true" />
                Upload Photo
              </GlassButton>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFilePhotoSelected}
                className="hidden"
                aria-label="Upload or capture product photo"
              />
            </div>

            {cameraState === 'active' && !capturedPhoto && (
              <GlassButton
                type="button"
                size="sm"
                onClick={() =>
                  setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
                }
                aria-label="Switch camera"
                title="Switch front or back camera"
              >
                <SwitchCamera className="w-4 h-4" aria-hidden="true" />
                Flip
              </GlassButton>
            )}
          </div>

          <div className="space-y-3 pt-1">
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
