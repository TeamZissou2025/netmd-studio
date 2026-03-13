import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Check, X, ExternalLink, Shield } from 'lucide-react';
import { Button, Badge, Card, Skeleton } from '@netmd-studio/ui';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { DEVICE_TYPE_LABELS } from './hooks/useDevices';
import type { Database } from '@netmd-studio/types';
import toast from 'react-hot-toast';

type Device = Database['public']['Tables']['devices']['Row'];

export function AdminDevicesPage() {
  const { user, loading: authLoading } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUnverified();
  }, []);

  async function fetchUnverified() {
    setLoading(true);
    const { data } = await supabase
      .from('devices')
      .select('*')
      .eq('verified', false)
      .order('created_at', { ascending: false });

    setDevices((data as Device[]) ?? []);
    setLoading(false);
  }

  async function approveDevice(id: string) {
    setProcessingId(id);
    const { error } = await supabase
      .from('devices')
      .update({ verified: true })
      .eq('id', id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Device approved');
      setDevices((prev) => prev.filter((d) => d.id !== id));
    }
    setProcessingId(null);
  }

  async function rejectDevice(id: string) {
    if (!confirm('Delete this device submission?')) return;
    setProcessingId(id);
    const { error } = await supabase
      .from('devices')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Device rejected');
      setDevices((prev) => prev.filter((d) => d.id !== id));
    }
    setProcessingId(null);
  }

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Shield size={40} className="text-studio-border mb-4" />
        <p className="text-md text-studio-text-muted mb-4">Admin access required</p>
        <Link to="/auth/login"><Button>Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold text-studio-text">Device Review Queue</h1>
        <p className="text-sm text-studio-text-muted mt-1">
          Review and approve community-submitted devices
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : devices.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <Check size={32} className="text-studio-success mx-auto mb-3" />
            <p className="text-md text-studio-text-muted">No pending submissions</p>
            <p className="text-sm text-studio-text-dim mt-1">All clear! Check back later.</p>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-studio-text-dim">
            {devices.length} pending submission{devices.length !== 1 ? 's' : ''}
          </p>
          {devices.map((device) => (
            <Card key={device.id}>
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-sm font-semibold text-studio-text">{device.name}</h3>
                    <Badge variant="amber">
                      {DEVICE_TYPE_LABELS[device.device_type] ?? device.device_type}
                    </Badge>
                    {device.year_released && <Badge>{device.year_released}</Badge>}
                  </div>
                  <p className="text-xs text-studio-text-muted">
                    {device.manufacturer} {device.model_number}
                  </p>
                  {device.description && (
                    <p className="text-xs text-studio-text-dim mt-2 line-clamp-2">
                      {device.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-2xs text-studio-text-dim">
                    <span>MDLP: {device.has_mdlp ? 'Yes' : 'No'}</span>
                    <span>USB: {device.has_usb ? 'Yes' : 'No'}</span>
                    <span>Recording: {device.has_recording ? 'Yes' : 'No'}</span>
                    {device.usb_vid && <span>VID/PID: {device.usb_vid}:{device.usb_pid}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/devices/${device.id}`}>
                    <Button variant="ghost" className="gap-1">
                      <ExternalLink size={12} />
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="primary"
                    onClick={() => approveDevice(device.id)}
                    disabled={processingId === device.id}
                    className="gap-1"
                  >
                    <Check size={14} />
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => rejectDevice(device.id)}
                    disabled={processingId === device.id}
                    className="gap-1"
                  >
                    <X size={14} />
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
