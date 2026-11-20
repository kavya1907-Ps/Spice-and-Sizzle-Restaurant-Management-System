import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, Save } from 'lucide-react';
import { RestaurantSettings } from '../types';

interface SettingsViewProps {
  settings: RestaurantSettings;
  onSaveSettings: (updated: RestaurantSettings) => void;
  onResetSampleData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetSampleData,
}) => {
  const [form, setForm] = useState<RestaurantSettings>(settings);
  const [savedBanner, setSavedBanner] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1F1618]">
            Restaurant &amp; POS Settings
          </h1>
          <p className="text-sm text-[#6E5C60] mt-1">
            Configure GST rates, invoice header details, UPI ID, and dining table count
          </p>
        </div>

        <button
          type="button"
          onClick={onResetSampleData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E6DDD0] hover:border-[#5C1422] text-xs font-semibold text-[#5C1422] transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {savedBanner && (
        <div className="rounded-xl bg-[#DCFCE7] border border-[#86EFAC] px-4 py-3 text-xs font-semibold text-[#166534] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>POS settings updated across billing invoices and kitchen tickets.</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-[#E6DDD0] p-6 space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-[#5A494C] mb-1.5">
              Restaurant Brand Name
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] text-sm text-[#1F1618] focus:outline-none focus:border-[#5C1422]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A494C] mb-1.5">
              Hospitality Tagline
            </label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] text-sm text-[#1F1618] focus:outline-none focus:border-[#5C1422]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#5A494C] mb-1.5">
              Outlet Address (Shown on GST Bill)
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] text-sm text-[#1F1618] focus:outline-none focus:border-[#5C1422]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A494C] mb-1.5">
              Contact Phone
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] text-sm font-mono tabular-nums text-[#1F1618] focus:outline-none focus:border-[#5C1422]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A494C] mb-1.5">
              Merchant UPI ID
            </label>
            <input
              type="text"
              value={form.upiId}
              onChange={(e) => setForm({ ...form, upiId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] text-sm font-mono text-[#1F1618] focus:outline-none focus:border-[#5C1422]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A494C] mb-1.5">
              GSTIN Number
            </label>
            <input
              type="text"
              value={form.gstin}
              onChange={(e) => setForm({ ...form, gstin: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] text-sm font-mono text-[#1F1618] focus:outline-none focus:border-[#5C1422]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A494C] mb-1.5">
              FSSAI License Number
            </label>
            <input
              type="text"
              value={form.fssai}
              onChange={(e) => setForm({ ...form, fssai: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] text-sm font-mono text-[#1F1618] focus:outline-none focus:border-[#5C1422]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A494C] mb-1.5">
              CGST Rate (%)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="18"
              value={form.cgstRate}
              onChange={(e) => setForm({ ...form, cgstRate: Number(e.target.value) || 0 })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] text-sm font-mono tabular-nums text-[#1F1618] focus:outline-none focus:border-[#5C1422]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A494C] mb-1.5">
              SGST Rate (%)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="18"
              value={form.sgstRate}
              onChange={(e) => setForm({ ...form, sgstRate: Number(e.target.value) || 0 })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] text-sm font-mono tabular-nums text-[#1F1618] focus:outline-none focus:border-[#5C1422]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A494C] mb-1.5">
              Dine-in Tables Available
            </label>
            <input
              type="number"
              min="1"
              max="40"
              value={form.totalTables}
              onChange={(e) => setForm({ ...form, totalTables: Math.max(1, Number(e.target.value) || 1) })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] text-sm font-mono tabular-nums text-[#1F1618] focus:outline-none focus:border-[#5C1422]"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#D94E07] text-white text-sm font-semibold transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save POS Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
