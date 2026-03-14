import { useState, useRef, useEffect } from 'react';
import { Search, Loader2, Music, X } from 'lucide-react';
import { Input } from '@netmd-studio/ui';
import type { AlbumMetadata } from '@netmd-studio/types';
import { useMetadataSearch, type SearchResult } from '../hooks/useMetadataSearch';

interface MetadataSearchProps {
  onSelect: (metadata: AlbumMetadata) => void;
}

export function MetadataSearch({ onSelect }: MetadataSearchProps) {
  const { results, loading, error, search, fetchAlbumDetails, setResults } = useMetadataSearch();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      search(query);
      setIsOpen(true);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search, setResults]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = async (result: SearchResult) => {
    setFetchingDetails(true);
    setIsOpen(false);
    const metadata = await fetchAlbumDetails(result);
    setFetchingDetails(false);
    if (metadata) {
      onSelect(metadata);
      setQuery(`${metadata.artistName} — ${metadata.albumTitle}`);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Input
            placeholder="Search album or artist..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
          {query && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-tertiary)' }}
              onClick={() => {
                setQuery('');
                setResults([]);
                setIsOpen(false);
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        {(loading || fetchingDetails) && (
          <Loader2 size={16} className="animate-spin" style={{ color: 'var(--accent)' }} />
        )}
      </div>

      {error && <p className="text-tag mt-1" style={{ color: 'var(--error)' }}>{error}</p>}

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 rounded-lg max-h-80 overflow-y-auto" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
          {results.map((result) => (
            <button
              key={result.id}
              className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors"
              style={{ background: 'transparent' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              onClick={() => handleSelect(result)}
            >
              {result.thumbnailUrl ? (
                <img
                  src={result.thumbnailUrl}
                  alt=""
                  className="w-8 h-8 object-cover rounded-sm flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0" style={{ background: 'var(--surface-3)' }}>
                  <Music size={14} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-nav truncate" style={{ color: 'var(--text-primary)' }}>{result.title}</p>
                <p className="text-tag truncate" style={{ color: 'var(--text-secondary)' }}>
                  {result.artist}
                  {result.year && ` (${result.year})`}
                  <span className="ml-1" style={{ color: 'var(--text-tertiary)' }}>
                    via {result.source === 'musicbrainz' ? 'MusicBrainz' : 'Discogs'}
                  </span>
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && !loading && results.length === 0 && query.trim() && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 rounded-lg p-3" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
          <p className="text-label text-center" style={{ color: 'var(--text-secondary)' }}>No results found</p>
        </div>
      )}
    </div>
  );
}
