import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Sensor {
  id: string
  name: string
  sensor_type: string
  last_reading: {
    apiUrl?: string
    apiKey?: string
    apiMethod?: string
    value?: number
  } | null
  threshold_min: number | null
  threshold_max: number | null
  alert_enabled: boolean
  zone_id: string
}

interface Zone {
  company_id: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Fetching sensors with API configuration...')

    // Get all sensors with API configuration
    const { data: sensors, error: sensorsError } = await supabase
      .from('monitoring_sensors')
      .select('*, monitoring_zones!inner(company_id)')
      .not('last_reading->apiUrl', 'is', null)

    if (sensorsError) {
      console.error('Error fetching sensors:', sensorsError)
      throw sensorsError
    }

    console.log(`Found ${sensors?.length || 0} sensors with API configuration`)

    const results = []

    // Fetch data from each sensor's API
    for (const sensor of sensors || []) {
      try {
        const apiUrl = sensor.last_reading?.apiUrl
        const apiKey = sensor.last_reading?.apiKey
        const apiMethod = sensor.last_reading?.apiMethod || 'GET'

        if (!apiUrl) continue

        console.log(`Fetching data for sensor ${sensor.id} from ${apiUrl}`)

        const fetchOptions: RequestInit = {
          method: apiMethod,
          headers: {
            'Content-Type': 'application/json',
            ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
          },
        }

        const response = await fetch(apiUrl, fetchOptions)
        const data = await response.json()

        // Extract value from response (adjust this based on your API response format)
        const value = typeof data === 'number' ? data : (data.value || data.reading || null)

        console.log(`Received value ${value} for sensor ${sensor.id}`)

        // Update sensor with new reading
        const { error: updateError } = await supabase
          .from('monitoring_sensors')
          .update({
            last_reading: {
              ...sensor.last_reading,
              value,
              timestamp: new Date().toISOString(),
            },
          })
          .eq('id', sensor.id)

        if (updateError) {
          console.error(`Error updating sensor ${sensor.id}:`, updateError)
        }

        // Check thresholds and create alerts if needed
        if (sensor.alert_enabled && value !== null) {
          const exceedsMin = sensor.threshold_min !== null && value < sensor.threshold_min
          const exceedsMax = sensor.threshold_max !== null && value > sensor.threshold_max

          if (exceedsMin || exceedsMax) {
            console.log(`Threshold exceeded for sensor ${sensor.id}`)

            // Get all users in the company
            const { data: profiles, error: profilesError } = await supabase
              .from('profiles')
              .select('id')
              .eq('company_id', (sensor as any).monitoring_zones.company_id)

            if (!profilesError && profiles) {
              for (const profile of profiles) {
                const message = exceedsMin
                  ? `Показание датчика "${sensor.name}" ниже порогового значения: ${value} < ${sensor.threshold_min}`
                  : `Показание датчика "${sensor.name}" превышает пороговое значение: ${value} > ${sensor.threshold_max}`

                await supabase.from('notifications').insert({
                  user_id: profile.id,
                  title: '⚠️ Предупреждение по датчику',
                  message,
                  type: 'warning',
                })
              }
            }
          }
        }

        results.push({ sensorId: sensor.id, success: true, value })
      } catch (error) {
        console.error(`Error processing sensor ${sensor.id}:`, error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        results.push({ sensorId: sensor.id, success: false, error: errorMessage })
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in sensor-data-fetch function:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
