interface Coordinates {
  lat: number;
  lng: number;
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw';

export const calculateDistanceWithGoogleMaps = async (
  origin: Coordinates,
  destination: Coordinates,
  waypoints?: Coordinates[]
): Promise<number> => {
  try {
    let totalDistance = 0;

    if (waypoints && waypoints.length > 0) {
      const allPoints = [origin, ...waypoints, destination];

      for (let i = 0; i < allPoints.length - 1; i++) {
        const segmentDistance = await getSingleSegmentDistance(
          allPoints[i],
          allPoints[i + 1]
        );
        totalDistance += segmentDistance;
      }
    } else {
      totalDistance = await getSingleSegmentDistance(origin, destination);
    }

    return Math.round(totalDistance);
  } catch (error) {
    console.error('Error calculating distance with Google Maps:', error);
    throw error;
  }
};

const getSingleSegmentDistance = async (
  origin: Coordinates,
  destination: Coordinates
): Promise<number> => {
  const originStr = `${origin.lat},${origin.lng}`;
  const destinationStr = `${destination.lat},${destination.lng}`;

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originStr}&destinations=${destinationStr}&key=${GOOGLE_MAPS_API_KEY}&mode=driving`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (data.status !== 'OK') {
    throw new Error(`Google Maps API error: ${data.status}`);
  }

  if (data.rows && data.rows[0] && data.rows[0].elements && data.rows[0].elements[0]) {
    const element = data.rows[0].elements[0];

    if (element.status === 'OK' && element.distance) {
      return element.distance.value / 1000;
    }
  }

  throw new Error('No distance data found in response');
};
