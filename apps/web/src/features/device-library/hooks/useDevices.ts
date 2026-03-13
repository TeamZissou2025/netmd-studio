import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Database, DeviceType } from '@netmd-studio/types';

type Device = Database['public']['Tables']['devices']['Row'];

export interface DeviceFilters {
  search: string;
  types: string[];
  manufacturers: string[];
  features: string[];
  yearMin: number;
  yearMax: number;
  webusbOnly: boolean;
  sort: 'name' | 'year_newest' | 'year_oldest' | 'manufacturer';
}

export const DEFAULT_FILTERS: DeviceFilters = {
  search: '',
  types: [],
  manufacturers: [],
  features: [],
  yearMin: 1992,
  yearMax: 2020,
  sort: 'name',
  webusbOnly: false,
};

export const DEVICE_TYPE_LABELS: Record<string, string> = {
  portable_netmd: 'Portable NetMD',
  portable_himd: 'Portable Hi-MD',
  portable_standard: 'Portable Standard',
  deck_netmd: 'Deck NetMD',
  deck_standard: 'Deck Standard',
  deck_es: 'Deck ES',
  shelf_system: 'Shelf System',
  car_unit: 'Car Unit',
  professional: 'Professional',
};

export const MANUFACTURERS = [
  'Sony', 'Sharp', 'Kenwood', 'Panasonic', 'Aiwa',
  'Denon', 'Tascam', 'TEAC', 'Onkyo',
];

export const FEATURE_FILTERS = [
  { key: 'has_mdlp', label: 'MDLP' },
  { key: 'has_himd', label: 'Hi-MD' },
  { key: 'has_type_s', label: 'Type-S' },
  { key: 'has_optical_in', label: 'Optical In' },
  { key: 'has_optical_out', label: 'Optical Out' },
  { key: 'has_line_in', label: 'Line In' },
  { key: 'has_line_out', label: 'Line Out' },
  { key: 'has_mic_in', label: 'Mic In' },
  { key: 'has_usb', label: 'USB' },
  { key: 'has_recording', label: 'Recording' },
];

export function useDevices(filters: DeviceFilters) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase.from('devices').select('*');

    // Full-text search
    if (filters.search.trim()) {
      query = query.textSearch('fts', filters.search.trim(), { type: 'websearch' });
    }

    // Type filter
    if (filters.types.length > 0) {
      query = query.in('device_type', filters.types as DeviceType[]);
    }

    // Manufacturer filter
    if (filters.manufacturers.length > 0) {
      query = query.in('manufacturer', filters.manufacturers);
    }

    // Feature filters
    for (const feature of filters.features) {
      query = query.eq(feature as any, true);
    }

    // Year range
    if (filters.yearMin > 1992) {
      query = query.gte('year_released', filters.yearMin);
    }
    if (filters.yearMax < 2020) {
      query = query.lte('year_released', filters.yearMax);
    }

    // WebUSB only
    if (filters.webusbOnly) {
      query = query.eq('netmd_js_compatible', true);
    }

    // Sort
    switch (filters.sort) {
      case 'name':
        query = query.order('name');
        break;
      case 'year_newest':
        query = query.order('year_released', { ascending: false, nullsFirst: false });
        break;
      case 'year_oldest':
        query = query.order('year_released', { ascending: true, nullsFirst: false });
        break;
      case 'manufacturer':
        query = query.order('manufacturer').order('name');
        break;
    }

    const { data, error: err } = await query;

    if (err) {
      setError(err.message);
      setDevices([]);
    } else {
      setDevices((data as Device[]) ?? []);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return { devices, loading, error, refetch: fetchDevices };
}

export function useDevice(id: string | undefined) {
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetch() {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('devices')
        .select('*')
        .eq('id', id!)
        .single();

      if (err) {
        setError(err.message);
        setDevice(null);
      } else {
        setDevice(data as Device);
      }
      setLoading(false);
    }

    fetch();
  }, [id]);

  return { device, loading, error };
}
