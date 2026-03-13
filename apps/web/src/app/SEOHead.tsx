import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
}

export function SEOHead({ title, description }: SEOHeadProps) {
  useEffect(() => {
    const baseTitle = 'NetMD Studio';
    document.title = title ? `${title} — ${baseTitle}` : `${baseTitle} — The all-in-one MiniDisc platform`;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute('content', description);
      }
    }
  }, [title, description]);

  return null;
}

interface ListingStructuredDataProps {
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  condition: string;
  imageUrl?: string;
  sellerName?: string;
  url: string;
  inStock: boolean;
}

export function ListingStructuredData({
  name,
  description,
  priceCents,
  currency,
  condition,
  imageUrl,
  sellerName,
  url,
  inStock,
}: ListingStructuredDataProps) {
  const conditionMap: Record<string, string> = {
    new: 'https://schema.org/NewCondition',
    like_new: 'https://schema.org/UsedCondition',
    excellent: 'https://schema.org/UsedCondition',
    good: 'https://schema.org/UsedCondition',
    fair: 'https://schema.org/UsedCondition',
    poor: 'https://schema.org/UsedCondition',
    for_parts: 'https://schema.org/DamagedCondition',
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: imageUrl,
    url,
    offers: {
      '@type': 'Offer',
      price: (priceCents / 100).toFixed(2),
      priceCurrency: currency,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: conditionMap[condition] || 'https://schema.org/UsedCondition',
      seller: sellerName ? { '@type': 'Person', name: sellerName } : undefined,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
