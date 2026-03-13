import { ShoppingBag, CreditCard, MessageSquare, Star } from 'lucide-react';

export function MarketplacePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-studio-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
        <ShoppingBag size={32} className="text-studio-success" />
      </div>
      <h2 className="text-2xl font-semibold text-studio-text mb-2">Marketplace</h2>
      <p className="text-base text-studio-text-muted max-w-md mb-8">
        Buy and sell MiniDisc hardware, blank discs, and accessories.
        Powered by Stripe Connect with 10% platform fee.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-lg">
        {[
          { icon: ShoppingBag, label: 'Listings' },
          { icon: CreditCard, label: 'Checkout' },
          { icon: MessageSquare, label: 'Messages' },
          { icon: Star, label: 'Reviews' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 p-3 bg-studio-surface border border-studio-border rounded-studio-lg">
            <Icon size={20} className="text-studio-text-dim" />
            <span className="text-xs text-studio-text-muted">{label}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-studio-text-dim mt-8">Coming in Prompt 5</p>
    </div>
  );
}
