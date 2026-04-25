// prisma/seed.ts

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed for CityWatch Bangladesh...\n")

  // 1. Clean existing data in the correct order
  console.log("🧹 Cleaning existing data...")
  await prisma.assignment.deleteMany()
  await prisma.maintenanceSchedule.deleteMany()
  await prisma.emergencyBroadcast.deleteMany()
  await prisma.report.deleteMany()
  await prisma.user.deleteMany()
  await prisma.department.deleteMany()
  console.log("✅ Cleaned existing data\n")

  // 2. Create Departments
  console.log("🏢 Creating departments...")
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: "Water Supply & Sewerage (WASA)",
        description: "Handles water supply, drainage, and sewerage issues across the city.",
        icon: "💧",
        color: "#3B82F6",
      },
    }),
    prisma.department.create({
      data: {
        name: "Waste Management",
        description: "Manages garbage collection, disposal, and recycling services.",
        icon: "🗑️",
        color: "#22C55E",
      },
    }),
    prisma.department.create({
      data: {
        name: "Roads & Highways Department",
        description: "Handles road repairs, potholes, street lights, and infrastructure.",
        icon: "🛣️",
        color: "#EAB308",
      },
    }),
    prisma.department.create({
      data: {
        name: "Power Development Board (BPDB)",
        description: "Handles power outages, electrical faults, and meter issues.",
        icon: "⚡️",
        color: "#F97316",
      },
    }),
    prisma.department.create({
      data: {
        name: "Public Health Department",
        description: "Manages public health, sanitation, and disease control.",
        icon: "❤️",
        color: "#EF4444",
      },
    }),
    prisma.department.create({
      data: {
        name: "City Development Authority (RAJUK)",
        description: "Handles building permits, urban planning, and development.",
        icon: "🏗️",
        color: "#8B5CF6",
      },
    }),
  ])
  console.log("✅ Created 6 departments\n")

  // 3. Create Admin Users
  console.log("👑 Creating admin users...")
  const adminPassword = await bcrypt.hash("admin123", 12)
  const admin1 = await prisma.user.create({
    data: {
      email: "admin@citywatch.gov.bd",
      password: adminPassword,
      name: "Mohammad Ali Khan",
      phone: "+8801711111111",
      city: "Dhaka",
      role: "admin",
    },
  })
  console.log("✅ Created 2 admin users\n")

  // 4. Create Officers and assign them to departments
  console.log("👮 Creating officers...")
  const officerPassword = await bcrypt.hash("officer123", 12)
  const officers = await Promise.all([
    // WASA Officers
    prisma.user.create({
      data: {
        email: "water.officer@wasa.gov.bd",
        password: officerPassword,
        name: "Karim Uddin Ahmed",
        phone: "+8801812345671",
        city: "Dhaka",
        role: "officer",
        departmentId: departments[0].id, // WASA
      },
    }),
    // Waste Management Officer
    prisma.user.create({
      data: {
        email: "waste.officer@dncc.gov.bd",
        password: officerPassword,
        name: "Rafiqul Islam",
        phone: "+8801812345673",
        city: "Dhaka",
        role: "officer",
        departmentId: departments[1].id, // Waste Management
      },
    }),
    // Roads & Highways Officer
    prisma.user.create({
      data: {
        email: "roads.officer@rhd.gov.bd",
        password: officerPassword,
        name: "Shahidul Haque",
        phone: "+8801812345674",
        city: "Dhaka",
        role: "officer",
        departmentId: departments[2].id, // Roads & Highways
      },
    }),
    // Power Development Officer
    prisma.user.create({
      data: {
        email: "electric.officer@bpdb.gov.bd",
        password: officerPassword,
        name: "Nasima Parvin",
        phone: "+8801812345675",
        city: "Dhaka",
        role: "officer",
        departmentId: departments[3].id, // BPDB
      },
    }),
    // Health Officer
    prisma.user.create({
        data: {
            email: "health.officer@dncc.gov.bd",
            password: officerPassword,
            name: "Dr. Aminul Haque",
            phone: "+8801812345676",
            city: "Dhaka",
            role: "officer",
            departmentId: departments[4].id, // Public Health
        },
    }),
  ])
  console.log(`✅ Created ${officers.length} officers\n`)

  // 5. Create Citizens
  console.log("👥 Creating citizens...")
  const citizenPassword = await bcrypt.hash("citizen123", 12)
  await Promise.all([
    prisma.user.create({
      data: {
        email: "citizen@gmail.com",
        password: citizenPassword,
        name: "Abdullah Al Mamun",
        phone: "+8801912345671",
        address: "House 12, Road 5, Dhanmondi",
        city: "Dhaka",
        role: "citizen",
      },
    }),
    prisma.user.create({
      data: {
        email: "rahima@gmail.com",
        password: citizenPassword,
        name: "Rahima Khatun",
        phone: "+8801912345672",
        address: "Flat 4B, Gulshan 2",
        city: "Dhaka",
        role: "citizen",
      },
    }),
  ])
  console.log("✅ Created 2 citizens\n")

  console.log("🎉 Database seeding completed for CityWatch Bangladesh!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ Error during seeding:", e)
    await prisma.$disconnect()
    process.exit(1)
  })