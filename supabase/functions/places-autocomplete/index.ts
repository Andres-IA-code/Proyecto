const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GOOGLE_MAPS_API_KEY = Deno.env.get('VITE_GOOGLE_MAPS_API_KEY');

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    const url = new URL(req.url);
    const input = url.searchParams.get('input');
    const type = url.searchParams.get('type');
    const placeId = url.searchParams.get('place_id');

    console.log('Request params:', { input, type, placeId });

    // Use Nominatim (OpenStreetMap) as primary service - no API key required
    if (type === 'details' && placeId) {
      // For Nominatim, placeId is actually a place_id from Nominatim
      const detailsUrl = `https://nominatim.openstreetmap.org/lookup?osm_ids=${encodeURIComponent(placeId)}&format=json`;
      console.log('Fetching place details from Nominatim');

      const response = await fetch(detailsUrl, {
        headers: {
          'User-Agent': 'LogisticsApp/1.0',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get place details: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.length > 0) {
        const place = data[0];
        const transformedData = {
          result: {
            geometry: {
              location: {
                lat: parseFloat(place.lat),
                lng: parseFloat(place.lon)
              }
            }
          }
        };

        return new Response(
          JSON.stringify(transformedData),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    // Autocomplete using Nominatim
    if (!input || input.length < 3) {
      return new Response(
        JSON.stringify({ 
          status: 'OK',
          predictions: [] 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Searching places with Nominatim for:', input);
    
    // Nominatim search - focus on Latin America
    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&limit=10&addressdetails=1&countrycodes=ar,mx,cl,co,pe,uy,py,bo,ec,ve`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'LogisticsApp/1.0',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Nominatim API error:', errorText);
      
      return new Response(
        JSON.stringify({ 
          error: 'Search service error',
          status: response.status,
          predictions: []
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const data = await response.json();
    console.log('Nominatim response count:', data.length);

    // Transform Nominatim response to match Google Places API format
    const predictions = data.map((place: any) => {
      const mainText = place.address?.city || place.address?.town || place.address?.village || place.name;
      const secondaryParts = [];
      
      if (place.address?.state) secondaryParts.push(place.address.state);
      if (place.address?.country) secondaryParts.push(place.address.country);
      
      return {
        place_id: place.osm_type.charAt(0).toUpperCase() + place.osm_id,
        description: place.display_name,
        structured_formatting: {
          main_text: mainText || place.display_name.split(',')[0],
          secondary_text: secondaryParts.join(', ') || place.display_name.split(',').slice(1).join(',').trim()
        },
        geometry: {
          location: {
            lat: parseFloat(place.lat),
            lng: parseFloat(place.lon)
          }
        }
      };
    });

    console.log('Transformed predictions count:', predictions.length);

    return new Response(
      JSON.stringify({
        status: predictions.length > 0 ? 'OK' : 'ZERO_RESULTS',
        predictions: predictions
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error in places-autocomplete function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        predictions: []
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
