import { useState } from "react";
import PropTypes from "prop-types";
import { Map, Marker } from "pigeon-maps";

const LocationPicker = ({ onLocationSelect }) => {
  const [position, setPosition] = useState([106.8456, -6.2088]); // [longitude, latitude]

  const handleMapClick = ({ latLng }) => {
    const [lat, lng] = latLng;
    const coordinates = [lng, lat]; // Convert to [longitude, latitude] format
    setPosition(coordinates);
    onLocationSelect(coordinates);
  };

  return (
    <div className="h-64 w-full overflow-hidden rounded-lg border border-gray-300">
      <Map
        defaultCenter={[-6.2088, 106.8456]} // Note: Map uses [latitude, longitude]
        defaultZoom={11}
        onClick={handleMapClick}
      >
        <Marker
          width={50}
          color="#ff0000"
          anchor={[position[1], position[0]]} // Convert back to [latitude, longitude] for marker
        />
      </Map>
    </div>
  );
};
LocationPicker.propTypes = {
  onLocationSelect: PropTypes.func.isRequired,
};

export default LocationPicker;
