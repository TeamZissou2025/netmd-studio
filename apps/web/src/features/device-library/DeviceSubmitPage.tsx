import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { ArrowLeft, Send } from 'lucide-react';
import { Button, Input, Card } from '@netmd-studio/ui';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { DEVICE_TYPE_LABELS } from './hooks/useDevices';
import toast from 'react-hot-toast';

const DEVICE_TYPES = Object.entries(DEVICE_TYPE_LABELS).map(([value, label]) => ({ value, label }));

const ATRAC_VERSIONS = [
  { value: '', label: 'Unknown' },
  { value: 'v1', label: 'ATRAC v1' },
  { value: 'v2', label: 'ATRAC v2' },
  { value: 'v3', label: 'ATRAC v3' },
  { value: 'v3.5', label: 'ATRAC v3.5' },
  { value: 'v4', label: 'ATRAC v4' },
  { value: 'v4.5', label: 'ATRAC v4.5' },
  { value: 'type_r', label: 'ATRAC Type-R' },
  { value: 'type_s', label: 'ATRAC Type-S' },
];

interface FormState {
  name: string;
  manufacturer: string;
  model_number: string;
  device_type: string;
  year_released: string;
  atrac_version: string;
  description: string;
  notes: string;
  has_mdlp: boolean;
  has_himd: boolean;
  has_type_s: boolean;
  has_optical_in: boolean;
  has_optical_out: boolean;
  has_line_in: boolean;
  has_line_out: boolean;
  has_mic_in: boolean;
  has_usb: boolean;
  has_recording: boolean;
  usb_vid: string;
  usb_pid: string;
  battery_type: string;
  display_type: string;
  weight_grams: string;
}

const INITIAL_STATE: FormState = {
  name: '',
  manufacturer: 'Sony',
  model_number: '',
  device_type: 'portable_netmd',
  year_released: '',
  atrac_version: '',
  description: '',
  notes: '',
  has_mdlp: false,
  has_himd: false,
  has_type_s: false,
  has_optical_in: false,
  has_optical_out: false,
  has_line_in: false,
  has_line_out: false,
  has_mic_in: false,
  has_usb: false,
  has_recording: true,
  usb_vid: '',
  usb_pid: '',
  battery_type: '',
  display_type: '',
  weight_grams: '',
};

function smartDefaults(deviceType: string, prev: FormState): Partial<FormState> {
  const base: Partial<FormState> = {};
  if (deviceType.startsWith('portable_')) {
    base.has_recording = true;
    base.has_line_out = true;
  }
  if (deviceType === 'portable_netmd') {
    base.has_usb = true;
    base.has_mdlp = true;
    base.has_mic_in = true;
    base.has_line_in = true;
  }
  if (deviceType === 'portable_himd') {
    base.has_usb = true;
    base.has_himd = true;
    base.has_mdlp = true;
    base.has_mic_in = true;
    base.has_line_in = true;
  }
  if (deviceType.startsWith('deck_')) {
    base.has_optical_in = true;
    base.has_line_in = true;
    base.has_line_out = true;
    base.has_recording = true;
  }
  if (deviceType === 'deck_netmd') {
    base.has_usb = true;
    base.has_mdlp = true;
  }
  return base;
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 py-1 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-3.5 h-3.5 rounded border-studio-border bg-studio-black accent-studio-cyan"
      />
      <span className="text-xs text-studio-text-muted">{label}</span>
    </label>
  );
}

export function DeviceSubmitPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-md text-studio-text-muted mb-4">
          You must be signed in to submit a device
        </p>
        <Link to="/auth/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  const set = (key: keyof FormState, value: string | boolean) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'device_type') {
        const defaults = smartDefaults(value as string, next);
        return { ...next, ...defaults };
      }
      return next;
    });
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.model_number.trim()) e.model_number = 'Required';
    if (!form.manufacturer.trim()) e.manufacturer = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    const { error } = await supabase.from('devices').insert({
      name: form.name.trim(),
      manufacturer: form.manufacturer.trim(),
      model_number: form.model_number.trim(),
      device_type: form.device_type as any,
      year_released: form.year_released ? Number(form.year_released) : null,
      atrac_version: (form.atrac_version || null) as any,
      description: form.description.trim() || null,
      notes: form.notes.trim() || null,
      has_mdlp: form.has_mdlp,
      has_himd: form.has_himd,
      has_type_s: form.has_type_s,
      has_optical_in: form.has_optical_in,
      has_optical_out: form.has_optical_out,
      has_line_in: form.has_line_in,
      has_line_out: form.has_line_out,
      has_mic_in: form.has_mic_in,
      has_usb: form.has_usb,
      has_recording: form.has_recording,
      usb_vid: form.usb_vid.trim() || null,
      usb_pid: form.usb_pid.trim() || null,
      battery_type: form.battery_type.trim() || null,
      display_type: form.display_type.trim() || null,
      weight_grams: form.weight_grams ? Number(form.weight_grams) : null,
      submitted_by: user.id,
      verified: false,
      netmd_js_compatible: false,
    });

    setSubmitting(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Device submitted for review');
      navigate('/devices');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Link to="/devices" className="inline-flex items-center gap-1.5 text-sm text-studio-text-muted hover:text-studio-cyan transition-colors w-fit">
        <ArrowLeft size={14} />
        Back to Device Library
      </Link>

      <div>
        <h1 className="text-2xl font-semibold text-studio-text">Submit a Device</h1>
        <p className="text-sm text-studio-text-muted mt-1">
          Contribute to the community device database. Submissions are reviewed before publishing.
        </p>
      </div>

      <Card>
        <div className="flex flex-col gap-4">
          {/* Basic Info */}
          <h3 className="text-sm font-semibold text-studio-text uppercase tracking-wider">Basic Information</h3>
          <Input
            label="Device Name"
            placeholder="e.g. Sony MZ-N707"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            error={errors.name}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Manufacturer"
              value={form.manufacturer}
              onChange={(e) => set('manufacturer', e.target.value)}
              error={errors.manufacturer}
            />
            <Input
              label="Model Number"
              placeholder="e.g. MZ-N707"
              value={form.model_number}
              onChange={(e) => set('model_number', e.target.value)}
              error={errors.model_number}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-studio-text-muted">Device Type</label>
              <select
                value={form.device_type}
                onChange={(e) => set('device_type', e.target.value)}
                className="h-8 bg-studio-black border border-studio-border rounded-studio px-2 text-sm text-studio-text focus:border-studio-cyan outline-none"
              >
                {DEVICE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <Input
              label="Year Released"
              type="number"
              min={1992}
              max={2025}
              placeholder="e.g. 2003"
              value={form.year_released}
              onChange={(e) => set('year_released', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-studio-text-muted">ATRAC Version</label>
            <select
              value={form.atrac_version}
              onChange={(e) => set('atrac_version', e.target.value)}
              className="h-8 bg-studio-black border border-studio-border rounded-studio px-2 text-sm text-studio-text focus:border-studio-cyan outline-none"
            >
              {ATRAC_VERSIONS.map((v) => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </div>

          {/* Features */}
          <h3 className="text-sm font-semibold text-studio-text uppercase tracking-wider mt-2">Features</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4">
            <Checkbox label="MDLP (Long Play)" checked={form.has_mdlp} onChange={(v) => set('has_mdlp', v)} />
            <Checkbox label="Hi-MD" checked={form.has_himd} onChange={(v) => set('has_himd', v)} />
            <Checkbox label="Type-S DSP" checked={form.has_type_s} onChange={(v) => set('has_type_s', v)} />
            <Checkbox label="Optical In" checked={form.has_optical_in} onChange={(v) => set('has_optical_in', v)} />
            <Checkbox label="Optical Out" checked={form.has_optical_out} onChange={(v) => set('has_optical_out', v)} />
            <Checkbox label="Line In" checked={form.has_line_in} onChange={(v) => set('has_line_in', v)} />
            <Checkbox label="Line Out" checked={form.has_line_out} onChange={(v) => set('has_line_out', v)} />
            <Checkbox label="Mic In" checked={form.has_mic_in} onChange={(v) => set('has_mic_in', v)} />
            <Checkbox label="USB" checked={form.has_usb} onChange={(v) => set('has_usb', v)} />
            <Checkbox label="Recording" checked={form.has_recording} onChange={(v) => set('has_recording', v)} />
          </div>

          {/* Hardware Details */}
          <h3 className="text-sm font-semibold text-studio-text uppercase tracking-wider mt-2">Hardware Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="USB VID (hex)"
              placeholder="e.g. 054c"
              value={form.usb_vid}
              onChange={(e) => set('usb_vid', e.target.value)}
            />
            <Input
              label="USB PID (hex)"
              placeholder="e.g. 0075"
              value={form.usb_pid}
              onChange={(e) => set('usb_pid', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Battery Type"
              placeholder="e.g. Gumstick NH-14WM"
              value={form.battery_type}
              onChange={(e) => set('battery_type', e.target.value)}
            />
            <Input
              label="Display"
              placeholder="e.g. LCD, OLED"
              value={form.display_type}
              onChange={(e) => set('display_type', e.target.value)}
            />
            <Input
              label="Weight (grams)"
              type="number"
              placeholder="e.g. 85"
              value={form.weight_grams}
              onChange={(e) => set('weight_grams', e.target.value)}
            />
          </div>

          {/* Description */}
          <h3 className="text-sm font-semibold text-studio-text uppercase tracking-wider mt-2">Description</h3>
          <textarea
            placeholder="Describe the device, its unique features, and any relevant history..."
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            className="bg-studio-black border border-studio-border rounded-studio px-3 py-2 text-sm text-studio-text placeholder:text-studio-text-dim focus:border-studio-cyan focus:ring-1 focus:ring-studio-cyan-border outline-none transition-colors resize-none"
          />
          <textarea
            placeholder="Additional notes (compatibility quirks, tips, etc.)"
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={2}
            className="bg-studio-black border border-studio-border rounded-studio px-3 py-2 text-sm text-studio-text placeholder:text-studio-text-dim focus:border-studio-cyan focus:ring-1 focus:ring-studio-cyan-border outline-none transition-colors resize-none"
          />

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-4 border-t border-studio-border">
            <Link to="/devices">
              <Button variant="ghost">Cancel</Button>
            </Link>
            <Button onClick={handleSubmit} disabled={submitting} className="gap-1.5">
              <Send size={14} />
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
