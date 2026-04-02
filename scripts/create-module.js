const fs = require("fs")
const path = require("path")

const name = process.argv[2]

if (!name) {
    console.error("❌ Please provide module name")
    process.exit(1)
}

const capital = name.charAt(0).toUpperCase() + name.slice(1)

// folder target
const baseDir = path.join(__dirname, "../src/modules", name)

if (fs.existsSync(baseDir)) {
    console.error("❌ Module already exists")
    process.exit(1)
}

// create folder
fs.mkdirSync(baseDir, { recursive: true })

// 1. SERVICE
const serviceContent = `
export class ${capital}Service {
  async findAll() {
    return []
  }

  async findById(id) {
    return null
  }
}
`

fs.writeFileSync(path.join(baseDir, `${name}.service.ts`), serviceContent)

// 2. PRISMA MODEL (append ke schema.prisma)
const prismaPath = path.join(__dirname, "../prisma/schema.prisma")

const model = `
model ${capital} {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`

fs.appendFileSync(prismaPath, model)

// 3. ROUTE (optional)
const routeContent = `
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ message: "${capital} route" })
}
`

const routeDir = path.join(__dirname, `../src/app/api/${name}`)
fs.mkdirSync(routeDir, { recursive: true })
fs.writeFileSync(path.join(routeDir, "route.ts"), routeContent)

console.log(`✅ Module ${capital} created`)
