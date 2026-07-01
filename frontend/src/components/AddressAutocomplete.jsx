import { useState, useEffect, useRef, useCallback, forwardRef } from 'react';
import { MapPin, Loader2, Search, AlertCircle } from 'lucide-react';

// ─── Simple in-memory cache to avoid duplicate API calls ─────────────────────
const searchCache = new Map();

const PHOTON_API = 'https://photon.komoot.io/api/';

/**
 * Formats a Photon feature into a human-readable label and structured address fields.
 */
const formatFeature = (feature) => {
  const p = feature.properties || {};
  const parts = [];
  const street = [p.housenumber, p.street].filter(Boolean).join(' ');
  if (street) parts.push(street);
  if (p.city || p.town || p.village) parts.push(p.city || p.town || p.village);
  if (p.state) parts.push(p.state);
  if (p.country) parts.push(p.country);

  return {
    label: parts.join(', '),
    street: street || p.name || '',
    city: p.city || p.town || p.village || p.county || '',
    state: p.state || '',
    country: p.country || '',
    postalCode: p.postcode || '',
  };
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AddressAutocomplete
 * Props:
 *   value        – current input value (controlled)
 *   onChange     – called with { name: 'addressLine', value: string } on every keystroke
 *   onSelect     – called with { street, city, state, country, postalCode } when user picks a suggestion
 *   error        – optional validation error string
 *   autofillFlash – boolean; flash the field briefly when autofilled externally
 */
const AddressAutocomplete = forwardRef(({ value, onChange, onSelect, error, autofillFlash }, ref) => {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [flashing, setFlashing] = useState(false);

  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const localInputRef = useRef(null);
  const inputRef = ref || localInputRef;

  // Sync external value changes (e.g. autofill clears or sets the field)
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Flash animation when autofilled from outside
  useEffect(() => {
    if (autofillFlash) {
      setFlashing(true);
      const t = setTimeout(() => setFlashing(false), 1200);
      return () => clearTimeout(t);
    }
  }, [autofillFlash]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = useCallback(async (q) => {
    if (q.trim().length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Check cache first
    if (searchCache.has(q)) {
      setSuggestions(searchCache.get(q));
      setIsOpen(true);
      return;
    }

    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setFetchError('');

    try {
      const url = `${PHOTON_API}?q=${encodeURIComponent(q)}&limit=5`;
      const res = await fetch(url, { signal: abortRef.current.signal });
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      const features = (data.features || []).map(formatFeature).filter(f => f.label);
      searchCache.set(q, features);
      setSuggestions(features);
      setIsOpen(features.length > 0);
      if (features.length === 0) setIsOpen(true); // show "no results" message
    } catch (err) {
      if (err.name === 'AbortError') return;
      setFetchError('Could not load suggestions. Please type your address manually.');
      setIsOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange({ name: 'addressLine', value: val });
    setActiveIndex(-1);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSelect = (suggestion) => {
    setQuery(suggestion.street || suggestion.label);
    onChange({ name: 'addressLine', value: suggestion.street || suggestion.label });
    onSelect(suggestion);
    setIsOpen(false);
    setActiveIndex(-1);
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          handleSelect(suggestions[activeIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex];
      if (item) item.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const hasError = !!error;
  const showNoResults = isOpen && !loading && !fetchError && suggestions.length === 0 && query.length >= 3;

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', gridColumn: 'span 2' }}
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-owns="address-suggestions-list"
    >
      <div style={{ position: 'relative' }}>
        {/* Search icon */}
        <div
          style={{
            position: 'absolute',
            left: '13px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          {loading
            ? <Loader2 size={16} color="var(--green-500)" style={{ animation: 'spin 0.8s linear infinite' }} />
            : <Search size={16} color={hasError ? '#e53e3e' : 'var(--text-light)'} />
          }
        </div>

        <input
          ref={inputRef}
          id="address-autocomplete-input"
          type="text"
          name="addressLine"
          className="input"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder="House no., Street, Landmark"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="address-suggestions-list"
          aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
          required
          style={{
            paddingLeft: '40px',
            paddingRight: '16px',
            borderColor: hasError ? '#e53e3e' : flashing ? 'var(--green-500)' : undefined,
            boxShadow: flashing
              ? '0 0 0 3px rgba(72, 187, 120, 0.25)'
              : hasError
              ? '0 0 0 3px rgba(229, 62, 62, 0.15)'
              : undefined,
            background: flashing ? 'rgba(72, 187, 120, 0.04)' : undefined,
            transition: 'border-color 0.3s, box-shadow 0.4s, background 0.4s',
          }}
        />
      </div>

      {/* Inline validation error */}
      {hasError && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            marginTop: '5px',
            fontSize: '12px',
            color: '#c53030',
            fontWeight: 500,
          }}
        >
          <AlertCircle size={12} />
          {error}
        </div>
      )}

      {/* Suggestions dropdown */}
      {isOpen && (
        <ul
          id="address-suggestions-list"
          ref={listRef}
          role="listbox"
          aria-label="Address suggestions"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: 'var(--white)',
            border: '1px solid #E5E5E2',
            borderRadius: '14px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.12), 0 4px 10px rgba(0,0,0,0.06)',
            zIndex: 9999,
            maxHeight: '280px',
            overflowY: 'auto',
            listStyle: 'none',
            margin: 0,
            padding: '6px',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Loading state */}
          {loading && (
            <li style={{ padding: '14px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              <Loader2 size={16} style={{ display: 'inline', animation: 'spin 0.8s linear infinite', marginRight: '8px', verticalAlign: 'middle' }} />
              Searching for addresses…
            </li>
          )}

          {/* API error */}
          {fetchError && !loading && (
            <li style={{ padding: '14px 12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#c53030', fontSize: '13px' }}>
              <AlertCircle size={16} />
              {fetchError}
            </li>
          )}

          {/* No results */}
          {showNoResults && (
            <li style={{ padding: '14px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No addresses found. Please type your address manually.
            </li>
          )}

          {/* Suggestions */}
          {!loading && suggestions.map((s, i) => (
            <li
              key={i}
              id={`suggestion-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(s);
              }}
              onMouseEnter={() => setActiveIndex(i)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '10px',
                cursor: 'pointer',
                background: i === activeIndex ? 'var(--green-50)' : 'transparent',
                transition: 'background 0.15s',
                borderBottom: i < suggestions.length - 1 ? '1px solid #F5F4F0' : 'none',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: i === activeIndex ? 'var(--green-100)' : '#F5F4F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px',
                  transition: 'background 0.15s',
                }}
              >
                <MapPin size={13} color={i === activeIndex ? 'var(--green-700)' : 'var(--text-light)'} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-dark)', lineHeight: 1.3, marginBottom: '2px' }}>
                  {s.street || s.city || '—'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {[s.city, s.state, s.country].filter(Boolean).join(', ')}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Keyframe CSS for spinner */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
});

export default AddressAutocomplete;
