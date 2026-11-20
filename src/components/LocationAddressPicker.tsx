import React, { useState } from 'react';
import { Check, Loader2, LocateFixed, MapPin } from 'lucide-react';

interface LocationAddressPickerProps {
  address: string;
  locationPin: string;
  onChangeAddress: (value: string) => void;
  onChangeLocationPin: (value: string) => void;
}

const QUICK_LOCATIONS = [
  {
    label: 'Mylapore',
    address: '18, Luz Church Road, Mylapore, Chennai - 600004',
    pin: '13.0339° N, 80.2676° E · Mylapore',
  },
  {
    label: 'T. Nagar',
    address: '45, Usman Road, Near Panagal Park, T. Nagar, Chennai - 600017',
    pin: '13.0418° N, 80.2341° E · T. Nagar',
  },
  {
    label: 'Adyar',
    address: '12, Gandhi Nagar 1st Main Rd, Adyar, Chennai - 600020',
    pin: '13.0012° N, 80.2565° E · Adyar',
  },
];

export const LocationAddressPicker: React.FC<LocationAddressPickerProps> = ({
  address,
  locationPin,
  onChangeAddress,
  onChangeLocationPin,
}) => {
  const [isLocating, setIsLocating] = useState(false);

  const handleDetectLocation = () => {
    setIsLocating(true);

    const applyFallbackPin = () => {
      const preset = QUICK_LOCATIONS[0];
      onChangeLocationPin(preset.pin);
      if (!address.trim()) {
        onChangeAddress(preset.address);
      }
      setIsLocating(false);
    };

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(4);
          const lng = pos.coords.longitude.toFixed(4);
          const formattedPin = `${lat}° N, ${lng}° E · Current GPS Location`;
          onChangeLocationPin(formattedPin);
          if (!address.trim()) {
            onChangeAddress(`Pinned GPS Location (${lat}, ${lng}), Chennai`);
          }
          setIsLocating(false);
        },
        () => {
          setTimeout(applyFallbackPin, 350);
        },
        { timeout: 3500 }
      );
    } else {
      setTimeout(applyFallbackPin, 350);
    }
  };

  return (
    <div className="rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5C1422]">
          <MapPin className="w-3.5 h-3.5 text-[#EA580C]" />
          <span>Takeaway Address &amp; Location Pin</span>
        </div>

        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={isLocating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5C1422] hover:bg-[#EA580C] disabled:opacity-70 text-white text-[11px] font-semibold transition-colors whitespace-nowrap"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Locating...</span>
            </>
          ) : (
            <>
              <LocateFixed className="w-3 h-3" />
              <span>Use Current Location</span>
            </>
          )}
        </button>
      </div>

      {/* Quick Neighborhood Location Presets */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-[#6E5C60] mr-1">Quick Pin:</span>
        {QUICK_LOCATIONS.map((loc) => {
          const isSelected = locationPin === loc.pin;
          return (
            <button
              key={loc.label}
              type="button"
              onClick={() => {
                onChangeAddress(loc.address);
                onChangeLocationPin(loc.pin);
              }}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                isSelected
                  ? 'bg-[#FFF7ED] border-[#EA580C] text-[#C2410C] font-semibold'
                  : 'bg-white border-[#E6DDD0] text-[#5A494C] hover:border-[#5C1422]'
              }`}
            >
              {isSelected && <Check className="w-3 h-3" />}
              <span>{loc.label}</span>
            </button>
          );
        })}
      </div>

      {/* Full Address Textarea */}
      <div>
        <label className="block text-[11px] font-semibold text-[#5A494C] mb-1">
          Delivery / Takeaway Address
        </label>
        <textarea
          rows={2}
          value={address}
          onChange={(e) => onChangeAddress(e.target.value)}
          placeholder="Door / Flat No., Street Name, Area, Landmark & Pincode..."
          className="w-full px-3 py-2 rounded-xl bg-white border border-[#E6DDD0] text-xs text-[#1F1618] placeholder:text-[#9E8B8F] focus:outline-none focus:border-[#5C1422]"
        />
      </div>

      {/* Location Pin / Landmark Input */}
      <div>
        <label className="block text-[11px] font-semibold text-[#5A494C] mb-1">
          Pinned Location / Area Coordinates
        </label>
        <div className="relative">
          <MapPin className="w-3.5 h-3.5 text-[#EA580C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={locationPin}
            onChange={(e) => onChangeLocationPin(e.target.value)}
            placeholder="e.g., 13.0339° N, 80.2676° E · Mylapore or Google Maps link"
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-[#E6DDD0] text-xs font-mono text-[#1F1618] placeholder:font-sans placeholder:text-[#9E8B8F] focus:outline-none focus:border-[#5C1422]"
          />
        </div>
      </div>
    </div>
  );
};
