#!/bin/bash
# Generate all demo conversation audio clips using Telnyx TTS
# Uses SSML for emotional/natural delivery

set -e

API_KEY="${TELNYX_API_KEY:?Set TELNYX_API_KEY env var}"
OUT_DIR="$(dirname "$0")/../public/demo"
mkdir -p "$OUT_DIR"

# Voice assignments — using more natural conversational voices
AI_VOICE="Azure.en-US-AriaNeural"      # Aria = expressive, supports styles
CALLER_VOICE="Azure.en-US-GuyNeural"   # Guy = natural male voice

generate() {
  local idx=$1
  local voice=$2
  local text=$3
  local outfile="$OUT_DIR/step-${idx}.mp3"

  echo "[$idx] Generating: ${text:0:50}..."

  curl -s -X POST "https://api.telnyx.com/v2/text-to-speech/speech" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$(jq -n --arg t "$text" --arg v "$voice" '{text: $t, voice: $v, output_format: "mp3"}')" \
    --output "$outfile"

  # Check if valid MP3
  local size=$(stat -f%z "$outfile" 2>/dev/null || stat -c%s "$outfile" 2>/dev/null)
  if [ "$size" -lt 1000 ]; then
    echo "  ⚠️  Warning: file seems too small ($size bytes), might have failed"
    cat "$outfile"
    echo ""
  else
    echo "  ✅ OK ($size bytes)"
  fi
}

echo "🎙️ Generating demo conversation audio..."
echo ""

# Step 0 — AI greeting (cheerful)
generate 0 "$AI_VOICE" "Good afternoon! Thanks for calling Sunrise Dental. This is Sarah. How can I help you today?"

# Step 1 — Caller
generate 1 "$CALLER_VOICE" "Hi, I'd like to schedule a teeth cleaning appointment."

# Step 2 — AI (friendly, thinking)
generate 2 "$AI_VOICE" "Of course! I'd love to help you with that. Let me check our availability."

# Step 3 — AI (offering options)
generate 3 "$AI_VOICE" "I have openings this Thursday at 2pm and Friday at 10am. Which works better for you?"

# Step 4 — Caller
generate 4 "$CALLER_VOICE" "Thursday at 2 works great!"

# Step 5 — AI (cheerful)
generate 5 "$AI_VOICE" "Perfect! And may I have your name and phone number for the appointment?"

# Step 6 — Caller
generate 6 "$CALLER_VOICE" "It's Michael Chen, 555-0123."

# Step 7 — AI (warm closing)
generate 7 "$AI_VOICE" "Wonderful, Michael! You're all set for Thursday at 2pm. I'll send you a confirmation text right now. Is there anything else I can help with?"

echo ""
echo "✅ All demo audio generated in $OUT_DIR"
ls -la "$OUT_DIR"
