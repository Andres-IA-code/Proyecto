const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GOOGLE_MAPS_API_KEY = 'AIzaSyCWVGYicwnsxGb9dl0A0yDufh4AYnwjsuA';

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

    // Place Details using old stable API
    if (type === 'details' && placeId) {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&key=${GOOGLE_MAPS_API_KEY}`;
      console.log('Fetching place details for:', placeId);

      const response = await fetch(detailsUrl);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Place details error:', errorText);
        throw new Error(`Failed to get place details: ${response.status}`);
      }

      const data = await response.json();
      console.log('Place details status:', data.status);

      if (data.status === 'OK') {
        return new Response(
          JSON.stringify(data),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      } else {
        console.error('Place details API status:', data.status, data.error_message);
        return new Response(
          JSON.stringify({ 
            error: data.error_message || data.status,
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
    }

    // Autocomplete using old stable API
    if (!input) {
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

    console.log('Searching places for:', input);
    
    // Using old Places API Autocomplete (more stable)
    const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}&language=es&components=country:ar|country:mx|country:cl|country:co|country:pe|country:uy|country:py|country:bo|country:ec|country:ve`;

    const response = await fetch(autocompleteUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Autocomplete API error:', errorText);
      
      return new Response(
        JSON.stringify({ 
          error: 'Google Maps API error',
          status: response.status,
          message: `HTTP ${response.status}: ${response.statusText}`,
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
    console.log('Autocomplete status:', data.status);
    console.log('Predictions count:', data.predictions?.length || 0);

    if (data.status === 'REQUEST_DENIED' || data.status === 'OVER_QUERY_LIMIT') {
      console.error('API Error:', data.status, data.error_message);
      return new Response(
        JSON.stringify({ 
          error: data.error_message || data.status,
          message: data.status === 'REQUEST_DENIED' ? 'API key invalid or Places API not enabled' :
                  data.status === 'OVER_QUERY_LIMIT' ? 'Quota exceeded' :
                  data.error_message,
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

    return new Response(
      JSON.stringify({
        status: data.status,
        predictions: data.predictions || []
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
