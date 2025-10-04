const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
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
    const type = url.searchParams.get('type');
    const placeId = url.searchParams.get('place_id');
    const address = url.searchParams.get('address');

    console.log('Request params:', { input, type, placeId, address });

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
      apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=geometry&key=${GOOGLE_MAPS_API_KEY}`;
      console.log('Fetching place details for:', placeId);
    } else if (type === 'nominatim-geocode' && address) {
      apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=ar,mx,cl,co,pe`;
      isNominatimRequest = true;
      console.log('Using Nominatim geocoding for:', address);
    } else {
      apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input || '')}&key=${GOOGLE_MAPS_API_KEY}&language=es&types=geocode`;
      console.log('Searching places for:', input);
    }

    const headers: Record<string, string> = {};
    if (isNominatimRequest) {
      headers['User-Agent'] = 'LogisticsApp/1.0 (contact@example.com)';
    }

    console.log('Making request to:', apiUrl.replace(GOOGLE_MAPS_API_KEY, 'API_KEY'));
    const response = await fetch(apiUrl, { headers });
    
    if (!response.ok) {
      console.error(`API request failed: ${response.status} ${response.statusText}`);
      
      if (!isNominatimRequest) {
        const errorText = await response.text();
        console.error('Google Maps API error response:', errorText);
        
        return new Response(
          JSON.stringify({ 
            error: 'Google Maps API error',
            status: response.status,
            message: response.status === 403 ? 'API key invalid or quota exceeded' :
                    response.status === 503 ? 'Service temporarily unavailable' :
                    `HTTP ${response.status}: ${response.statusText}`,
            fallback_available: true,
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
      
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Google Maps API response status:', data.status);
    console.log('Predictions count:', data.predictions?.length || 0);

    if (!isNominatimRequest && data.status && data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Maps API returned error status:', data.status, data.error_message);
      
      return new Response(
        JSON.stringify({ 
          error: 'Google Maps API error',
          status: data.status,
          message: data.error_message || `API returned status: ${data.status}`,
          fallback_available: true,
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

    if (data.status === 'ZERO_RESULTS') {
      return new Response(
        JSON.stringify({ 
          status: 'ZERO_RESULTS',
          predictions: []
        }),
        {
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
        fallback_available: true,
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
