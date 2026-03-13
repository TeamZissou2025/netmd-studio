import { Link } from 'react-router';
import { Disc3, Usb, Radio, Mic, Headphones, Wifi } from 'lucide-react';
import { Card, Badge } from '@netmd-studio/ui';
import type { Database } from '@netmd-studio/types';
import { DEVICE_TYPE_LABELS } from '../hooks/useDevices';

type Device = Database['public']['Tables']['devices']['Row'];

const TYPE_BADGE_VARIANT: Record<string, 'cyan' | 'magenta' | 'amber' | 'green' | 'default'> = {
  portable_netmd: 'cyan',
  portable_himd: 'magenta',
  portable_standard: 'default',
  deck_netmd: 'amber',
  deck_standard: 'amber',
  deck_es: 'amber',
  shelf_system: 'green',
  car_unit: 'default',
  professional: 'default',
};

function FeatureIcon({ active, icon: Icon, label }: { active: boolean; icon: typeof Disc3; label: string }) {
  if (!active) return null;
  return (
    <span title={label} className="text-studio-text-dim">
      <Icon size={14} />
    </span>
  );
}

export function DeviceCard({ device }: { device: Device }) {
  return (
    <Link to={`/devices/${device.id}`}>
      <Card hoverable className="flex flex-col gap-3 h-full">
        {/* Device image or placeholder */}
        <div className="aspect-[4/3] bg-studio-black rounded-studio flex items-center justify-center overflow-hidden">
          {device.image_url ? (
            <img
              src={device.image_url}
              alt={device.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <Disc3 size={40} className="text-studio-border" />
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-studio-text leading-tight">{device.name}</h3>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant={TYPE_BADGE_VARIANT[device.device_type] ?? 'default'}>
              {DEVICE_TYPE_LABELS[device.device_type] ?? device.device_type}
            </Badge>
            {device.year_released && (
              <Badge>{device.year_released}</Badge>
            )}
          </div>

          <p className="text-2xs text-studio-text-muted">
            {device.manufacturer} {device.model_number}
          </p>

          {/* Feature icons row */}
          <div className="flex items-center gap-2 mt-auto pt-2 border-t border-studio-border">
            <FeatureIcon active={device.has_mdlp} icon={Disc3} label="MDLP" />
            <FeatureIcon active={device.has_type_s} icon={Radio} label="Type-S" />
            <FeatureIcon active={device.has_optical_in} icon={Wifi} label="Optical In" />
            <FeatureIcon active={device.has_usb} icon={Usb} label="USB" />
            <FeatureIcon active={device.has_mic_in} icon={Mic} label="Mic In" />
            <FeatureIcon active={device.has_line_out} icon={Headphones} label="Line Out" />
            {device.netmd_js_compatible && (
              <span className="ml-auto text-2xs font-mono text-studio-cyan" title="WebUSB compatible">
                WebUSB
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
