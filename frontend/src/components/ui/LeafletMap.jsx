import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Button from "./Button";
import Icon from "./Icon";

// Helper to parse address text and coordinates
export const parseAddressCoords = (addressValue) => {
  if (!addressValue) {
    return { text: "", lat: -17.7833, lng: -63.1821, hasCoords: false };
  }
  const parts = addressValue.split(" ::: ");
  if (parts.length < 2) {
    return { text: addressValue, lat: -17.7833, lng: -63.1821, hasCoords: false };
  }
  const [latStr, lngStr] = parts[1].split(",");
  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);
  const isValid = !isNaN(lat) && !isNaN(lng);
  return {
    text: parts[0],
    lat: isValid ? lat : -17.7833,
    lng: isValid ? lng : -63.1821,
    hasCoords: isValid
  };
};

// Helper to combine address and coordinates
export const combineAddressCoords = (text, lat, lng) => {
  const cleanText = (text || "").replace(" ::: ", " ").trim();
  return `${cleanText} ::: ${lat.toFixed(6)},${lng.toFixed(6)}`;
};

// Sub-component to sync map view and listen for map clicks
function MapEventsHandler({ readOnly, onChange, addressText, setLat, setLng, lat, lng }) {
  const map = useMap();

  // Handle map click
  useMapEvents({
    click(e) {
      if (readOnly || !onChange) return;
      const { lat: newLat, lng: newLng } = e.latlng;
      setLat(newLat);
      setLng(newLng);
      onChange(combineAddressCoords(addressText, newLat, newLng));
    }
  });

  // Keep map view in sync when coordinates change (e.g. via GPS or props)
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);

  return null;
}

export default function LeafletMap({
  value,
  onChange,
  readOnly = false,
  label = "Ubicación en el mapa",
  helperText = "Haz clic en el mapa o arrastra el marcador para fijar la ubicación exacta",
  tone = "dark"
}) {
  const [geoError, setGeoError] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const parsed = parseAddressCoords(value);
  const [addressText, setAddressText] = useState(parsed.text);
  const [lat, setLat] = useState(parsed.lat);
  const [lng, setLng] = useState(parsed.lng);
  const isLightTone = tone === "light";
  const labelClass = isLightTone ? "text-slate-600" : "text-[#a1a1aa]";
  const helperClass = isLightTone ? "text-slate-500" : "text-white/40";
  const fieldLabelClass = isLightTone ? "text-slate-500" : "text-white/50";
  const inputClass = isLightTone
    ? "w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none p-3 text-sm focus:outline-none focus:border-[#c8960c] placeholder-slate-400"
    : "w-full bg-[#040912] border border-white/10 text-white rounded-none p-3 text-sm focus:outline-none focus:border-[#f5d367] placeholder-white/20";
  const mapBorderClass = isLightTone ? "border-slate-200" : "border-white/10";

  // Sync internal state when prop value changes from outside
  useEffect(() => {
    const nextParsed = parseAddressCoords(value);
    setAddressText(nextParsed.text);
    setLat(nextParsed.lat);
    setLng(nextParsed.lng);
  }, [value]);

  // Configure Leaflet marker icon
  useEffect(() => {
    const DefaultIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = DefaultIcon;
  }, []);

  // Handle geolocation to locate current position
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGeoError("La geolocalización no está soportada por tu navegador.");
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLat = position.coords.latitude;
        const currentLng = position.coords.longitude;
        setLat(currentLat);
        setLng(currentLng);
        setGeoLoading(false);
        if (onChange) {
          onChange(combineAddressCoords(addressText, currentLat, currentLng));
        }
      },
      (err) => {
        console.error("Error detecting geolocation:", err);
        setGeoError("No se pudo obtener tu ubicación actual. Asegúrate de dar permisos de GPS.");
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Update address text input
  const handleTextChange = (e) => {
    const text = e.target.value;
    setAddressText(text);
    if (onChange) {
      const currentParsed = parseAddressCoords(value);
      onChange(currentParsed.hasCoords ? combineAddressCoords(text, lat, lng) : text);
    }
  };

  // Event handler for dragging the marker
  const markerEventHandlers = useMemo(
    () => ({
      dragend(e) {
        if (readOnly || !onChange) return;
        const marker = e.target;
        if (marker) {
          const pos = marker.getLatLng();
          setLat(pos.lat);
          setLng(pos.lng);
          onChange(combineAddressCoords(addressText, pos.lat, pos.lng));
        }
      }
    }),
    [readOnly, onChange, addressText]
  );

  return (
    <div className="space-y-3 w-full">
      {/* Label and locator button */}
      {!readOnly && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className={`block text-xs font-semibold uppercase tracking-[0.22em] ${labelClass}`}>
              {label}
            </span>
            {helperText && (
              <span className={`text-[0.7rem] block mt-0.5 ${helperClass}`}>
                {helperText}
              </span>
            )}
          </div>
          <Button
            type="button"
            onClick={handleLocateMe}
            disabled={geoLoading}
            className="rounded-none bg-[#f5d367]/10 border border-[#f5d367]/20 text-[#f5d367] hover:bg-[#f5d367]/20 text-xs py-2 px-3 font-semibold flex items-center justify-center gap-1.5 shrink-0"
          >
            <Icon name="pin" className="h-3.5 w-3.5" />
            <span>{geoLoading ? "Obteniendo GPS..." : "Mi Ubicación Actual"}</span>
          </Button>
        </div>
      )}

      {/* Geolocation error display */}
      {geoError && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-none">
          ⚠️ {geoError}
        </p>
      )}

      {/* Address text input for edit mode */}
      {!readOnly && (
        <div className="space-y-1">
          <label className={`block text-xs font-medium ${fieldLabelClass}`}>Dirección física descriptiva</label>
          <input
            type="text"
            value={addressText}
            onChange={handleTextChange}
            placeholder="Ej. Av. Beni #1840, Equipetrol"
            className={inputClass}
          />
        </div>
      )}

      {/* React Leaflet Map Container */}
      <div 
        className={`w-full h-64 border rounded-none overflow-hidden relative shadow-inner ${mapBorderClass}`} 
        style={{ minHeight: "260px", zIndex: 1 }}
      >
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          scrollWheelZoom={!readOnly}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={[lat, lng]}
            draggable={!readOnly}
            eventHandlers={markerEventHandlers}
          />
          <MapEventsHandler
            readOnly={readOnly}
            onChange={onChange}
            addressText={addressText}
            setLat={setLat}
            setLng={setLng}
            lat={lat}
            lng={lng}
          />
        </MapContainer>
      </div>
    </div>
  );
}
