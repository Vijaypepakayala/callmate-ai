export const DEMOS = {
  clinicmate: "assistant-5df07b81-fe5d-489f-ac82-c8679bbbfe2b",
  orderai: "assistant-a974e21f-b039-4e2b-9b60-192c5b71a98d",
  debtshield: "assistant-d6bd4d43-e0ff-46f7-9c49-459029734423",
  propbot: "assistant-1b18fd4b-ad02-463f-b541-c1604829230e",
  tutorcall: "assistant-c2360316-580a-4e9d-924b-a51fa0fc4e8c",
  recruitai: "assistant-42b7b64d-14ad-4d2b-ac47-0233e155b561",
  fitcall: "assistant-0fb9a725-3036-47d0-aedd-2b629fffb030",
  legalease: "assistant-881e0fcc-745e-4373-8363-9a95a8c8db05",
} as const

export type DemoId = keyof typeof DEMOS

export function isDemoId(value: unknown): value is DemoId {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(DEMOS, value)
}

export function demoNumbers(): Partial<Record<DemoId, string>> {
  try {
    const values = JSON.parse(process.env.DEMO_NUMBERS_JSON || "{}") as Record<string, unknown>
    return Object.fromEntries(
      Object.entries(values).filter(([id, number]) =>
        isDemoId(id) && typeof number === "string" && /^\+[1-9]\d{7,14}$/.test(number)
      )
    ) as Partial<Record<DemoId, string>>
  } catch {
    return {}
  }
}

export function demoForNumber(number: unknown): DemoId | null {
  if (typeof number !== "string") return null
  const entry = Object.entries(demoNumbers()).find(([, assigned]) => assigned === number)
  return (entry?.[0] as DemoId | undefined) || null
}
