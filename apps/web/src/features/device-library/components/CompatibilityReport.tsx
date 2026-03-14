import { useState } from 'react';
import { Button, Input, Modal } from '@netmd-studio/ui';
import { useSubmitReport, type AggregatedReport } from '../hooks/useDeviceReports';
import { CheckCircle, XCircle, AlertCircle, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

function SuccessRate({ success, total, label }: { success: number; total: number; label: string }) {
  if (total === 0) return null;
  const rate = Math.round((success / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-label text-[var(--text-secondary)]">{label}</span>
          <span className="text-label font-mono text-[var(--accent)]">{rate}%</span>
        </div>
        <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${rate}%`,
              backgroundColor: rate >= 80 ? '#00cc88' : rate >= 50 ? '#ffaa00' : '#ff3344',
            }}
          />
        </div>
      </div>
      <span className="text-tag text-[var(--text-tertiary)] whitespace-nowrap">
        {success}/{total}
      </span>
    </div>
  );
}

export function CompatibilityStats({ aggregated }: { aggregated: AggregatedReport | null }) {
  if (!aggregated || aggregated.totalReports === 0) {
    return (
      <div className="text-center py-6">
        <BarChart3 size={24} className="text-[var(--border)] mx-auto mb-2" />
        <p className="text-nav text-[var(--text-tertiary)]">No compatibility reports yet</p>
        <p className="text-tag text-[var(--text-tertiary)] mt-1">Be the first to report!</p>
      </div>
    );
  }

  const webusbTotal = aggregated.webusbSuccess + aggregated.webusbFail;
  const netmdjsTotal = aggregated.netmdjsSuccess + aggregated.netmdjsFail;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-nav font-medium text-[var(--text-primary)]">
          {aggregated.totalReports} report{aggregated.totalReports !== 1 ? 's' : ''}
        </span>
      </div>

      <SuccessRate success={aggregated.webusbSuccess} total={webusbTotal} label="WebUSB" />
      <SuccessRate success={aggregated.netmdjsSuccess} total={netmdjsTotal} label="netmd-js" />

      {Object.keys(aggregated.browsers).length > 0 && (
        <div className="pt-2 border-t border-[var(--border)]">
          <span className="text-tag text-[var(--text-tertiary)] uppercase tracking-wider">Browsers tested</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(aggregated.browsers).map(([browser, count]) => (
              <span key={browser} className="text-tag px-1.5 py-0.5 bg-[var(--surface-3)] rounded text-[var(--text-secondary)]">
                {browser} ({count})
              </span>
            ))}
          </div>
        </div>
      )}

      {Object.keys(aggregated.operatingSystems).length > 0 && (
        <div className="pt-2 border-t border-[var(--border)]">
          <span className="text-tag text-[var(--text-tertiary)] uppercase tracking-wider">Operating systems</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(aggregated.operatingSystems).map(([os, count]) => (
              <span key={os} className="text-tag px-1.5 py-0.5 bg-[var(--surface-3)] rounded text-[var(--text-secondary)]">
                {os} ({count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function CompatibilityReportForm({
  deviceId,
  open,
  onClose,
  onSubmitted,
}: {
  deviceId: string;
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const { submitReport, submitting } = useSubmitReport();
  const [worksWebusb, setWorksWebusb] = useState<boolean | null>(null);
  const [worksNetmdjs, setWorksNetmdjs] = useState<boolean | null>(null);
  const [os, setOs] = useState('');
  const [browser, setBrowser] = useState('');
  const [browserVersion, setBrowserVersion] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    const { error } = await submitReport({
      device_id: deviceId,
      works_with_webusb: worksWebusb,
      works_with_netmd_js: worksNetmdjs,
      operating_system: os,
      browser,
      browser_version: browserVersion,
      notes,
    });

    if (error) {
      toast.error(error);
    } else {
      toast.success('Report submitted');
      onSubmitted();
      onClose();
    }
  };

  function TriState({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: boolean | null;
    onChange: (v: boolean | null) => void;
  }) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-nav text-[var(--text-secondary)]">{label}</span>
        <div className="flex gap-2">
          {[
            { v: true, icon: CheckCircle, label: 'Works', color: 'text-[var(--success)] border-[var(--success)] bg-[var(--success)]/10' },
            { v: false, icon: XCircle, label: "Doesn't work", color: 'text-[var(--error)] border-[var(--error)] bg-[var(--error)]/10' },
            { v: null, icon: AlertCircle, label: 'Not tested', color: 'text-[var(--text-tertiary)] border-[var(--border)] bg-[var(--surface-3)]' },
          ].map((opt) => (
            <button
              key={String(opt.v)}
              type="button"
              onClick={() => onChange(opt.v as boolean | null)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-label font-medium transition-colors ${
                value === opt.v ? opt.color : 'border-[var(--border)] text-[var(--text-tertiary)] hover:border-[var(--border-hover)]'
              }`}
            >
              <opt.icon size={14} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Submit Compatibility Report" className="max-w-md">
      <div className="flex flex-col gap-4">
        <TriState label="Works with WebUSB?" value={worksWebusb} onChange={setWorksWebusb} />
        <TriState label="Works with netmd-js?" value={worksNetmdjs} onChange={setWorksNetmdjs} />
        <Input label="Operating System" placeholder="e.g. Windows 11, macOS 14, Ubuntu 24.04" value={os} onChange={(e) => setOs(e.target.value)} />
        <Input label="Browser" placeholder="e.g. Chrome, Edge, Opera" value={browser} onChange={(e) => setBrowser(e.target.value)} />
        <Input label="Browser Version" placeholder="e.g. 120.0" value={browserVersion} onChange={(e) => setBrowserVersion(e.target.value)} />
        <div className="flex flex-col gap-1">
          <label className="text-nav font-medium text-[var(--text-secondary)]">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional details about your experience..."
            rows={3}
            className="bg-[var(--surface-0)] border border-[var(--border)] rounded-md px-3 py-2 text-nav text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-accent)] outline-none transition-colors resize-none"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
