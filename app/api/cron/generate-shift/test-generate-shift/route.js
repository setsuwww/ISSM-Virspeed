import { generateNextShift } from "@/_jobs/content/shift/shift_generator"

export async function GET() {
    const userId = "cmoijilvl0009mgeoh7fnnkhi"

    await generateNextShift(userId)

    return Response.json({ success: true })
}
