import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { items, back_urls } = await req.json()

    const preference = {
      items: items,
      back_urls: back_urls,
      auto_return: 'approved'
    }

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('APP_USR-3418322195445818-090922-a36386c142316bf9f3b9e994eaef5870-2678265045')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return new Response(
        JSON.stringify({ 
          error: `MercadoPago API error: ${response.status} - ${errorData.message || 'Unknown error'}`,
          details: errorData
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    const data = await response.json()

    if (!data.init_point) {
      return new Response(
        JSON.stringify({ 
          error: 'MercadoPago no devolvió un link de pago válido',
          details: data
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})