const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GOOGLE_MAPS_API_KEY = Deno.env.get('VITE_GOOGLE_MAPS_API_KEY') || 'AIzaSyCWVGYicwnsxGb9dl0A0yDufh4AYnwjsuA';

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
    console.log('Using Google Maps API Key:', GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing');

    // Place Details using new API
    if (type === 'details' && placeId) {
      const detailsUrl = `https://places.googleapis.com/v1/places/${placeId}`;
      console.log('Fetching place details (new API) for:', placeId);

      const response = await fetch(detailsUrl, {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': 'location'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Place details error:', errorText);
        throw new Error(`Failed to get place details: ${response.status}`);
      }

      const data = await response.json();
      console.log('Place details response:', data);

      // Transform to match old API format
      const transformedData = {
        result: {
          geometry: {
            location: {
              lat: data.location?.latitude || 0,
              lng: data.location?.longitude || 0
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

    // Autocomplete using new API
    if (!input) {
      return new Response(
        JSON.stringify({ error: 'Missing input parameter' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Searching places (new API) for:', input);
    
    // Using new Places API (New) Autocomplete
    const autocompleteUrl = 'https://places.googleapis.com/v1/places:autocomplete';
    const requestBody = {
      input: input,
      languageCode: 'es',
      includedRegionCodes: ['AR', 'MX', 'CL', 'CO', 'PE', 'UY', 'PY', 'BO', 'EC', 'VE']
    };

    const response = await fetch(autocompleteUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Autocomplete API error:', errorText);
      
      return new Response(
        JSON.stringify({ 
          error: 'Google Maps API error',
          status: response.status,
          message: response.status === 403 ? 'API key invalid or quota exceeded' :
                  response.status === 429 ? 'Quota exceeded' :
                  `HTTP ${response.status}: ${response.statusText}`,
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
    console.log('Autocomplete response:', JSON.stringify(data).substring(0, 200));

    // Transform new API response to match old API format
    const predictions = (data.suggestions || []).map((suggestion: any) => ({
      place_id: suggestion.placePrediction?.placeId || '',
      description: suggestion.placePrediction?.text?.text || '',
      structured_formatting: {
        main_text: suggestion.placePrediction?.structuredFormat?.mainText?.text || '',
        secondary_text: suggestion.placePrediction?.structuredFormat?.secondaryText?.text || ''
      }
    }));

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
