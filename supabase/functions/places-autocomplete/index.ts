const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const GOOGLE_MAPS_API_KEY = Deno.env.get('VITE_GOOGLE_MAPS_API_KEY') || 'AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw';

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
    const type = url.searchParams.get('type'); // 'autocomplete', 'details', or 'nominatim-geocode'
    const placeId = url.searchParams.get('place_id');
    const address = url.searchParams.get('address');

    if (!input && !placeId && !address) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let apiUrl: string;
    let isNominatimRequest = false;
    
    if (type === 'details' && placeId) {
      // Place Details API
      apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=geometry&key=${GOOGLE_MAPS_API_KEY}`;
    } else if (type === 'nominatim-geocode' && address) {
      // Nominatim Geocoding API (fallback)
      apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=ar,mx,cl,co,pe`;
      isNominatimRequest = true;
    } else {
      // Autocomplete API - removed restrictive country filter
      apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input || '')}&key=${GOOGLE_MAPS_API_KEY}&language=es&types=geocode`;
    }

    console.log(`Making API request to: ${isNominatimRequest ? 'Nominatim' : 'Google Maps'}`);

    const headers: Record<string, string> = {};
    if (isNominatimRequest) {
      // Add User-Agent for Nominatim requests as required by their usage policy
      headers['User-Agent'] = 'LogisticsApp/1.0 (contact@example.com)';
    }

    const response = await fetch(apiUrl, { headers });
    
    if (!response.ok) {
      console.error(`API request failed: ${response.status} ${response.statusText}`);
      
      // For Google Maps API errors, try to provide more specific error information
      if (!isNominatimRequest) {
        const errorText = await response.text();
        console.error('Google Maps API error response:', errorText);
        
        // Return a structured error response that the frontend can handle
        return new Response(
          JSON.stringify({ 
            error: 'Google Maps API error',
            status: response.status,
            message: response.status === 403 ? 'API key invalid or quota exceeded' :
                    response.status === 503 ? 'Service temporarily unavailable' :
                    `HTTP ${response.status}: ${response.statusText}`,
            fallback_available: true
          }),
          {
            status: 200, // Return 200 so frontend can handle the error gracefully
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }
      
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // For Google Maps API, check if the response indicates an error
    if (!isNominatimRequest && data.status && data.status !== 'OK') {
      console.error('Google Maps API returned error status:', data.status, data.error_message);
      
      return new Response(
        JSON.stringify({ 
          error: 'Google Maps API error',
          status: data.status,
          message: data.error_message || 'Unknown API error',
          fallback_available: true
        }),
        {
          status: 200, // Return 200 so frontend can handle the error gracefully
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify(data),
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
        fallback_available: true
      }),
      {
        status: 200, // Return 200 so frontend can handle the error gracefully
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});