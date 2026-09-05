import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Loader2, Image as ImageIcon, Puzzle, Book } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import Quill from 'quill';
import BlotFormatter from '@enzedonline/quill-blot-formatter2';
import 'react-quill-new/dist/quill.snow.css';
import { supabase } from '../../../../../lib/supabase';
import { toast } from 'sonner';
import type { UserManual } from '../ManualManagement';
import { ComponentPicker } from './ComponentPicker';
import type { ComponentItem } from './ComponentRegistry';
import './ComponentBlot'; // Register custom blot
import { ManualPicker } from './ManualPicker';

try {
  Quill.register('modules/blotFormatter', BlotFormatter);
} catch (e) {}

interface ManualEditorProps {
  manual: UserManual | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const ManualEditor: React.FC<ManualEditorProps> = ({ manual, isOpen, onClose, onSaved }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isManualPickerOpen, setIsManualPickerOpen] = useState(false);
  const quillRef = useRef<any>(null);

  useEffect(() => {
    if (manual) {
      setTitle(manual.title);
      setCategory(manual.category);
      setContent(manual.content);
      setImageUrl(manual.image_url || '');
    } else {
      setTitle('');
      setCategory('');
      setContent('');
      setImageUrl('');
    }
  }, [manual]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `manuals/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('manuals')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('manuals')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInsertComponent = (component: ComponentItem) => {
    // Build the HTML placeholder that will be stored in DB
    const embedHtml = `<div class="manual-component-embed" data-component-id="${component.id}" contenteditable="false" style="display:inline-block;margin:8px 0;vertical-align:top;"><span style="display:inline-flex;align-items:center;gap:6px;background:#f1f5f9;border:1.5px dashed #7c3aed;border-radius:10px;padding:6px 12px;font-size:11px;color:#7c3aed;font-weight:900;font-family:sans-serif;"><span>📦</span> ${component.label}</span></div>`;

    // Insert into Quill at current cursor
    try {
      const editor = quillRef.current?.getEditor();
      if (editor) {
        const range = editor.getSelection(true);
        const index = range ? range.index : editor.getLength();
        editor.clipboard.dangerouslyPasteHTML(index, embedHtml);
      } else {
        // Fallback: append to content
        setContent(prev => prev + embedHtml);
      }
    } catch (e) {
      setContent(prev => prev + embedHtml);
    }

    toast.success(`Inserted: ${component.label}`);
  };

  const handleLinkManual = (linkedManual: UserManual) => {
    try {
      const editor = quillRef.current?.getEditor();
      if (editor) {
        const range = editor.getSelection(true);
        if (range && range.length > 0) {
          // Format selected text as manual-link-ref
          editor.format('manual-link-ref', linkedManual.id);
        } else {
          // Insert new text formatted with manual-link-ref
          const index = range ? range.index : editor.getLength();
          const insertText = `${linkedManual.title} 📖`;
          editor.insertText(index, insertText, 'manual-link-ref', linkedManual.id);
          editor.setSelection(index + insertText.length);
        }
      }
    } catch (e) {
      console.error('Error inserting manual link:', e);
    }
    toast.success('Linked to: ' + linkedManual.title);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category.trim() || !content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: title.trim(),
        category: category.trim(),
        content: content,
        image_url: imageUrl || null
      };

      if (manual) {
        const { error } = await supabase
          .from('user_manuals')
          .update(payload)
          .eq('id', manual.id);
        if (error) throw error;
        toast.success('Manual updated successfully');
      } else {
        const { error } = await supabase
          .from('user_manuals')
          .insert([payload]);
        if (error) throw error;
        toast.success('Manual created successfully');
      }

      onSaved();
    } catch (error) {
      console.error('Error saving manual:', error);
      toast.error('Failed to save manual');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
    blotFormatter: {}
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {manual ? 'Edit Manual' : 'Create New Manual'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 no-scrollbar">
            <form id="manual-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. General, Seller, Buyer..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Manual Title"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Cover Image
                </label>
                <div className="flex items-start gap-6">
                  <div
                    className={`w-32 h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden group transition-colors ${imageUrl ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                    />
                    {isUploading ? (
                      <Loader2 size={24} className="text-primary-500 animate-spin" />
                    ) : imageUrl ? (
                      <>
                        <img src={imageUrl} alt="Cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                          <Upload size={20} className="mb-1" />
                          <span className="text-xs font-bold">Change</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <ImageIcon size={24} className="text-slate-400 mb-2 group-hover:text-primary-500 transition-colors" />
                        <span className="text-xs font-medium text-slate-500 group-hover:text-primary-500 transition-colors text-center px-2">
                          Upload Cover
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                      Recommended size: 1200 x 630 pixels. Max file size: 5MB.
                    </p>
                    {imageUrl && (
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="text-sm text-red-500 hover:text-red-600 font-bold transition-colors"
                      >
                        Remove image
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    {/* Link Manual Button */}
                    <button
                      type="button"
                      onClick={() => setIsManualPickerOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black rounded-xl transition-colors border border-blue-500/20"
                    >
                      <Book size={13} />
                      Link Manual
                    </button>
                    {/* Insert Component Button */}
                    <button
                      type="button"
                      onClick={() => setIsPickerOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/10 hover:bg-primary-500/20 text-primary-600 dark:text-primary-400 text-xs font-black rounded-xl transition-colors border border-primary-500/20"
                    >
                      <Puzzle size={13} />
                      Insert Component
                    </button>
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 quill-wrapper">
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={modules}
                    className="h-[300px] mb-12"
                    placeholder="Write the manual content here..."
                  />
                  <style>{`
                    .dark .quill-wrapper .ql-toolbar {
                      background-color: #1e293b;
                      border-color: #334155;
                    }
                    .dark .quill-wrapper .ql-container {
                      border-color: #334155;
                      color: white;
                    }
                    .dark .quill-wrapper .ql-editor.ql-blank::before {
                      color: #94a3b8;
                    }
                    .dark .quill-wrapper .ql-snow .ql-stroke {
                      stroke: #cbd5e1;
                    }
                    .dark .quill-wrapper .ql-snow .ql-fill {
                      fill: #cbd5e1;
                    }
                    .dark .quill-wrapper .ql-snow .ql-picker {
                      color: #cbd5e1;
                    }
                    .dark .quill-wrapper .ql-snow .ql-picker-options {
                      background-color: #1e293b;
                      border-color: #334155;
                    }
                    /* Fix for Quill list items — Tailwind's preflight resets counters */
                    .quill-wrapper .ql-editor ol {
                      counter-reset: list-1 list-2 list-3 list-4 list-5 list-6 list-7 list-8 list-9;
                    }
                    .quill-wrapper .ql-editor li[data-list="ordered"] {
                      counter-increment: list-0;
                    }
                    .quill-wrapper .ql-editor li[data-list="ordered"]::before {
                      content: counter(list-0, decimal) '. ';
                    }
                    .quill-wrapper .ql-editor li[data-list="bullet"]::before {
                      content: '•';
                      margin-right: 6px;
                    }
                    .quill-wrapper .ql-editor li {
                      list-style-type: none;
                      padding-left: 1.5em;
                      position: relative;
                    }
                    /* Component embed placeholder in editor */
                    .ql-editor .manual-component-embed {
                      cursor: default;
                      user-select: none;
                    }
                    /* Manual link ref styling in editor */
                    .ql-editor .manual-link-ref {
                      color: #7c3aed;
                      font-weight: 800;
                      cursor: pointer;
                      text-decoration: underline;
                      border-bottom: 1.5px dashed #7c3aed;
                    }
                  `}</style>
                </div>
              </div>
            </form>
          </div>

          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="manual-form"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary-500/20 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Manual'
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Component Picker Panel */}
      <ComponentPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onInsert={handleInsertComponent}
      />

      {/* Manual Picker Panel */}
      <ManualPicker
        isOpen={isManualPickerOpen}
        onClose={() => setIsManualPickerOpen(false)}
        onSelect={handleLinkManual}
      />
    </>
  );
};
