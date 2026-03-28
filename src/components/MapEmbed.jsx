import React, { useMemo } from 'react';

/**
 * Renders an accessible Google Maps iframe embed
 * @param {Object} props
 * @param {string} props.location - The location to display
 */
const MapEmbed = ({ location }) => {
  // Memoize the map source URL based solely on the location string to avoid redundant iframes
  const mapSrc = useMemo(() => {
    const query = location && location !== 'Unknown Location' 
      ? encodeURIComponent(`${location}`) 
      : encodeURIComponent('New York City, NY'); // Hardcoded fallback

    return `https://maps.google.com/maps?q=${query}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  }, [location]);

  return (
    <div className="card map-container">
      <h2>Suggested Location Area</h2>
      <iframe 
        title={`Google Maps embed for ${location}`}
        src={mapSrc}
        allowFullScreen 
        loading="lazy"
        aria-label="Map showing the detected or fallback incident location"
      />
    </div>
  );
};

export default React.memo(MapEmbed);
