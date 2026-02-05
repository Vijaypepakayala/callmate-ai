// ============================================================
// CallMate AI - Type Definitions
// ============================================================

// Voice & Emotion Types
export type VoiceStyle = 'cheerful' | 'empathetic' | 'friendly' | 'hopeful' | 'sad' | 'serious'
export type VoicePersonality = 'warm-friendly' | 'professional-calm' | 'energetic-cheerful'
export type InterruptSensitivity = 'low' | 'medium' | 'high'

export interface VoiceConfig {
  voiceName: string
  style: VoiceStyle
  personality: VoicePersonality
  speakingRate: string
  pitch: string
}

export interface AzureVoice {
  name: string
  displayName: string
  gender: 'Female' | 'Male'
  locale: string
  supportedStyles: VoiceStyle[]
}

export const AZURE_VOICES: AzureVoice[] = [
  {
    name: 'en-US-JennyNeural',
    displayName: 'Jenny',
    gender: 'Female',
    locale: 'en-US',
    supportedStyles: ['cheerful', 'empathetic', 'friendly', 'hopeful', 'sad', 'serious'],
  },
  {
    name: 'en-US-AriaNeural',
    displayName: 'Aria',
    gender: 'Female',
    locale: 'en-US',
    supportedStyles: ['cheerful', 'empathetic', 'friendly', 'hopeful', 'sad', 'serious'],
  },
  {
    name: 'en-US-GuyNeural',
    displayName: 'Guy',
    gender: 'Male',
    locale: 'en-US',
    supportedStyles: ['cheerful', 'empathetic', 'friendly', 'serious'],
  },
  {
    name: 'en-US-SaraNeural',
    displayName: 'Sara',
    gender: 'Female',
    locale: 'en-US',
    supportedStyles: ['cheerful', 'empathetic', 'friendly', 'hopeful', 'serious'],
  },
  {
    name: 'en-US-DavisNeural',
    displayName: 'Davis',
    gender: 'Male',
    locale: 'en-US',
    supportedStyles: ['cheerful', 'empathetic', 'friendly', 'hopeful', 'serious'],
  },
  {
    name: 'en-GB-SoniaNeural',
    displayName: 'Sonia (British)',
    gender: 'Female',
    locale: 'en-GB',
    supportedStyles: ['cheerful', 'empathetic', 'friendly', 'sad', 'serious'],
  },
]

export const VOICE_PERSONALITIES: Record<VoicePersonality, { label: string; description: string; defaultStyle: VoiceStyle; defaultRate: string; defaultPitch: string }> = {
  'warm-friendly': {
    label: 'Warm & Friendly',
    description: 'Like your favorite neighborhood receptionist — approachable, caring, and always happy to help.',
    defaultStyle: 'friendly',
    defaultRate: '-5%',
    defaultPitch: '2%',
  },
  'professional-calm': {
    label: 'Professional & Calm',
    description: 'Polished and composed. Perfect for law firms, medical offices, and corporate settings.',
    defaultStyle: 'serious',
    defaultRate: '-8%',
    defaultPitch: '-3%',
  },
  'energetic-cheerful': {
    label: 'Energetic & Cheerful',
    description: 'Upbeat and enthusiastic. Great for retail, salons, fitness studios, and restaurants.',
    defaultStyle: 'cheerful',
    defaultRate: '5%',
    defaultPitch: '5%',
  },
}

// Ambient Sound Types
export interface AmbientConfig {
  enabled: boolean
  volume: number
  typingSounds: boolean
  holdMusic: boolean
}

export const AMBIENT_SOUNDS = {
  'office-ambience': {
    label: 'Office Ambience',
    description: 'Subtle background office sounds',
    duration: 30,
    url: '/audio/office-ambience.mp3',
  },
  typing: {
    label: 'Keyboard Typing',
    description: 'Realistic typing sounds while "looking something up"',
    duration: 5,
    url: '/audio/typing.mp3',
  },
  'hold-transition': {
    label: 'Hold Transition',
    description: 'Brief pleasant transition sound',
    duration: 3,
    url: '/audio/hold-transition.mp3',
  },
  thinking: {
    label: 'Thinking Sounds',
    description: 'Subtle pen/paper rustling',
    duration: 4,
    url: '/audio/thinking.mp3',
  },
} as const

export type AmbientSoundType = keyof typeof AMBIENT_SOUNDS

// Conversation Types
export interface ConversationMessage {
  role: 'system' | 'assistant' | 'user'
  content: string
  timestamp: number
  emotion?: VoiceStyle
}

export type CallerIntent = 'appointment' | 'question' | 'message' | 'transfer' | 'unknown'

export interface ConversationContext {
  callControlId: string
  businessId: string
  callerNumber: string
  messages: ConversationMessage[]
  currentIntent: CallerIntent
  gatherState: 'listening' | 'processing' | 'speaking' | 'ambient'
  metadata: Record<string, unknown>
}

// Telnyx Webhook Types
export interface TelnyxWebhookEvent {
  data: {
    event_type: string
    id: string
    occurred_at: string
    payload: TelnyxCallPayload | TelnyxMessagePayload
    record_type: string
  }
  meta: {
    attempt: number
    delivered_to: string
  }
}

export interface TelnyxCallPayload {
  call_control_id: string
  call_leg_id: string
  call_session_id: string
  client_state?: string
  connection_id: string
  from: string
  to: string
  direction: string
  state: string
  // Gather-specific
  digits?: string
  speech?: {
    result: string
    confidence: number
  }
}

export interface TelnyxMessagePayload {
  id: string
  from: { phone_number: string }
  to: { phone_number: string }[]
  text: string
  direction: string
  type: string
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// Dashboard Types
export interface CallLogEntry {
  id: string
  callerNumber: string
  calledNumber: string
  status: string
  duration: number | null
  callerIntent: string | null
  sentiment: string | null
  summary: string | null
  appointmentBooked: boolean
  messageTaken: boolean
  startedAt: string
  transcript: ConversationMessage[] | null
}

export interface AnalyticsData {
  totalCalls: number
  answeredCalls: number
  missedCalls: number
  avgDuration: number
  appointmentsBooked: number
  messagesTaken: number
  topIntents: { intent: string; count: number }[]
  callsByHour: { hour: number; count: number }[]
  sentimentBreakdown: { sentiment: string; count: number }[]
  callsOverTime: { date: string; count: number }[]
}

// Pricing Tiers
export interface PricingTier {
  name: string
  price: number
  period: string
  description: string
  features: string[]
  highlighted?: boolean
  cta: string
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Starter',
    price: 49,
    period: '/mo',
    description: 'Perfect for solo practitioners and small shops',
    features: [
      'Up to 100 calls/month',
      '1 phone number',
      'AI receptionist with natural voice',
      'Appointment booking',
      'SMS confirmations',
      'Call transcripts',
      'Email support',
    ],
    cta: 'Start Free Trial',
  },
  {
    name: 'Professional',
    price: 99,
    period: '/mo',
    description: 'For growing businesses that never want to miss a call',
    features: [
      'Up to 500 calls/month',
      '3 phone numbers',
      'Emotional neural voices',
      'Background office sounds',
      'Smart barge-in conversation',
      'Custom AI personality',
      'FAQ knowledge base',
      'Analytics dashboard',
      'Priority support',
    ],
    highlighted: true,
    cta: 'Start Free Trial',
  },
  {
    name: 'Enterprise',
    price: 199,
    period: '/mo',
    description: 'Unlimited calls with premium features for large teams',
    features: [
      'Unlimited calls',
      '10 phone numbers',
      'Everything in Professional',
      'Call transfer to humans',
      'Multi-location support',
      'Custom integrations',
      'API access',
      'Dedicated account manager',
      'White-label option',
    ],
    cta: 'Contact Sales',
  },
]
