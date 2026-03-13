import { useState } from 'react';
import { useParams, Link } from 'react-router';
import {
  ArrowLeft, Usb, Disc3, Radio, Mic, Headphones, Wifi,
  Check, X, ExternalLink, FileText, MessageSquarePlus,
} from 'lucide-react';
import { Button, Badge, Card, Skeleton } from '@netmd-studio/ui';
import { useDevice, DEVICE_TYPE_LABELS } from './hooks/useDevices';
import { useDeviceReports } from './hooks/useDeviceReports';
import { CompatibilityStats, CompatibilityReportForm } from './components/CompatibilityReport';
import { DeviceListings } from '../marketplace/components/DeviceListings';
import { useAuth } from '../../hooks/useAuth';

const ATRAC_LABELS: Record<string, string> = {
  v1: 'ATRAC v1',
  v2: 'ATRAC v2',
  v3: 'ATRAC v3',
  'v3.5': 'ATRAC v3.5',
  v4: 'ATRAC v4',
  'v4.5': 'ATRAC v4.5',
  type_r: 'ATRAC Type-R',
  type_s: 'ATRAC Type-S',
};

function SpecRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-studio-border last:border-0">
      <span className="text-xs text-studio-text-muted">{label}</span>
      <span className="text-xs font-mono text-studio-text">{value}</span>
    </div>
  );
}

function BoolIcon({ value }: { value: boolean }) {
  return value ? (
    <Check size={14} className="text-studio-success" />
  ) : (
    <X size={14} className="text-studio-text-dim" />
  );
}

function FeatureGrid({ features }: { features: { label: string; value: boolean }[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4">
      {features.map((f) => (
        <div key={f.label} className="flex items-center gap-2 py-1.5 border-b border-studio-border">
          <BoolIcon value={f.value} />
          <span className="text-xs text-studio-text-muted">{f.label}</span>
        </div>
      ))}
    </div>
  );
}

export function DeviceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { device, loading, error } = useDevice(id);
  const { aggregated, loading: reportsLoading, refetch: refetchReports } = useDeviceReports(id);
  const { user } = useAuth();
  const [showReportForm, setShowReportForm] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="aspect-square lg:col-span-1" />
          <div className="lg:col-span-2 flex flex-col gap-3">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-md text-studio-error mb-4">{error || 'Device not found'}</p>
        <Link to="/devices">
          <Button variant="secondary">
            <ArrowLeft size={14} /> Back to devices
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <Link to="/devices" className="inline-flex items-center gap-1.5 text-sm text-studio-text-muted hover:text-studio-cyan transition-colors w-fit">
        <ArrowLeft size={14} />
        Back to Device Library
      </Link>

      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image */}
        <div className="bg-studio-surface border border-studio-border rounded-studio-lg flex items-center justify-center aspect-square overflow-hidden">
          {device.image_url ? (
            <img src={device.image_url} alt={device.name} className="w-full h-full object-contain p-4" />
          ) : (
            <Disc3 size={80} className="text-studio-border" />
          )}
        </div>

        {/* Info */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant="amber">
                {DEVICE_TYPE_LABELS[device.device_type] ?? device.device_type}
              </Badge>
              {device.year_released && <Badge>{device.year_released}</Badge>}
              {device.netmd_js_compatible && (
                <Badge variant="cyan">WebUSB Compatible</Badge>
              )}
              {device.has_himd && <Badge variant="magenta">Hi-MD</Badge>}
              {device.verified && <Badge variant="green">Verified</Badge>}
            </div>
            <h1 className="text-2xl font-semibold text-studio-text">{device.name}</h1>
            <p className="text-md text-studio-text-muted mt-1">
              {device.manufacturer} {device.model_number}
            </p>
          </div>

          {device.description && (
            <p className="text-sm text-studio-text-muted leading-relaxed">{device.description}</p>
          )}

          {/* Quick actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {device.netmd_js_compatible && (
              <Link to="/transfer">
                <Button variant="primary" className="gap-1.5">
                  <Usb size={14} />
                  Use in Transfer Studio
                </Button>
              </Link>
            )}
            <Link to={`/marketplace?device=${device.id}`}>
              <Button variant="secondary" className="gap-1.5">
                <ExternalLink size={14} />
                Find on Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Specs + Reports grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Specifications */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* General Specs */}
          <Card>
            <h2 className="text-lg font-semibold text-studio-text mb-3">Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <div>
                <SpecRow label="Manufacturer" value={device.manufacturer} />
                <SpecRow label="Model Number" value={device.model_number} />
                <SpecRow label="Type" value={DEVICE_TYPE_LABELS[device.device_type] ?? device.device_type} />
                {device.year_released && (
                  <SpecRow label="Year Released" value={device.year_released} />
                )}
                {device.year_discontinued && (
                  <SpecRow label="Year Discontinued" value={device.year_discontinued} />
                )}
                {device.atrac_version && (
                  <SpecRow label="ATRAC Version" value={ATRAC_LABELS[device.atrac_version] ?? device.atrac_version} />
                )}
              </div>
              <div>
                {device.weight_grams && (
                  <SpecRow label="Weight" value={`${device.weight_grams}g`} />
                )}
                {device.battery_type && (
                  <SpecRow label="Battery" value={device.battery_type} />
                )}
                {device.display_type && (
                  <SpecRow label="Display" value={device.display_type} />
                )}
                {device.usb_speed && (
                  <SpecRow label="USB Speed" value={`USB ${device.usb_speed}`} />
                )}
                {device.transfer_speed && (
                  <SpecRow label="Transfer Speed" value={device.transfer_speed} />
                )}
              </div>
            </div>
          </Card>

          {/* Features */}
          <Card>
            <h2 className="text-lg font-semibold text-studio-text mb-3">Features</h2>
            <FeatureGrid
              features={[
                { label: 'MDLP (Long Play)', value: device.has_mdlp },
                { label: 'Hi-MD', value: device.has_himd },
                { label: 'Type-S DSP', value: device.has_type_s },
                { label: 'Recording', value: device.has_recording },
                { label: 'Optical In', value: device.has_optical_in },
                { label: 'Optical Out', value: device.has_optical_out },
                { label: 'Line In', value: device.has_line_in },
                { label: 'Line Out', value: device.has_line_out },
                { label: 'Mic In', value: device.has_mic_in },
                { label: 'USB', value: device.has_usb },
              ]}
            />
          </Card>

          {/* USB / WebUSB Info */}
          {device.has_usb && (
            <Card>
              <h2 className="text-lg font-semibold text-studio-text mb-3">USB / WebUSB</h2>
              <div className="flex flex-col gap-2">
                {device.usb_vid && device.usb_pid && (
                  <SpecRow
                    label="USB ID"
                    value={
                      <span className="font-mono text-studio-cyan">
                        {device.usb_vid}:{device.usb_pid}
                      </span>
                    }
                  />
                )}
                <SpecRow
                  label="netmd-js Compatible"
                  value={<BoolIcon value={device.netmd_js_compatible} />}
                />
                {device.webusb_filter && (
                  <SpecRow
                    label="WebUSB Filter"
                    value={
                      <code className="text-2xs bg-studio-black px-1.5 py-0.5 rounded text-studio-cyan">
                        {JSON.stringify(device.webusb_filter)}
                      </code>
                    }
                  />
                )}
              </div>
            </Card>
          )}

          {/* Notes */}
          {device.notes && (
            <Card>
              <h2 className="text-lg font-semibold text-studio-text mb-3">Community Notes</h2>
              <p className="text-sm text-studio-text-muted whitespace-pre-wrap">{device.notes}</p>
            </Card>
          )}
        </div>

        {/* Sidebar: Compatibility + Related */}
        <div className="flex flex-col gap-6">
          {/* Compatibility Reports */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-studio-text">Compatibility</h2>
              {user && (
                <button
                  onClick={() => setShowReportForm(true)}
                  className="text-2xs text-studio-cyan hover:text-studio-cyan-hover transition-colors flex items-center gap-1"
                >
                  <MessageSquarePlus size={12} />
                  Add Report
                </button>
              )}
            </div>
            {reportsLoading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <CompatibilityStats aggregated={aggregated} />
            )}
            {!user && (
              <p className="text-2xs text-studio-text-dim mt-3 pt-3 border-t border-studio-border">
                <Link to="/auth/login" className="text-studio-cyan hover:text-studio-cyan-hover">Sign in</Link> to submit a compatibility report
              </p>
            )}
          </Card>

          {/* Related Marketplace Listings */}
          <Card>
            <h2 className="text-lg font-semibold text-studio-text mb-3">Marketplace Listings</h2>
            <DeviceListings deviceId={device.id} />
          </Card>
        </div>
      </div>

      {/* Report form modal */}
      {showReportForm && (
        <CompatibilityReportForm
          deviceId={device.id}
          open={showReportForm}
          onClose={() => setShowReportForm(false)}
          onSubmitted={refetchReports}
        />
      )}
    </div>
  );
}
