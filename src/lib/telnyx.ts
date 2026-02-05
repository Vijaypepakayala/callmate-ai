// ============================================================
// Telnyx API Client — Call Control v2 & Messaging
// ============================================================

const TELNYX_API_KEY = process.env.TELNYX_API_KEY!
const TELNYX_BASE = 'https://api.telnyx.com/v2'

interface TelnyxRequestOptions {
  method?: string
  body?: Record<string, unknown>
  params?: Record<string, string>
}

async function telnyxRequest<T = unknown>(
  path: string,
  options: TelnyxRequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, params } = options
  const url = new URL(`${TELNYX_BASE}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }

  const res = await fetch(url.toString(), {
    method,
    headers: {
      Authorization: `Bearer ${TELNYX_API_KEY}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  if (!res.ok) {
    const error = await res.text()
    console.error(`[Telnyx] ${method} ${path} failed:`, res.status, error)
    throw new Error(`Telnyx API error: ${res.status} — ${error}`)
  }

  return res.json() as Promise<T>
}

// ============================================================
// Call Control Commands
// ============================================================

export const callControl = {
  /** Answer an incoming call */
  async answer(callControlId: string, clientState?: string) {
    return telnyxRequest(`/calls/${callControlId}/actions/answer`, {
      method: 'POST',
      body: {
        client_state: clientState ? Buffer.from(clientState).toString('base64') : undefined,
      },
    })
  },

  /** Speak text using SSML (Azure Neural Voices with emotions) */
  async speak(
    callControlId: string,
    ssml: string,
    options: {
      clientState?: string
      commandId?: string
    } = {}
  ) {
    return telnyxRequest(`/calls/${callControlId}/actions/speak`, {
      method: 'POST',
      body: {
        payload: ssml,
        payload_type: 'ssml',
        service_level: 'premium',
        client_state: options.clientState
          ? Buffer.from(options.clientState).toString('base64')
          : undefined,
        command_id: options.commandId,
      },
    })
  },

  /** Gather speech input from caller (with barge-in support) */
  async gather(
    callControlId: string,
    options: {
      interruptEnabled?: boolean
      minSilenceMs?: number
      maxSilenceMs?: number
      timeoutMs?: number
      clientState?: string
      initialSilenceMs?: number
    } = {}
  ) {
    const {
      interruptEnabled = true,
      minSilenceMs = 800,
      maxSilenceMs = 5000,
      timeoutMs = 30000,
      initialSilenceMs = 10000,
      clientState,
    } = options

    return telnyxRequest(`/calls/${callControlId}/actions/gather`, {
      method: 'POST',
      body: {
        input: 'speech',
        language: 'en-US',
        inter_digit_timeout: maxSilenceMs,
        minimum_digits: 0,
        maximum_digits: 0,
        timeout_millis: timeoutMs,
        initial_timeout_millis: initialSilenceMs,
        speech_threshold: minSilenceMs,
        interrupt_enabled: interruptEnabled,
        client_state: clientState
          ? Buffer.from(clientState).toString('base64')
          : undefined,
      },
    })
  },

  /** Speak SSML and gather speech simultaneously (speak then listen) */
  async speakAndGather(
    callControlId: string,
    ssml: string,
    options: {
      interruptEnabled?: boolean
      minSilenceMs?: number
      maxSilenceMs?: number
      clientState?: string
    } = {}
  ) {
    const {
      interruptEnabled = true,
      minSilenceMs = 800,
      maxSilenceMs = 5000,
      clientState,
    } = options

    return telnyxRequest(`/calls/${callControlId}/actions/gather_using_speak`, {
      method: 'POST',
      body: {
        payload: ssml,
        payload_type: 'ssml',
        service_level: 'premium',
        language: 'en-US',
        inter_digit_timeout: maxSilenceMs,
        minimum_digits: 0,
        maximum_digits: 0,
        speech_threshold: minSilenceMs,
        interrupt_enabled: interruptEnabled,
        client_state: clientState
          ? Buffer.from(clientState).toString('base64')
          : undefined,
      },
    })
  },

  /** Play an audio file (for ambient sounds) */
  async playAudio(
    callControlId: string,
    audioUrl: string,
    options: {
      loop?: boolean
      overlay?: boolean
      clientState?: string
      targetLegs?: string
    } = {}
  ) {
    return telnyxRequest(`/calls/${callControlId}/actions/playback_start`, {
      method: 'POST',
      body: {
        audio_url: audioUrl,
        loop: options.loop ? 'infinity' : undefined,
        overlay: options.overlay ?? true,  // overlay = mix with call audio
        client_state: options.clientState
          ? Buffer.from(options.clientState).toString('base64')
          : undefined,
        target_legs: options.targetLegs ?? 'self',
      },
    })
  },

  /** Stop audio playback */
  async stopAudio(callControlId: string, options: { stop?: string } = {}) {
    return telnyxRequest(`/calls/${callControlId}/actions/playback_stop`, {
      method: 'POST',
      body: {
        stop: options.stop ?? 'current',
      },
    })
  },

  /** Stop speaking (for barge-in) */
  async stopSpeak(callControlId: string) {
    return telnyxRequest(`/calls/${callControlId}/actions/stop`, {
      method: 'POST',
      body: {},
    })
  },

  /** Transfer call to another number */
  async transfer(callControlId: string, toNumber: string, options: { fromNumber?: string } = {}) {
    return telnyxRequest(`/calls/${callControlId}/actions/transfer`, {
      method: 'POST',
      body: {
        to: toNumber,
        from: options.fromNumber,
      },
    })
  },

  /** Hang up the call */
  async hangup(callControlId: string) {
    return telnyxRequest(`/calls/${callControlId}/actions/hangup`, {
      method: 'POST',
      body: {},
    })
  },

  /** Send DTMF tones */
  async sendDtmf(callControlId: string, digits: string) {
    return telnyxRequest(`/calls/${callControlId}/actions/send_dtmf`, {
      method: 'POST',
      body: { digits },
    })
  },
}

// ============================================================
// Messaging
// ============================================================

export const messaging = {
  /** Send an SMS message */
  async sendSMS(from: string, to: string, text: string, messagingProfileId?: string) {
    return telnyxRequest('/messages', {
      method: 'POST',
      body: {
        from,
        to,
        text,
        messaging_profile_id: messagingProfileId || process.env.TELNYX_MESSAGING_PROFILE_ID,
      },
    })
  },
}

// ============================================================
// Number Management
// ============================================================

export const numbers = {
  /** Search for available phone numbers */
  async search(options: {
    country?: string
    state?: string
    city?: string
    areaCode?: string
    limit?: number
    features?: string[]
  } = {}) {
    const params: Record<string, string> = {}
    if (options.country) params['filter[country_code]'] = options.country
    if (options.state) params['filter[administrative_area]'] = options.state
    if (options.city) params['filter[locality]'] = options.city
    if (options.areaCode) params['filter[national_destination_code]'] = options.areaCode
    if (options.limit) params['filter[limit]'] = String(options.limit)
    if (options.features?.length) params['filter[features]'] = options.features.join(',')

    return telnyxRequest('/available_phone_numbers', { params })
  },

  /** Order (buy) a phone number */
  async order(phoneNumber: string, connectionId?: string) {
    return telnyxRequest('/number_orders', {
      method: 'POST',
      body: {
        phone_numbers: [{ phone_number: phoneNumber }],
        connection_id: connectionId || process.env.TELNYX_APP_ID,
      },
    })
  },

  /** List owned numbers */
  async list() {
    return telnyxRequest('/phone_numbers', {
      params: { 'page[size]': '50' },
    })
  },

  /** Update number settings (assign to connection) */
  async update(numberId: string, connectionId: string) {
    return telnyxRequest(`/phone_numbers/${numberId}`, {
      method: 'PATCH',
      body: {
        connection_id: connectionId,
      },
    })
  },
}
