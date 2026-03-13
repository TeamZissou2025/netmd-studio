import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Database } from '@netmd-studio/types';

type DeviceReport = Database['public']['Tables']['device_reports']['Row'];

export interface AggregatedReport {
  totalReports: number;
  webusbSuccess: number;
  webusbFail: number;
  netmdjsSuccess: number;
  netmdjsFail: number;
  operatingSystems: Record<string, number>;
  browsers: Record<string, number>;
}

function aggregateReports(reports: DeviceReport[]): AggregatedReport {
  const result: AggregatedReport = {
    totalReports: reports.length,
    webusbSuccess: 0,
    webusbFail: 0,
    netmdjsSuccess: 0,
    netmdjsFail: 0,
    operatingSystems: {},
    browsers: {},
  };

  for (const report of reports) {
    if (report.works_with_webusb === true) result.webusbSuccess++;
    if (report.works_with_webusb === false) result.webusbFail++;
    if (report.works_with_netmd_js === true) result.netmdjsSuccess++;
    if (report.works_with_netmd_js === false) result.netmdjsFail++;

    if (report.operating_system) {
      result.operatingSystems[report.operating_system] =
        (result.operatingSystems[report.operating_system] || 0) + 1;
    }
    if (report.browser) {
      result.browsers[report.browser] =
        (result.browsers[report.browser] || 0) + 1;
    }
  }

  return result;
}

export function useDeviceReports(deviceId: string | undefined) {
  const [reports, setReports] = useState<DeviceReport[]>([]);
  const [aggregated, setAggregated] = useState<AggregatedReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    if (!deviceId) return;
    setLoading(true);

    const { data } = await supabase
      .from('device_reports')
      .select('*')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false });

    const items = (data as DeviceReport[]) ?? [];
    setReports(items);
    setAggregated(aggregateReports(items));
    setLoading(false);
  }, [deviceId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { reports, aggregated, loading, refetch: fetchReports };
}

export function useSubmitReport() {
  const [submitting, setSubmitting] = useState(false);

  const submitReport = async (report: {
    device_id: string;
    works_with_webusb: boolean | null;
    works_with_netmd_js: boolean | null;
    operating_system: string;
    browser: string;
    browser_version: string;
    notes: string;
  }) => {
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      return { error: 'You must be signed in to submit a report' };
    }

    const { error } = await supabase.from('device_reports').upsert(
      {
        device_id: report.device_id,
        user_id: user.id,
        works_with_webusb: report.works_with_webusb,
        works_with_netmd_js: report.works_with_netmd_js,
        operating_system: report.operating_system || null,
        browser: report.browser || null,
        browser_version: report.browser_version || null,
        notes: report.notes || null,
      },
      { onConflict: 'device_id,user_id' }
    );

    setSubmitting(false);
    return { error: error?.message ?? null };
  };

  return { submitReport, submitting };
}
