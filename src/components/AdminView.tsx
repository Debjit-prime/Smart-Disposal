import React, { useState } from 'react';
import { CheckCircle2, Clock, Edit3, ExternalLink, Plus, Check, X } from 'lucide-react';
import { Category, ProductItem, SubmissionItem, VerificationStatus } from '../types/disposal';
import { CATEGORIES, CATEGORY_SUBTOPICS } from '../data/products';
import {
  FilterChip,
  GlassButton,
  GlassCard,
  GlassInput,
  Modal,
  PrimaryButton,
  VerdictBadge,
} from './GlassUI';

interface AdminViewProps {
  products: ProductItem[];
  submissions: SubmissionItem[];
  onAddProduct: (item: ProductItem) => void;
  onUpdateProduct: (item: ProductItem) => void;
  onModerateSubmission: (id: string, action: 'Approved' | 'Dismissed') => void;
}

const EMPTY_FORM = {
  id: '',
  name: '',
  category: 'Packaging' as Category,
  subTopic: 'Boxes',
  biodegradable: true,
  decompositionTime: '',
  decompositionDays: 60,
  timelinePercent: 22,
  breaksDownInto: '',
  whyExplanation: '',
  alternativeName: '',
  alternativeReason: '',
  alternativeTime: '',
  sourceLabel: '',
  sourceUrl: 'https://www.epa.gov',
  verificationStatus: 'Verified' as VerificationStatus,
};

export const AdminView: React.FC<AdminViewProps> = ({
  products,
  submissions,
  onAddProduct,
  onUpdateProduct,
  onModerateSubmission,
}) => {
  const [tab, setTab] = useState<'registry' | 'queue'>('registry');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const pendingCount = submissions.filter((s) => s.status === 'Pending').length;

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (item: ProductItem) => {
    setEditingId(item.id);
    setForm({
      id: item.id,
      name: item.name,
      category: item.category,
      subTopic: item.subTopic || CATEGORY_SUBTOPICS[item.category]?.[0] || 'General',
      biodegradable: item.biodegradable,
      decompositionTime: item.decompositionTime,
      decompositionDays: item.decompositionDays,
      timelinePercent: item.timelinePercent,
      breaksDownInto: item.breaksDownInto.join(', '),
      whyExplanation: item.whyExplanation,
      alternativeName: item.alternative.name,
      alternativeReason: item.alternative.reason,
      alternativeTime: item.alternative.decompositionTime,
      sourceLabel: item.sourceLabel,
      sourceUrl: item.sourceUrl,
      verificationStatus: item.verificationStatus,
    });
    setModalOpen(true);
  };

  const handleToggleVerify = (item: ProductItem) => {
    onUpdateProduct({
      ...item,
      verificationStatus: item.verificationStatus === 'Verified' ? 'Needs Review' : 'Verified',
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const id =
      editingId ||
      form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
        '-' +
        Date.now().toString().slice(-4);

    const payload: ProductItem = {
      id,
      name: form.name.trim(),
      aliases: [form.name.trim().toLowerCase()],
      category: form.category,
      subTopic: form.subTopic.trim() || CATEGORY_SUBTOPICS[form.category]?.[0] || 'General',
      biodegradable: form.biodegradable,
      decompositionTime: form.decompositionTime.trim() || '3 – 6 months',
      decompositionDays: Number(form.decompositionDays) || 90,
      timelinePercent: Math.max(5, Math.min(100, Number(form.timelinePercent) || 30)),
      breaksDownInto: form.breaksDownInto
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      whyExplanation: form.whyExplanation.trim(),
      alternative: {
        name: form.alternativeName.trim(),
        reason: form.alternativeReason.trim(),
        decompositionTime: form.alternativeTime.trim() || 'Reusable',
      },
      sourceLabel: form.sourceLabel.trim() || 'Internal Biology Review',
      sourceUrl: form.sourceUrl.trim() || 'https://www.epa.gov',
      verificationStatus: form.verificationStatus,
    };

    if (editingId) {
      onUpdateProduct(payload);
    } else {
      onAddProduct(payload);
    }
    setModalOpen(false);
  };

  return (
    <section className="w-full px-6 md:px-12 lg:px-16 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-normal tracking-[-0.04em] text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.9)]">
              Registry &amp; Moderation
            </h1>
            <p className="text-base text-gray-100 [text-shadow:0_1px_12px_rgba(0,0,0,0.9)]">
              Add, edit, and verify material records, source citations, and community submissions.
            </p>
          </div>
          <PrimaryButton type="button" onClick={openAdd}>
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add Entry</span>
          </PrimaryButton>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <FilterChip
            label={`Database Entries (${products.length})`}
            active={tab === 'registry'}
            onClick={() => setTab('registry')}
          />
          <FilterChip
            label={`Moderation Queue (${pendingCount} pending)`}
            active={tab === 'queue'}
            onClick={() => setTab('queue')}
          />
        </div>

        {/* Registry Table */}
        {tab === 'registry' ? (
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/20 text-xs text-gray-300">
                    <th className="py-4 px-5 font-medium">Product</th>
                    <th className="py-4 px-4 font-medium">Category</th>
                    <th className="py-4 px-4 font-medium">Verdict</th>
                    <th className="py-4 px-4 font-medium">Duration</th>
                    <th className="py-4 px-4 font-medium">Source</th>
                    <th className="py-4 px-4 font-medium">Status</th>
                    <th className="py-4 px-5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-sm">
                  {products.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-4 px-5 text-white font-medium">{item.name}</td>
                      <td className="py-4 px-4 text-gray-300">{item.category}</td>
                      <td className="py-4 px-4">
                        <VerdictBadge biodegradable={item.biodegradable} compact />
                      </td>
                      <td className="py-4 px-4 text-gray-300 tabular-nums">
                        {item.decompositionTime}
                      </td>
                      <td className="py-4 px-4">
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-gray-300 hover:text-white underline underline-offset-4"
                        >
                          <span className="max-w-[160px] truncate">{item.sourceLabel}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
                        </a>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleVerify(item)}
                          className="inline-flex items-center gap-1.5 text-xs text-white hover:text-gray-300 cursor-pointer"
                          title="Click to toggle verification status"
                        >
                          {item.verificationStatus === 'Verified' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-gray-300" aria-hidden="true" />
                          )}
                          <span>{item.verificationStatus}</span>
                        </button>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <GlassButton type="button" size="sm" onClick={() => openEdit(item)}>
                          <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Edit</span>
                        </GlassButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        ) : (
          /* Moderation Queue */
          <div className="space-y-4">
            {submissions.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <p className="text-sm text-gray-300">No user submissions in the queue.</p>
              </GlassCard>
            ) : (
              submissions.map((sub) => (
                <GlassCard
                  key={sub.id}
                  className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300">
                      <span>{sub.type === 'new-item' ? 'New item suggestion' : 'Data correction'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{sub.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{sub.submittedAt}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-white">{sub.status}</span>
                    </div>
                    <h2 className="text-lg font-medium text-white">{sub.productName}</h2>
                    <p className="text-sm text-gray-300">{sub.notes || 'No extra notes provided.'}</p>
                  </div>

                  {sub.status === 'Pending' && (
                    <div className="flex items-center gap-2.5 shrink-0">
                      <GlassButton
                        type="button"
                        size="sm"
                        onClick={() => onModerateSubmission(sub.id, 'Dismissed')}
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Dismiss</span>
                      </GlassButton>
                      <PrimaryButton
                        type="button"
                        size="sm"
                        onClick={() => onModerateSubmission(sub.id, 'Approved')}
                      >
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Approve</span>
                      </PrimaryButton>
                    </div>
                  )}
                </GlassCard>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Entry Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit database entry' : 'Add database entry'}
        maxWidthClass="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="admin-name" className="text-xs text-gray-300">
                Product name
              </label>
              <GlassInput
                id="admin-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="admin-cat" className="text-xs text-gray-300">
                Category
              </label>
              <select
                id="admin-cat"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                className="w-full liquid-glass border border-white/20 rounded-xl px-4 py-3 text-sm text-white bg-black"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat} className="bg-black text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label htmlFor="admin-verdict" className="text-xs text-gray-300">
                Biodegradable
              </label>
              <select
                id="admin-verdict"
                value={form.biodegradable ? 'yes' : 'no'}
                onChange={(e) => setForm({ ...form, biodegradable: e.target.value === 'yes' })}
                className="w-full liquid-glass border border-white/20 rounded-xl px-4 py-3 text-sm text-white bg-black"
              >
                <option value="yes" className="bg-black text-white">
                  Biodegradable
                </option>
                <option value="no" className="bg-black text-white">
                  Not biodegradable
                </option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="admin-time" className="text-xs text-gray-300">
                Decomposition time label
              </label>
              <GlassInput
                id="admin-time"
                required
                placeholder="e.g. 2 – 4 months"
                value={form.decompositionTime}
                onChange={(e) => setForm({ ...form, decompositionTime: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="admin-status" className="text-xs text-gray-300">
                Verification
              </label>
              <select
                id="admin-status"
                value={form.verificationStatus}
                onChange={(e) =>
                  setForm({ ...form, verificationStatus: e.target.value as VerificationStatus })
                }
                className="w-full liquid-glass border border-white/20 rounded-xl px-4 py-3 text-sm text-white bg-black"
              >
                <option value="Verified" className="bg-black text-white">
                  Verified
                </option>
                <option value="Needs Review" className="bg-black text-white">
                  Needs Review
                </option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="admin-breaks" className="text-xs text-gray-300">
              Breaks down into (comma-separated)
            </label>
            <GlassInput
              id="admin-breaks"
              required
              placeholder="Water, Carbon dioxide, Humus"
              value={form.breaksDownInto}
              onChange={(e) => setForm({ ...form, breaksDownInto: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="admin-why" className="text-xs text-gray-300">
              Why explanation (plain language)
            </label>
            <textarea
              id="admin-why"
              rows={2}
              required
              value={form.whyExplanation}
              onChange={(e) => setForm({ ...form, whyExplanation: e.target.value })}
              className="w-full liquid-glass border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="admin-alt-name" className="text-xs text-gray-300">
                Greener alternative
              </label>
              <GlassInput
                id="admin-alt-name"
                required
                value={form.alternativeName}
                onChange={(e) => setForm({ ...form, alternativeName: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="admin-alt-reason" className="text-xs text-gray-300">
                Alternative one-line reason
              </label>
              <GlassInput
                id="admin-alt-reason"
                required
                value={form.alternativeReason}
                onChange={(e) => setForm({ ...form, alternativeReason: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="admin-src-label" className="text-xs text-gray-300">
                Source title
              </label>
              <GlassInput
                id="admin-src-label"
                required
                value={form.sourceLabel}
                onChange={(e) => setForm({ ...form, sourceLabel: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="admin-src-url" className="text-xs text-gray-300">
                Source URL
              </label>
              <GlassInput
                id="admin-src-url"
                type="url"
                required
                value={form.sourceUrl}
                onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <GlassButton type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </GlassButton>
            <PrimaryButton type="submit">
              {editingId ? 'Save changes' : 'Create entry'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </section>
  );
};
