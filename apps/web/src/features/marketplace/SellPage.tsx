import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router';
import { ArrowLeft, Loader2, CreditCard, CheckCircle } from 'lucide-react';
import { Button, Input, Select, Card } from '@netmd-studio/ui';
import { useAuth } from '../../hooks/useAuth';
import { useSellerProfile } from './hooks/useSellerProfile';
import { ImageUploader } from './components/ImageUploader';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import type { ListingCategory, ListingCondition, ListingStatus, Database } from '@netmd-studio/types';

type Listing = Database['public']['Tables']['listings']['Row'];

const CATEGORY_OPTIONS = [
  { value: 'portable', label: 'Portable Player' },
  { value: 'deck', label: 'Deck / Component' },
  { value: 'disc_blank', label: 'Blank Discs' },
  { value: 'disc_prerecorded', label: 'Pre-recorded Discs' },
  { value: 'disc_custom', label: 'Custom Discs' },
  { value: 'accessory', label: 'Accessory' },
  { value: 'remote', label: 'Remote Control' },
  { value: 'cable', label: 'Cable / Adapter' },
  { value: 'other', label: 'Other' },
];

const CONDITION_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'for_parts', label: 'For Parts / Not Working' },
];

interface FormState {
  title: string;
  description: string;
  category: ListingCategory;
  condition: ListingCondition;
  priceDollars: string;
  shippingDollars: string;
  shippingDomesticOnly: boolean;
  quantity: number;
  images: string[];
  brand: string;
  model: string;
  tags: string;
  deviceId: string;
}

const INITIAL_STATE: FormState = {
  title: '',
  description: '',
  category: 'portable',
  condition: 'good',
  priceDollars: '',
  shippingDollars: '0',
  shippingDomesticOnly: false,
  quantity: 1,
  images: [],
  brand: '',
  model: '',
  tags: '',
  deviceId: '',
};

export function SellPage() {
  const { id: editId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, startOnboarding } = useSellerProfile(user?.id);

  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(!!editId);
  const [onboarding, setOnboarding] = useState(false);

  // Handle onboarding return
  useEffect(() => {
    if (searchParams.get('onboarding') === 'complete' && profile) {
      // Refresh profile to check onboarding status
    }
  }, [searchParams, profile]);

  // Load existing listing for editing
  useEffect(() => {
    if (!editId || !user) return;

    async function loadListing() {
      setLoadingEdit(true);
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', editId!)
        .eq('seller_id', user!.id)
        .single();

      if (error || !data) {
        toast.error('Listing not found or access denied');
        navigate('/marketplace/sell');
        return;
      }

      const listing = data as Listing;
      setForm({
        title: listing.title,
        description: listing.description,
        category: listing.category,
        condition: listing.condition,
        priceDollars: (listing.price_cents / 100).toFixed(2),
        shippingDollars: (listing.shipping_price_cents / 100).toFixed(2),
        shippingDomesticOnly: listing.shipping_domestic_only,
        quantity: listing.quantity,
        images: listing.images,
        brand: listing.brand || '',
        model: listing.model || '',
        tags: (listing.tags || []).join(', '),
        deviceId: listing.device_id || '',
      });
      setLoadingEdit(false);
    }

    loadListing();
  }, [editId, user, navigate]);

  const updateForm = useCallback((updates: Partial<FormState>) => {
    setForm((f) => ({ ...f, ...updates }));
  }, []);

  const uploadImages = async (dataUrls: string[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const dataUrl of dataUrls) {
      if (!dataUrl.startsWith('data:')) {
        // Already a URL (editing existing listing)
        urls.push(dataUrl);
        continue;
      }
      const blob = await fetch(dataUrl).then((r) => r.blob());
      const ext = dataUrl.includes('image/webp') ? 'webp' : 'jpg';
      const path = `${user!.id}/listings/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('public-assets').upload(path, blob, {
        contentType: `image/${ext}`,
        upsert: true,
      });
      if (error) throw error;
      const { data } = supabase.storage.from('public-assets').getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const handleSave = async (status: ListingStatus) => {
    if (!user) return;

    // Validate
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.description.trim()) return toast.error('Description is required');
    if (!form.priceDollars || parseFloat(form.priceDollars) <= 0) return toast.error('Price must be greater than 0');
    if (form.images.length === 0 && status === 'active') return toast.error('Add at least one image to publish');

    setSaving(true);

    try {
      const imageUrls = await uploadImages(form.images);

      const listingData = {
        seller_id: user.id,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        condition: form.condition,
        price_cents: Math.round(parseFloat(form.priceDollars) * 100),
        shipping_price_cents: Math.round(parseFloat(form.shippingDollars || '0') * 100),
        shipping_domestic_only: form.shippingDomesticOnly,
        quantity: form.quantity,
        images: imageUrls,
        brand: form.brand.trim() || null,
        model: form.model.trim() || null,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : null,
        device_id: form.deviceId || null,
        status,
      };

      if (editId) {
        const { error } = await supabase
          .from('listings')
          .update(listingData)
          .eq('id', editId)
          .eq('seller_id', user.id);

        if (error) throw error;
        toast.success(status === 'active' ? 'Listing published' : 'Draft saved');
      } else {
        const { error } = await supabase.from('listings').insert(listingData);
        if (error) throw error;
        toast.success(status === 'active' ? 'Listing published' : 'Draft saved');
      }

      navigate('/dashboard/selling');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save listing');
    }

    setSaving(false);
  };

  const handleArchive = async () => {
    if (!editId || !user) return;
    const { error } = await supabase
      .from('listings')
      .update({ status: 'archived' as ListingStatus })
      .eq('id', editId)
      .eq('seller_id', user.id);

    if (error) {
      toast.error('Failed to archive listing');
    } else {
      toast.success('Listing archived');
      navigate('/dashboard/selling');
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-studio-cyan" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <CreditCard size={48} className="text-studio-border mb-4" />
        <h2 className="text-lg font-semibold text-studio-text mb-2">Sign in to sell</h2>
        <p className="text-sm text-studio-text-muted mb-4">You need an account to create listings</p>
        <Link to="/auth/login">
          <Button>Sign in</Button>
        </Link>
      </div>
    );
  }

  // Check if seller onboarding is needed
  const needsOnboarding = !profile?.stripe_account_id || !profile.stripe_onboarding_complete;

  if (needsOnboarding) {
    return (
      <div className="flex flex-col gap-6">
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 text-sm text-studio-text-muted hover:text-studio-cyan transition-colors w-fit"
        >
          <ArrowLeft size={14} />
          Back to Marketplace
        </Link>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          {profile?.stripe_account_id && !profile.stripe_onboarding_complete ? (
            <>
              <Loader2 size={48} className="text-studio-warning mb-4" />
              <h2 className="text-lg font-semibold text-studio-text mb-2">Complete payment setup</h2>
              <p className="text-sm text-studio-text-muted mb-6 max-w-md">
                Your Stripe account has been created but onboarding is not yet complete.
                Please finish setting up your payment information to start selling.
              </p>
            </>
          ) : (
            <>
              <CreditCard size={48} className="text-studio-border mb-4" />
              <h2 className="text-lg font-semibold text-studio-text mb-2">Start selling on NetMD Studio</h2>
              <p className="text-sm text-studio-text-muted mb-6 max-w-md">
                Set up your seller account with Stripe to receive payments directly.
                Platform fee is 10% per sale.
              </p>
            </>
          )}
          <Button
            onClick={async () => {
              setOnboarding(true);
              const { error } = await startOnboarding();
              if (error) {
                toast.error(error);
                setOnboarding(false);
              }
            }}
            disabled={onboarding}
          >
            {onboarding ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Redirecting to Stripe...
              </>
            ) : profile?.stripe_account_id ? (
              'Complete onboarding'
            ) : (
              'Set up seller account'
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (loadingEdit) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-studio-cyan" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 text-sm text-studio-text-muted hover:text-studio-cyan transition-colors"
        >
          <ArrowLeft size={14} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-studio-text">
            {editId ? 'Edit listing' : 'Create listing'}
          </h1>
          <p className="text-sm text-studio-text-muted mt-0.5 flex items-center gap-1">
            <CheckCircle size={12} className="text-studio-success" />
            Seller account active
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-5">
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => updateForm({ title: e.target.value })}
          placeholder="e.g., Sony MZ-N1 MiniDisc Recorder - Excellent Condition"
          maxLength={200}
        />

        <div>
          <label className="text-sm font-medium text-studio-text-muted block mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => updateForm({ description: e.target.value })}
            placeholder="Describe your item in detail: condition, what's included, any defects..."
            rows={5}
            maxLength={5000}
            className="w-full bg-studio-black border border-studio-border rounded-studio px-3 py-2 text-sm text-studio-text placeholder:text-studio-text-dim focus:border-studio-cyan focus:ring-1 focus:ring-studio-cyan-border outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => updateForm({ category: e.target.value as ListingCategory })}
            options={CATEGORY_OPTIONS}
          />
          <Select
            label="Condition"
            value={form.condition}
            onChange={(e) => updateForm({ condition: e.target.value as ListingCondition })}
            options={CONDITION_OPTIONS}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Price ($)"
            type="number"
            min="0.01"
            step="0.01"
            value={form.priceDollars}
            onChange={(e) => updateForm({ priceDollars: e.target.value })}
            placeholder="0.00"
          />
          <Input
            label="Shipping ($)"
            type="number"
            min="0"
            step="0.01"
            value={form.shippingDollars}
            onChange={(e) => updateForm({ shippingDollars: e.target.value })}
            placeholder="0.00"
          />
          <Input
            label="Quantity"
            type="number"
            min="1"
            value={String(form.quantity)}
            onChange={(e) => updateForm({ quantity: Math.max(1, parseInt(e.target.value) || 1) })}
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.shippingDomesticOnly}
            onChange={(e) => updateForm({ shippingDomesticOnly: e.target.checked })}
            className="rounded border-studio-border bg-studio-black text-studio-cyan focus:ring-studio-cyan-border accent-studio-cyan w-3.5 h-3.5"
          />
          <span className="text-sm text-studio-text-muted">Domestic shipping only</span>
        </label>

        <ImageUploader
          images={form.images}
          onChange={(images) => updateForm({ images })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Brand (optional)"
            value={form.brand}
            onChange={(e) => updateForm({ brand: e.target.value })}
            placeholder="e.g., Sony"
          />
          <Input
            label="Model (optional)"
            value={form.model}
            onChange={(e) => updateForm({ model: e.target.value })}
            placeholder="e.g., MZ-N1"
          />
        </div>

        <Input
          label="Tags (optional, comma-separated)"
          value={form.tags}
          onChange={(e) => updateForm({ tags: e.target.value })}
          placeholder="e.g., netmd, portable, recorder"
        />

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-studio-border">
          <Button onClick={() => handleSave('active')} disabled={saving}>
            {saving ? 'Saving...' : editId ? 'Update & publish' : 'Publish listing'}
          </Button>
          <Button variant="secondary" onClick={() => handleSave('draft')} disabled={saving}>
            Save as draft
          </Button>
          {editId && (
            <Button variant="danger" onClick={handleArchive} disabled={saving}>
              Archive
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
