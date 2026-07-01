import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, MapPin, Search, X } from 'lucide-react';

const DEFAULT_COUNTRY_CENTERS = {
  India: [20.5937, 78.9629],
  'United States': [39.8283, -98.5795],
  Canada: [56.1304, -106.3468],
  'United Kingdom': [55.3781, -3.4360],
  Australia: [-25.2744, 133.7751],
  Germany: [51.1657, 10.4515],
  France: [46.2276, 2.2137],
  Japan: [36.2048, 138.2529],
  Brazil: [-14.2350, -51.9253],
  Mexico: [23.6345, -102.5528],
  'South Africa': [-30.5595, 22.9375],
  'New Zealand': [-40.9006, 174.8860],
  Singapore: [1.3521, 103.8198],
  Spain: [40.4637, -3.7492],
  Italy: [41.8719, 12.5674],
  Netherlands: [52.1326, 5.2913],
};

const getDefaultCenter = (country) => {
  return DEFAULT_COUNTRY_CENTERS[country] || [20, 0];
};

const MapAddressPickerModal = ({ isOpen, onClose, onConfirm, initialCountry, initialAddress }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const searchCacheRef = useRef(new Map());

  const [isMapReady, setIsMapReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [statusMessage, setStatusMessage] = useState('Drag the marker or click the map to choose the delivery location.');
  const [selectedAddress, setSelectedAddress] = useState({
    street: initialAddress?.addressLine || '',
    city: initialAddress?.city || '',
    state: initialAddress?.state || '',
    country: initialAddress?.country || initialCountry || 'United States',
    postalCode: initialAddress?.postalCode || '',
    latitude: initialAddress?.latitude ?? null,
    longitude: initialAddress?.longitude ?? null,
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const initialCenter = useMemo(() => getDefaultCenter(initialAddress?.country || initialCountry || 'United States'), [initialAddress?.country, initialCountry]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const ensureLeaflet = () => new Promise((resolve, reject) => {
      if (window.L) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.id = 'leaflet-css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.id = 'leaflet-script';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Leaflet failed to load'));
      document.body.appendChild(script);
    });

    let cancelled = false;

    const initializeMap = async () => {
      try {
        await ensureLeaflet();
        if (cancelled || !mapContainerRef.current) return;

        const map = window.L.map(mapContainerRef.current, {
          zoomControl: true,
          scrollWheelZoom: true,
          attributionControl: false,
        }).setView(initialCenter, 12);

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        const marker = window.L.marker(initialCenter, { draggable: true }).addTo(map);
        markerRef.current = marker;
        mapRef.current = map;
        setIsMapReady(true);

        const updateFromMarker = (latlng) => {
          const lat = latlng.lat;
          const lng = latlng.lng;
          setSelectedAddress(prev => ({ ...prev, latitude: lat, longitude: lng }));
          setStatusMessage('Location selected. Fetching the address details…');
          void reverseGeocode(lat, lng);
        };

        map.on('click', (event) => {
          marker.setLatLng(event.latlng);
          updateFromMarker(event.latlng);
        });

        marker.on('dragend', () => {
          updateFromMarker(marker.getLatLng());
        });

        if (navigator.geolocation) {
          setIsLoadingLocation(true);
          navigator.geolocation.getCurrentPosition(
            (position) => {
              if (cancelled) return;
              const { latitude, longitude, accuracy } = position.coords;
              map.setView([latitude, longitude], accuracy > 1000 ? 13 : 15);
              marker.setLatLng([latitude, longitude]);
              setSelectedAddress(prev => ({ ...prev, latitude, longitude }));
              setStatusMessage(`Using your current location${accuracy ? ` (accuracy: ±${Math.round(accuracy)}m)` : ''}.`);
              void reverseGeocode(latitude, longitude);
              setIsLoadingLocation(false);
            },
            (error) => {
              if (cancelled) return;
              const messageMap = {
                1: 'Location access was denied. The map opened at the default view instead.',
                2: 'Your location could not be determined right now. The map opened at the default view instead.',
                3: 'Location lookup timed out. The map opened at the default view instead.',
              };
              setStatusMessage(messageMap[error.code] || 'Location detection was unavailable. The map opened at the default view instead.');
              setIsLoadingLocation(false);
            },
            {
              enableHighAccuracy: true,
              maximumAge: 10000,
              timeout: 15000,
            }
          );
        } else {
          setStatusMessage('Geolocation is not supported in this browser. The map opened at the default view instead.');
          setIsLoadingLocation(false);
        }

        if (initialAddress?.latitude && initialAddress?.longitude) {
          marker.setLatLng([initialAddress.latitude, initialAddress.longitude]);
          map.setView([initialAddress.latitude, initialAddress.longitude], 14);
          void reverseGeocode(initialAddress.latitude, initialAddress.longitude);
        }
      } catch (error) {
        if (!cancelled) {
          setSearchError(error.message || 'The map could not be loaded.');
        }
      }
    };

    initializeMap();

    return () => {
      cancelled = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
    };
  }, [isOpen, initialAddress?.latitude, initialAddress?.longitude, initialCenter]);

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: { 'Accept-Language': 'en' },
      });
      if (!response.ok) throw new Error('Reverse geocoding failed');
      const data = await response.json();
      const address = data.address || {};
      const street = [address.house_number, address.road].filter(Boolean).join(' ');
      const city = address.city || address.town || address.village || address.suburb || '';
      const state = address.state || address.region || '';
      const country = address.country || '';
      const postalCode = address.postcode || '';
      setSelectedAddress({
        street,
        city,
        state,
        country,
        postalCode,
        latitude: lat,
        longitude: lng,
      });
      setStatusMessage('Address details filled from the selected location.');
    } catch (error) {
      setStatusMessage('The address could not be resolved automatically. You can edit it manually.');
    }
  };

  const searchPhoton = async (query) => {
    const cleaned = query.trim();
    if (cleaned.length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (searchCacheRef.current.has(cleaned.toLowerCase())) {
      setSearchResults(searchCacheRef.current.get(cleaned.toLowerCase()));
      setIsSearching(false);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setIsSearching(true);
    setSearchError('');

    try {
      const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(cleaned)}&limit=5`, { signal: abortRef.current.signal });
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      const results = (data.features || []).map((feature) => {
        const props = feature.properties || {};
        const [lng, lat] = feature.geometry?.coordinates || [];
        return {
          id: `${props.osm_id || Math.random()}-${props.street || props.name || cleaned}`,
          label: [props.name, props.street, props.city || props.town || props.village].filter(Boolean).join(', '),
          street: [props.housenumber, props.street].filter(Boolean).join(' '),
          city: props.city || props.town || props.village || '',
          state: props.state || '',
          country: props.country || '',
          postalCode: props.postcode || '',
          lat,
          lng,
        };
      });
      searchCacheRef.current.set(cleaned.toLowerCase(), results);
      setSearchResults(results);
    } catch (error) {
      if (error.name === 'AbortError') return;
      setSearchError('We could not search places right now.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchError('');
      return undefined;
    }

    debounceRef.current = setTimeout(() => {
      void searchPhoton(searchQuery);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [isOpen, searchQuery]);

  const handleSuggestionSelect = (place) => {
    if (!place.lat || !place.lng) return;
    const latlng = { lat: place.lat, lng: place.lng };
    mapRef.current?.setView([latlng.lat, latlng.lng], 16);
    markerRef.current?.setLatLng([latlng.lat, latlng.lng]);
    setSelectedAddress(prev => ({
      ...prev,
      street: place.street || prev.street,
      city: place.city || prev.city,
      state: place.state || prev.state,
      country: place.country || prev.country,
      postalCode: place.postalCode || prev.postalCode,
      latitude: latlng.lat,
      longitude: latlng.lng,
    }));
    setSearchResults([]);
    setSearchQuery('');
    setStatusMessage('Address selected from search.');
    void reverseGeocode(latlng.lat, latlng.lng);
  };

  const handleConfirm = () => {
    onConfirm({
      street: selectedAddress.street,
      city: selectedAddress.city,
      state: selectedAddress.state,
      country: selectedAddress.country,
      postalCode: selectedAddress.postalCode,
      latitude: selectedAddress.latitude,
      longitude: selectedAddress.longitude,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Select address on map"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10, 22, 18, 0.68)',
        backdropFilter: 'blur(8px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '900px', background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 24px 70px rgba(0,0,0,0.22)' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #ece8de', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--green-900)' }}>Select on Map</h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>Search for a place or click directly on the map to choose your delivery address.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close map picker" style={{ border: 'none', background: '#f4f2eb', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '16px 20px 20px' }}>
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search for a place or address"
              aria-label="Search address"
              style={{ width: '100%', height: '44px', padding: '0 14px 0 40px', borderRadius: '12px', border: '1px solid #e4e1d8', fontSize: '14px', boxSizing: 'border-box' }}
            />
            {isSearching && (
              <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
                <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
                Loading...
              </div>
            )}
          </div>

          {searchError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: '#b91c1c', fontSize: '12px' }}>
              <AlertCircle size={14} />
              {searchError}
            </div>
          )}

          {searchResults.length > 0 && (
            <div style={{ background: '#fcfbf7', border: '1px solid #ece8de', borderRadius: '14px', padding: '6px', marginBottom: '12px' }}>
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => handleSuggestionSelect(result)}
                  style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', padding: '10px 8px', borderRadius: '10px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'flex-start' }}
                >
                  <MapPin size={15} style={{ marginTop: '2px', color: 'var(--green-700)' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>{result.street || result.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{[result.city, result.state, result.country].filter(Boolean).join(', ')}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div ref={mapContainerRef} style={{ width: '100%', height: '320px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e4e1d8', background: '#f4f2eb' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              {isLoadingLocation ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
                  Detecting your location…
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{statusMessage}</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={onClose} style={{ border: '1px solid #e4e1d8', background: 'white', color: 'var(--text-dark)', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>
                Cancel
              </button>
              <button type="button" onClick={handleConfirm} style={{ border: 'none', background: 'var(--green-700)', color: 'white', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} />
                Confirm Location
              </button>
            </div>
          </div>

          <div style={{ marginTop: '12px', border: '1px solid #ece8de', borderRadius: '14px', padding: '12px', background: '#fcfbf7' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--green-900)', marginBottom: '4px' }}>Selected address</div>
            <div style={{ fontSize: '13px', color: 'var(--text-dark)' }}>
              {selectedAddress.street || 'No street selected yet'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {[selectedAddress.city, selectedAddress.state, selectedAddress.country, selectedAddress.postalCode].filter(Boolean).join(', ')}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default MapAddressPickerModal;
