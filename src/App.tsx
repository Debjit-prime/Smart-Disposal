import React, { useEffect, useRef, useState } from 'react';
import { INITIAL_PRODUCTS, INITIAL_SUBMISSIONS } from './data/products';
import { AppPage, Category, ProductItem, SubmissionItem, ToastMessage } from './types/disposal';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroLanding } from './components/HeroLanding';
import { ProductChecker } from './components/ProductChecker';
import { ResultScreen } from './components/ResultScreen';
import { DatabaseBrowser } from './components/DatabaseBrowser';
import { CategorySubtopicView } from './components/CategorySubtopicView';
import { AlternativesView } from './components/AlternativesView';
import { HowItWorks } from './components/HowItWorks';
import { DashboardView } from './components/DashboardView';
import { AdminView } from './components/AdminView';
import { DesignSystemView } from './components/DesignSystemView';
import { BlurredBackgroundLayer, ToastContainer } from './components/GlassUI';

const STORAGE_KEYS = {
  products: 'smartdisposal_products_v2',
  submissions: 'smartdisposal_submissions_v1',
  saved: 'smartdisposal_saved_v1',
  switched: 'smartdisposal_switched_v1',
  history: 'smartdisposal_history_v1',
  recentQueries: 'smartdisposal_recent_queries_v1',
};

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('landing');
  const [products, setProducts] = useState<ProductItem[]>(() =>
    loadJson(STORAGE_KEYS.products, INITIAL_PRODUCTS)
  );
  const [submissions, setSubmissions] = useState<SubmissionItem[]>(() =>
    loadJson(STORAGE_KEYS.submissions, INITIAL_SUBMISSIONS)
  );
  const [savedIds, setSavedIds] = useState<string[]>(() =>
    loadJson(STORAGE_KEYS.saved, ['banana-peel', 'plastic-bag'])
  );
  const [switchedIds, setSwitchedIds] = useState<string[]>(() =>
    loadJson(STORAGE_KEYS.switched, ['plastic-bag'])
  );
  const [historyIds, setHistoryIds] = useState<string[]>(() =>
    loadJson(STORAGE_KEYS.history, ['plastic-bag', 'paper-plate', 'banana-peel'])
  );
  const [recentQueries, setRecentQueries] = useState<string[]>(() =>
    loadJson(STORAGE_KEYS.recentQueries, ['Plastic bag', 'Coffee cup', 'Cardboard box'])
  );
  const [selectedProductId, setSelectedProductId] = useState<string>('plastic-bag');
  const [activeCategory, setActiveCategory] = useState<Category>('Plastics');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const navTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (navTimerRef.current !== null) {
        window.clearTimeout(navTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
    } catch {
      // Ignore storage quota errors
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.submissions, JSON.stringify(submissions));
    } catch {
      // Ignore
    }
  }, [submissions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(savedIds));
    } catch {
      // Ignore
    }
  }, [savedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.switched, JSON.stringify(switchedIds));
    } catch {
      // Ignore
    }
  }, [switchedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(historyIds));
    } catch {
      // Ignore
    }
  }, [historyIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.recentQueries, JSON.stringify(recentQueries));
    } catch {
      // Ignore
    }
  }, [recentQueries]);

  const pushToast = (message: string, tone: ToastMessage['tone'] = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const runPageTransition = (applyChange: () => void) => {
    if (navTimerRef.current !== null) {
      window.clearTimeout(navTimerRef.current);
      navTimerRef.current = null;
    }

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      applyChange();
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    setIsPageVisible(false);
    navTimerRef.current = window.setTimeout(() => {
      navTimerRef.current = null;
      applyChange();
      window.scrollTo({ top: 0, behavior: 'auto' });
      requestAnimationFrame(() => {
        setIsPageVisible(true);
      });
    }, 220);
  };

  const handleNavigate = (page: AppPage) => {
    if (page === currentPage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    runPageTransition(() => {
      setCurrentPage(page);
    });
  };

  const handleSelectProduct = (product: ProductItem, searchLabel?: string) => {
    setHistoryIds((prev) => [product.id, ...prev.filter((id) => id !== product.id)].slice(0, 12));
    if (searchLabel) {
      const clean = searchLabel.trim();
      setRecentQueries((prev) =>
        [clean, ...prev.filter((q) => q.toLowerCase() !== clean.toLowerCase())].slice(0, 5)
      );
    }
    if (currentPage === 'result' && selectedProductId === product.id) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    runPageTransition(() => {
      setSelectedProductId(product.id);
      setCurrentPage('result');
    });
  };

  const handleOpenCategorySubtopics = (category: Category) => {
    runPageTransition(() => {
      setActiveCategory(category);
      setCurrentPage('category-detail');
    });
  };

  const handleToggleSave = (product: ProductItem) => {
    setSavedIds((prev) => {
      const exists = prev.includes(product.id);
      if (exists) {
        pushToast(`Removed ${product.name} from saved items`, 'neutral');
        return prev.filter((id) => id !== product.id);
      }
      pushToast(`Saved ${product.name}`, 'success');
      return [product.id, ...prev];
    });
  };

  const handleSwitchAlternative = (product: ProductItem) => {
    setSwitchedIds((prev) => {
      if (prev.includes(product.id)) {
        pushToast(`Removed switch for ${product.name}`, 'neutral');
        return prev.filter((id) => id !== product.id);
      }
      pushToast(`Switched to ${product.alternative.name}`, 'success');
      return [product.id, ...prev];
    });
  };

  const handleShare = async (product: ProductItem) => {
    const summary = `${product.name}: ${
      product.biodegradable ? 'Biodegradable' : 'Not biodegradable'
    } (${product.decompositionTime}). Greener alternative: ${product.alternative.name}.`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(summary);
        pushToast('Summary copied to clipboard', 'success');
        return;
      }
    } catch {
      // Fallback below
    }
    pushToast(summary, 'neutral');
  };

  const handleSubmitSuggestion = (name: string, category: Category, notes: string) => {
    const newSub: SubmissionItem = {
      id: `sub-${Date.now()}`,
      type: 'new-item',
      productName: name,
      category,
      notes,
      submittedAt: new Date().toISOString().slice(0, 10),
      status: 'Pending',
    };
    setSubmissions((prev) => [newSub, ...prev]);
    pushToast(`Submitted "${name}" for biology review`, 'success');
  };

  const handleReportData = (product: ProductItem, notes: string) => {
    const report: SubmissionItem = {
      id: `rep-${Date.now()}`,
      type: 'correction',
      productName: product.name,
      category: product.category,
      notes,
      submittedAt: new Date().toISOString().slice(0, 10),
      status: 'Pending',
    };
    setSubmissions((prev) => [report, ...prev]);
    pushToast('Correction report queued for review', 'success');
  };

  const handleAddProduct = (item: ProductItem) => {
    setProducts((prev) => [item, ...prev]);
    pushToast(`Added "${item.name}" to registry`, 'success');
  };

  const handleUpdateProduct = (item: ProductItem) => {
    setProducts((prev) => prev.map((p) => (p.id === item.id ? item : p)));
    pushToast(`Updated "${item.name}"`, 'success');
  };

  const handleModerateSubmission = (id: string, action: 'Approved' | 'Dismissed') => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: action } : s))
    );
    pushToast(`Submission marked as ${action.toLowerCase()}`, 'success');
  };

  const activeProduct =
    products.find((p) => p.id === selectedProductId) ?? products[0];

  const PAGE_BACKGROUND_IMAGES: Partial<Record<AppPage, string>> = {
    checker: '/src/assets/images/bg_checker_canopy_1794849012705.jpg',
    result: '/src/assets/images/bg_result_humus_1794849015002.jpg',
    database: '/src/assets/images/bg_database_specimen_1794849012701.jpg',
    'category-detail': '/src/assets/images/bg_database_specimen_1794849012701.jpg',
    alternatives: '/assets/aistudio/image_2_338a9168.png',
    'how-it-works': '/src/assets/images/bg_biology_roots_1794849017726.jpg',
    dashboard: '/src/assets/images/bg_dashboard_sanctuary_1794849015481.jpg',
    admin: '/src/assets/images/bg_database_specimen_1794849012701.jpg',
    'design-system': '/src/assets/images/bg_checker_canopy_1794849012705.jpg',
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      <div
        className={`flex-1 flex flex-col transition-opacity ease-out ${
          isPageVisible
            ? 'opacity-100 duration-300'
            : 'opacity-0 duration-200 pointer-events-none'
        }`}
      >
      {currentPage === 'landing' ? (
        <main className="flex-1 flex flex-col">
          <HeroLanding
            products={products}
            onNavigate={handleNavigate}
            onSelectProduct={(p) => handleSelectProduct(p)}
          />
        </main>
      ) : (
        <BlurredBackgroundLayer
          imageUrl={PAGE_BACKGROUND_IMAGES[currentPage]}
          className="flex-1 flex flex-col"
        >
          <main className="flex-1 pt-24">
            {currentPage === 'checker' && (
              <ProductChecker
                products={products}
                recentSearches={recentQueries}
                onSelectProduct={handleSelectProduct}
                onSubmitSuggestion={handleSubmitSuggestion}
              />
            )}
            {currentPage === 'result' && activeProduct && (
              <ResultScreen
                product={activeProduct}
                allProducts={products}
                isSaved={savedIds.includes(activeProduct.id)}
                isSwitched={switchedIds.includes(activeProduct.id)}
                onToggleSave={handleToggleSave}
                onSwitchAlternative={handleSwitchAlternative}
                onSelectProduct={(p) => handleSelectProduct(p)}
                onShare={handleShare}
                onReportData={handleReportData}
                onCheckAnother={() => handleNavigate('checker')}
              />
            )}
            {currentPage === 'database' && (
              <DatabaseBrowser
                products={products}
                onSelectProduct={(p) => handleSelectProduct(p)}
                onOpenCategorySubtopics={handleOpenCategorySubtopics}
              />
            )}
            {currentPage === 'category-detail' && (
              <CategorySubtopicView
                category={activeCategory}
                products={products}
                onChangeCategory={(cat) => setActiveCategory(cat)}
                onSelectProduct={(p) => handleSelectProduct(p)}
                onBackToDatabase={() => handleNavigate('database')}
              />
            )}
            {currentPage === 'alternatives' && (
              <AlternativesView
                products={products}
                switchedIds={switchedIds}
                onSwitchAlternative={handleSwitchAlternative}
                onSelectProduct={(p) => handleSelectProduct(p)}
              />
            )}
            {currentPage === 'how-it-works' && (
              <HowItWorks onNavigate={handleNavigate} />
            )}
            {currentPage === 'dashboard' && (
              <DashboardView
                products={products}
                savedIds={savedIds}
                switchedIds={switchedIds}
                historyIds={historyIds}
                onSelectProduct={(p) => handleSelectProduct(p)}
                onRemoveSaved={(id) => {
                  setSavedIds((prev) => prev.filter((item) => item !== id));
                  pushToast('Removed from saved items', 'neutral');
                }}
                onClearHistory={() => {
                  setHistoryIds([]);
                  pushToast('History cleared', 'neutral');
                }}
                onGoToChecker={() => handleNavigate('checker')}
              />
            )}
            {currentPage === 'admin' && (
              <AdminView
                products={products}
                submissions={submissions}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onModerateSubmission={handleModerateSubmission}
              />
            )}
            {currentPage === 'design-system' && (
              <DesignSystemView onTriggerToast={(msg) => pushToast(msg, 'neutral')} />
            )}
          </main>
        </BlurredBackgroundLayer>
      )}

      <Footer onNavigate={handleNavigate} />
      </div>

      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
