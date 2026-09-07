import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, Download, Book, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import { toast } from 'sonner';
import { ManualEditor } from './components/ManualEditor';
import { COMPONENT_REGISTRY } from './components/ComponentRegistry';
import { ManualPreviewModal } from './components/ManualPreviewModal';
import 'react-quill-new/dist/quill.snow.css';

export interface UserManual {
  id: string;
  category: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

// ────────────────────────────────────────────────────────────────────────────
// parseContentSegments — splits HTML into regular HTML chunks and component embeds
// ────────────────────────────────────────────────────────────────────────────
type Segment =
  | { type: 'html'; html: string }
  | { type: 'component'; componentId: string };

function parseContentSegments(html: string): Segment[] {
  if (!html) return [];
  if (typeof document === 'undefined') return [{ type: 'html', html }];

  // Use a <template> element to parse HTML safely in the browser
  const tpl = document.createElement('template');
  tpl.innerHTML = html;

  const parts: Segment[] = [];
  let buffer = '';

  const flush = () => {
    if (buffer) { parts.push({ type: 'html', html: buffer }); buffer = ''; }
  };

  const walk = (parent: Element | DocumentFragment) => {
    Array.from(parent.childNodes).forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        const compId = el.getAttribute('data-component-id');
        if (compId) {
          flush();
          parts.push({ type: 'component', componentId: compId });
        } else if (el.querySelector('[data-component-id]')) {
          // Element contains nested embeds — open tag + recurse + close tag
          const tag = el.tagName.toLowerCase();
          const attrs = Array.from(el.attributes)
            .map(a => ` ${a.name}="${a.value}"`)
            .join('');
          buffer += `<${tag}${attrs}>`;
          walk(el);
          buffer += `</${tag}>`;
        } else {
          buffer += (el as HTMLElement).outerHTML;
        }
      } else if (node.nodeType === Node.TEXT_NODE) {
        buffer += node.textContent || '';
      }
    });
  };

  walk(tpl.content);
  flush();
  return parts;
}

// ────────────────────────────────────────────────────────────────────────────
// ResizableEmbed — shows an actual React component, full-size, draggable resize
// ────────────────────────────────────────────────────────────────────────────
const ResizableEmbed: React.FC<{ componentId: string }> = ({ componentId }) => {
  const comp = COMPONENT_REGISTRY.find(c => c.id === componentId);

  if (!comp) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: '#fee2e2', border: '1px dashed #fca5a5',
        borderRadius: 8, padding: '4px 10px',
        fontSize: 11, color: '#dc2626', fontFamily: 'sans-serif',
      }}>
        ⚠️ Unknown component: {componentId}
      </span>
    );
  }

  return (
    <div style={{
      display: 'inline-block',
      position: 'relative',
      resize: 'both',
      overflow: 'auto',
      minWidth: 120,
      minHeight: 48,
      maxWidth: '100%',
      border: '1.5px dashed rgba(124,58,237,0.35)',
      borderRadius: 14,
      padding: '24px 16px 14px 16px',
      background: 'rgba(124,58,237,0.03)',
      margin: '14px 4px',
      verticalAlign: 'top',
    }}>
      {/* Label badge at top */}
      <div style={{
        position: 'absolute', top: 0, left: 10,
        background: '#7c3aed', color: 'white',
        fontSize: 8, fontWeight: 900,
        padding: '2px 8px', borderRadius: '0 0 6px 6px',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        fontFamily: 'sans-serif', whiteSpace: 'nowrap', zIndex: 10,
      }}>
        Preview · {comp.label}
      </div>
      {/* Resize hint */}
      <div style={{
        position: 'absolute', bottom: 3, right: 6,
        fontSize: 7, color: 'rgba(124,58,237,0.4)',
        fontFamily: 'sans-serif', fontWeight: 700,
        userSelect: 'none', pointerEvents: 'none',
      }}>
        ↔ drag to resize
      </div>
      {/* Actual component — pointer-events none so it's view-only */}
      <div style={{ pointerEvents: 'none', userSelect: 'none' }}>
        {comp.preview}
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// preprocessHtml — rewrites manual:// links to safe data attributes
// so the browser never navigates away. Click handlers read data-manual-id.
// ────────────────────────────────────────────────────────────────────────────
function preprocessHtml(html: string): string {
  if (!html) return html;
  if (typeof document === 'undefined') return html;

  // Parse HTML using a template element so we can manipulate DOM nodes directly
  const tpl = document.createElement('template');
  tpl.innerHTML = html;

  // Find every anchor that has manual:// in its href
  tpl.content.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href') || '';
    if (href.startsWith('manual://')) {
      const manualId = href.replace('manual://', '');
      a.setAttribute('href', '#');
      a.setAttribute('data-manual-id', manualId);
      a.removeAttribute('target');       // Remove target="_blank"
      a.removeAttribute('rel');          // Remove rel="noopener noreferrer"
    }
  });

  return tpl.innerHTML;
}

// ────────────────────────────────────────────────────────────────────────────
// ComponentRichView — pure-React renderer (no createRoot timing issues)
// ────────────────────────────────────────────────────────────────────────────
const ComponentRichView: React.FC<{ content: string }> = ({ content }) => {
  const segments = React.useMemo(() => parseContentSegments(content), [content]);

  const newLocal = `
        .manual-rich-view .ql-editor [data-manual-id] {
          color: #7c3aed !important;
          text-decoration: underline;
          cursor: pointer !important;
          border-bottom: 1.5px dashed #7c3aed;
          font-weight: 700;
          display: inline-block;
        }
        .ql-editor [data-manual-id]::after {
          content: " 📖";
          font-size: 0.75em;
        }
        /* Quill list fixes for viewer — ensure counters work even without .ql-container parent */
        .manual-rich-view .ql-editor ol {
          counter-reset: list-0 list-1 list-2 list-3 list-4 list-5 list-6 list-7 list-8 list-9;
        }
        .manual-rich-view .ql-editor li {
          padding-left: 1.5em;
          position: relative;
          list-style: none;
        }
        .manual-rich-view .ql-editor li[data-list="ordered"] {
          counter-increment: list-0;
        }
        .manual-rich-view .ql-editor li[data-list="ordered"]::before {
          content: counter(list-0, decimal) '. ';
          position: absolute;
          left: 0;
          white-space: nowrap;
        }
        .manual-rich-view .ql-editor li[data-list="bullet"]::before {
          content: '•';
          position: absolute;
          left: 0.4em;
        }
      `;
  return (
    <>
      <style>{newLocal}</style>
      <div className="manual-rich-view">
        <div className="ql-editor !p-0" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
          {segments.map((seg, i) =>
            seg.type === 'html'
              ? <div key={i} dangerouslySetInnerHTML={{ __html: preprocessHtml(seg.html) }} />
              : <ResizableEmbed key={i} componentId={seg.componentId} />
          )}
        </div>
      </div>
    </>
  );
};

export const ManualManagement = () => {
  const { t } = useTranslation();
  const [manuals, setManuals] = useState<UserManual[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingManual, setEditingManual] = useState<UserManual | null>(null);

  const [viewingManual, setViewingManual] = useState<UserManual | null>(null);
  const [previewManualId, setPreviewManualId] = useState<string | null>(null);
  const [exportingManualId, setExportingManualId] = useState<string | null>(null);

  const waitForImagesToLoad = async (root: HTMLElement) => {
    const images = Array.from(root.querySelectorAll('img')) as HTMLImageElement[];
    await Promise.all(images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    }));
  };

  const exportManualToPdf = async (manual: UserManual, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setExportingManualId(manual.id);

    try {
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '840px';
      container.style.padding = '32px';
      container.style.background = '#ffffff';
      container.style.color = '#111827';
      container.style.fontFamily = "'Noto Sans Lao', sans-serif";
      container.style.boxSizing = 'border-box';
      container.style.zIndex = '9999';

      const root = createRoot(container);
      root.render(
        <div style={{ width: '800px', maxWidth: '800px', background: '#ffffff', color: '#111827', padding: 0, boxSizing: 'border-box' }}>
          <style>{`
            body{margin:0;font-family:'Noto Sans Lao',sans-serif;color:#111827;background:#ffffff;}
            .manual-export h1{font-size:36px;margin:0 0 20px 0;line-height:1.05;color:#0f172a;font-weight:800;}
            .manual-export h2{font-size:18px;margin:24px 0 10px 0;color:#0f172a;}
            .manual-export p{margin:0 0 18px 0;line-height:1.8;color:#111827;font-size:14px;}
            .manual-export img{max-width:100%;height:auto;border-radius:20px;margin:20px 0;}
            .manual-export ul, .manual-export ol{margin:0 0 18px 1.5rem;padding-left:0;}
            .manual-export li{margin-bottom:10px;line-height:1.8;color:#111827;}
            .manual-export blockquote{margin:18px 0;padding:18px 22px;background:#f8fafc;border-left:4px solid #7c3aed;color:#111827;}
            .manual-export .manual-category{display:inline-flex;padding:10px 14px;background:#ede9fe;color:#5b21b6;font-size:12px;font-weight:700;border-radius:999px;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:20px;}
            .manual-export .manual-meta{font-size:12px;color:#475569;margin-bottom:24px;}
            .manual-export h1, .manual-export h2, .manual-export h3, .manual-export h4, .manual-export h5, .manual-export h6 { color: #0f172a; }
            .manual-export strong, .manual-export b { color: #0f172a; }
          `}</style>
          <div className="manual-export" style={{ width: '100%', maxWidth: '800px' }}>
            <div className="manual-category">{manual.category}</div>
            <h1>{manual.title}</h1>
            <div className="manual-meta">{new Date(manual.created_at).toLocaleDateString()}</div>
            {manual.image_url && (
              <img src={manual.image_url} alt={manual.title} />
            )}
            <div style={{ fontSize: 14, lineHeight: 1.8, color: '#374151' }}>
              <ComponentRichView content={manual.content} />
            </div>
          </div>
        </div>
      );

      document.body.appendChild(container);
      await new Promise(requestAnimationFrame);
      await waitForImagesToLoad(container);

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;

      let heightLeft = pdfHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pageWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      const safeTitle = manual.title.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '').trim().slice(0, 80) || 'manual';
      pdf.save(`${safeTitle}.pdf`);
      root.unmount();
      document.body.removeChild(container);
      toast.success('Manual exported to PDF');
    } catch (error) {
      console.error('Error exporting manual PDF:', error);
      toast.error('Failed to export PDF');
    } finally {
      setExportingManualId(null);
    }
  };

  useEffect(() => {
    fetchManuals();
  }, []);

  const fetchManuals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_manuals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setManuals(data || []);
    } catch (error) {
      console.error('Error fetching manuals:', error);
      toast.error('Failed to load manuals');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this manual?')) return;

    try {
      const { error } = await supabase
        .from('user_manuals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Manual deleted successfully');
      setManuals(prev => prev.filter(m => m.id !== id));
      if (viewingManual?.id === id) setViewingManual(null);
    } catch (error) {
      console.error('Error deleting manual:', error);
      toast.error('Failed to delete manual');
    }
  };

  const categories = ['All', ...Array.from(new Set(manuals.map(m => m.category)))];

  const filteredManuals = manuals.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (viewingManual) {
    return (
      <div className="p-0 sm:p-6 max-w-5xl mx-auto space-y-6" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
        <div className="px-4 sm:px-0 pt-4 sm:pt-0">
          <button
            onClick={() => setViewingManual(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-primary-500 transition-colors px-1"
          >
            <ArrowLeft size={20} />
            <span>Back to Manuals</span>
          </button>
        </div>

        <div className="bg-transparent sm:bg-white dark:sm:bg-slate-900 rounded-none sm:rounded-3xl p-4 sm:p-8 shadow-none sm:shadow-sm border-0 sm:border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="inline-block px-3 py-1 bg-primary-500/10 text-primary-500 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                {viewingManual.category}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                {viewingManual.title}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => exportManualToPdf(viewingManual, e)}
                disabled={exportingManualId === viewingManual.id}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${exportingManualId === viewingManual.id ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10'}`}
                title="Download PDF"
              >
                {exportingManualId === viewingManual.id ? (
                  <span className="inline-flex h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <Download size={16} />
                )}
              </button>
              <button
                onClick={() => {
                  setEditingManual(viewingManual);
                  setIsEditorOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs sm:text-sm font-bold shrink-0"
              >
                <Edit2 size={16} />
                Edit
              </button>
            </div>
          </div>

          {viewingManual.image_url && (
            <div className="relative w-full h-[400px] mb-8 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10" />
              <img
                src={viewingManual.image_url}
                alt={viewingManual.title}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          )}

          <div
            onClick={(e) => {
              const target = e.target as HTMLElement;
              const link = target.closest('[data-manual-id]') as HTMLElement | null;
              if (link) {
                e.preventDefault();
                e.stopPropagation();
                const mId = link.getAttribute('data-manual-id');
                if (mId) setPreviewManualId(mId);
              }
            }}
          >
            <ComponentRichView content={viewingManual.content} />
          </div>
        </div>

        {isEditorOpen && (
          <ManualEditor
            manual={editingManual}
            isOpen={isEditorOpen}
            onClose={() => {
              setIsEditorOpen(false);
              setEditingManual(null);
            }}
            onSaved={() => {
              setIsEditorOpen(false);
              setEditingManual(null);
              fetchManuals();
              // Update viewing manual if we just edited it
              if (editingManual) {
                // A bit hacky: we refetch all, then we update viewing if it still exists
                // We'll just close viewing for simplicity or let the fetch update it.
                setViewingManual(null);
              }
            }}
          />
        )}

        {/* Manual Preview Modal for Cross-linking inside the detail view */}
        <ManualPreviewModal
          manualId={previewManualId || ''}
          isOpen={!!previewManualId}
          onClose={() => setPreviewManualId(null)}
          renderContent={(content) => (
            <div
              onClick={(e) => {
                const target = e.target as HTMLElement;
                const link = target.closest('[data-manual-id]') as HTMLElement | null;
                if (link) {
                  e.preventDefault();
                  e.stopPropagation();
                  const mId = link.getAttribute('data-manual-id');
                  if (mId) setPreviewManualId(mId);
                }
              }}
            >
              <ComponentRichView content={content} />
            </div>
          )}
        />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-6" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-primary-500/10 text-primary-500 rounded-xl">
              <Book size={24} />
            </div>
            User Manuals
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage help documentation and guides</p>
        </div>
        <button
          onClick={() => setIsEditorOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20"
        >
          <Plus size={20} />
          Add Manual
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search manuals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-100 dark:bg-slate-800 h-64 rounded-3xl" />
          ))}
        </div>
      ) : filteredManuals.length === 0 ? (
        <div className="text-center py-20">
          <Book className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No manuals found</h3>
          <p className="text-slate-500">Create the first manual to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredManuals.map(manual => (
              <motion.div
                key={manual.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -4 }}
                onClick={() => setViewingManual(manual)}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden cursor-pointer group flex flex-col"
              >
                {manual.image_url ? (
                  <div className="h-48 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={manual.image_url}
                      alt={manual.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-primary-500 text-[10px] font-black uppercase tracking-wider rounded-lg">
                        {manual.category}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center relative">
                    <ImageIcon size={48} className="text-slate-300 dark:text-slate-600 mb-2" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white dark:bg-slate-900 text-primary-500 shadow-sm text-[10px] font-black uppercase tracking-wider rounded-lg">
                        {manual.category}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                    {manual.title}
                  </h3>
                  <div
                    className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 flex-1 prose-sm prose-slate"
                    dangerouslySetInnerHTML={{ __html: manual.content }}
                  />

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(manual.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingManual(manual);
                          setIsEditorOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => exportManualToPdf(manual, e)}
                        className={`p-2 rounded-full transition-all ${exportingManualId === manual.id ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10'}`}
                        title="Download PDF"
                        disabled={exportingManualId === manual.id}
                        aria-busy={exportingManualId === manual.id}
                      >
                        {exportingManualId === manual.id ? (
                          <span className="inline-flex h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        ) : (
                          <Download size={16} />
                        )}
                      </button>
                      <button
                        onClick={(e) => handleDelete(manual.id, e)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {isEditorOpen && (
        <ManualEditor
          manual={editingManual}
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingManual(null);
          }}
          onSaved={() => {
            setIsEditorOpen(false);
            setEditingManual(null);
            fetchManuals();
          }}
        />
      )}

      {/* Manual Preview Modal for Cross-linking */}
      <ManualPreviewModal
        manualId={previewManualId || ''}
        isOpen={!!previewManualId}
        onClose={() => setPreviewManualId(null)}
        renderContent={(content) => (
          <div
            onClick={(e) => {
              const target = e.target as HTMLElement;
              const link = target.closest('[data-manual-id]') as HTMLElement | null;
              if (link) {
                e.preventDefault();
                e.stopPropagation();
                const mId = link.getAttribute('data-manual-id');
                if (mId) setPreviewManualId(mId);
              }
            }}
          >
            <ComponentRichView content={content} />
          </div>
        )}
      />
    </div>
  );
};
