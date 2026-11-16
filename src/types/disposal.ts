export type Category =
  | 'Plastics'
  | 'Paper'
  | 'Food Waste'
  | 'Textiles'
  | 'Metals'
  | 'Glass'
  | 'Packaging'
  | 'Electronics';

export type VerificationStatus = 'Verified' | 'Needs Review';

export type AppPage =
  | 'landing'
  | 'checker'
  | 'result'
  | 'database'
  | 'category-detail'
  | 'alternatives'
  | 'how-it-works'
  | 'dashboard'
  | 'admin'
  | 'design-system';

export interface ProductItem {
  id: string;
  name: string;
  aliases: string[];
  barcode?: string;
  category: Category;
  subTopic: string;
  biodegradable: boolean;
  decompositionTime: string;
  /** Numeric approximate days for sorting & timeline visualization */
  decompositionDays: number;
  /** Normalized 0..100 position on logarithmic timeline bar (days -> centuries) */
  timelinePercent: number;
  breaksDownInto: string[];
  whyExplanation: string;
  alternative: {
    name: string;
    reason: string;
    decompositionTime: string;
  };
  sourceLabel: string;
  sourceUrl: string;
  verificationStatus: VerificationStatus;
}

export interface SubmissionItem {
  id: string;
  type: 'new-item' | 'correction';
  productName: string;
  category: Category;
  notes: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Dismissed';
}

export interface ToastMessage {
  id: string;
  message: string;
  tone?: 'neutral' | 'success' | 'error';
}
