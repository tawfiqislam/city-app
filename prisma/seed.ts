import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed for CityWatch Bangladesh...\n")

  // Clean existing data
  console.log("🧹 Cleaning existing data...")
  await prisma.assignment.deleteMany()
  await prisma.maintenanceSchedule.deleteMany()
  await prisma.emergencyBroadcast.deleteMany()
  await prisma.report.deleteMany()
  await prisma.user.deleteMany()
  await prisma.department.deleteMany()
  console.log("✅ Cleaned existing data\n")

  // Create Departments
  console.log("🏢 Creating departments...")
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: "Water Supply & Sewerage (WASA)",
        description: "Handles water supply, drainage, and sewerage issues across the city",
        icon: "💧",
        color: "#3B82F6",
      },
    }),
    prisma.department.create({
      data: {
        name: "Waste Management",
        description: "Manages garbage collection, disposal, and recycling services",
        icon: "🗑️",
        color: "#22C55E",
      },
    }),
    prisma.department.create({
      data: {
        name: "Roads & Highways Department",
        description: "Handles road repairs, potholes, street lights, and infrastructure",
        icon: "🛣️",
        color: "#EAB308",
      },
    }),
    prisma.department.create({
      data: {
        name: "Power Development Board (BPDB)",
        description: "Handles power outages, electrical faults, and meter issues",
        icon: "⚡",
        color: "#F97316",
      },
    }),
    prisma.department.create({
      data: {
        name: "Public Health Department",
        description: "Manages public health, sanitation, and disease control",
        icon: "🏥",
        color: "#EF4444",
      },
    }),
    prisma.department.create({
      data: {
        name: "City Development Authority (RAJUK)",
        description: "Handles building permits, urban planning, and development",
        icon: "🏗️",
        color: "#8B5CF6",
      },
    }),
  ])
  console.log("✅ Created 6 departments\n")

  // Create Admin Users
  console.log("👨‍💼 Creating admin users...")
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

  const admin2 = await prisma.user.create({
    data: {
      email: "admin@dncc.gov.bd",
      password: adminPassword,
      name: "Fatema Begum",
      phone: "+8801711111112",
      city: "Dhaka",
      role: "admin",
    },
  })
  console.log("✅ Created 2 admin users\n")

  // Create Officers
  console.log("👮 Creating officers...")
  const officerPassword = await bcrypt.hash("officer123", 12)

  const officers = await Promise.all([
    prisma.user.create({
      data: {
        email: "water.officer@wasa.gov.bd",
        password: officerPassword,
        name: "Karim Uddin Ahmed",
        phone: "+8801812345671",
        city: "Dhaka",
        role: "officer",
        departmentId: departments[0].id,
      },
    }),
    prisma.user.create({
      data: {
        email: "water.officer2@wasa.gov.bd",
        password: officerPassword,
        name: "Salma Akter",
        phone: "+8801812345672",
        city: "Dhaka",
        role: "officer",
        departmentId: departments[0].id,
      },
    }),
    prisma.user.create({
      data: {
        email: "waste.officer@dncc.gov.bd",
        password: officerPassword,
        name: "Rafiqul Islam",
        phone: "+8801812345673",
        city: "Dhaka",
        role: "officer",
        departmentId: departments[1].id,
      },
    }),
    prisma.user.create({
      data: {
        email: "roads.officer@rhd.gov.bd",
        password: officerPassword,
        name: "Shahidul Haque",
        phone: "+8801812345674",
        city: "Dhaka",
        role: "officer",
        departmentId: departments[2].id,
      },
    }),
    prisma.user.create({
      data: {
        email: "electric.officer@bpdb.gov.bd",
        password: officerPassword,
        name: "Nasima Parvin",
        phone: "+8801812345675",
        city: "Dhaka",
        role: "officer",
        departmentId: departments[3].id,
      },
    }),
    prisma.user.create({
      data: {
        email: "health.officer@dncc.gov.bd",
        password: officerPassword,
        name: "Dr. Aminul Haque",
        phone: "+8801812345676",
        city: "Dhaka",
        role: "officer",
        departmentId: departments[4].id,
      },
    }),
  ])
  console.log("✅ Created 6 officers\n")

  // Create Citizens
  console.log("👥 Creating citizens...")
  const citizenPassword = await bcrypt.hash("citizen123", 12)

  const citizens = await Promise.all([
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
    prisma.user.create({
      data: {
        email: "jahangir@gmail.com",
        password: citizenPassword,
        name: "Jahangir Alam",
        phone: "+8801912345673",
        address: "Uttara Sector 10",
        city: "Dhaka",
        role: "citizen",
      },
    }),
    prisma.user.create({
      data: {
        email: "sultana@gmail.com",
        password: citizenPassword,
        name: "Sultana Razia",
        phone: "+8801912345674",
        address: "Mirpur 10",
        city: "Dhaka",
        role: "citizen",
      },
    }),
  ])
  console.log("✅ Created 4 citizens\n")

  // Create Sample Reports
  console.log("📝 Creating sample reports...")
  const reports = await Promise.all([
    prisma.report.create({
      data: {
        title: "URGENT: Major water pipe burst at Mirpur 10",
        description: "A major water pipeline has burst near Mirpur 10 roundabout. Water is flooding the streets and affecting traffic. Immediate repair needed.",
        category: "Water",
        location: "Mirpur 10 Roundabout, Dhaka",
        city: "Dhaka",
        division: "Dhaka",
        latitude: 23.8069,
        longitude: 90.3687,
        status: "pending",
        priority: "urgent",
        isEmergency: true,
        userId: citizens[0].id,
        departmentId: departments[0].id,
      },
    }),
    prisma.report.create({
      data: {
        title: "Large pothole on Dhanmondi Road 27",
        description: "There is a huge pothole on Dhanmondi Road 27. Two motorcycle accidents have occurred last week. Needs urgent repair.",
        category: "Roads",
        location: "Dhanmondi Road 27, Dhaka",
        city: "Dhaka",
        division: "Dhaka",
        latitude: 23.7465,
        longitude: 90.3762,
        status: "pending",
        priority: "high",
        isEmergency: false,
        userId: citizens[1].id,
        departmentId: departments[2].id,
      },
    }),
    prisma.report.create({
      data: {
        title: "Garbage not collected for 3 days in Gulshan",
        description: "Dustbins are overflowing near Gulshan 2 circle. Garbage has not been collected for 3 days. Bad smell spreading in the area.",
        category: "Waste",
        location: "Gulshan 2 Circle, Dhaka",
        city: "Dhaka",
        division: "Dhaka",
        latitude: 23.7925,
        longitude: 90.4078,
        status: "pending",
        priority: "medium",
        isEmergency: false,
        userId: citizens[1].id,
        departmentId: departments[1].id,
      },
    }),
    prisma.report.create({
      data: {
        title: "Street lights not working in Uttara Sector 10",
        description: "5 street lights on Road 12, Uttara Sector 10 are not working. The area becomes very dark at night causing safety concerns.",
        category: "Electricity",
        location: "Uttara Sector 10, Road 12, Dhaka",
        city: "Dhaka",
        division: "Dhaka",
        latitude: 23.8759,
        longitude: 90.3795,
        status: "pending",
        priority: "medium",
        isEmergency: false,
        userId: citizens[2].id,
        departmentId: departments[3].id,
      },
    }),
    prisma.report.create({
      data: {
        title: "Drainage blocked in Banani",
        description: "The drain near Banani Chairman Bari is completely blocked. During rain, the road gets flooded with dirty water.",
        category: "Water",
        location: "Banani Chairman Bari, Dhaka",
        city: "Dhaka",
        division: "Dhaka",
        latitude: 23.7937,
        longitude: 90.4066,
        status: "in-progress",
        priority: "medium",
        isEmergency: false,
        userId: citizens[0].id,
        departmentId: departments[0].id,
      },
    }),
    prisma.report.create({
      data: {
        title: "Broken sidewalk near Motijheel",
        description: "The sidewalk tiles near Shapla Chattar, Motijheel are broken. Pedestrians face difficulty walking, especially elderly people.",
        category: "Roads",
        location: "Shapla Chattar, Motijheel, Dhaka",
        city: "Dhaka",
        division: "Dhaka",
        latitude: 23.7289,
        longitude: 90.4194,
        status: "resolved",
        priority: "low",
        isEmergency: false,
        rating: 5,
        feedback: "Excellent work! The sidewalk was repaired within 2 days. Thank you City Corporation!",
        resolvedAt: new Date(),
        userId: citizens[3].id,
        departmentId: departments[2].id,
      },
    }),
    prisma.report.create({
      data: {
        title: "Water supply disrupted in Chattogram",
        description: "No water supply in Nasirabad area for the past 2 days. Residents are facing severe difficulties.",
        category: "Water",
        location: "Nasirabad, Chattogram",
        city: "Chattogram",
        division: "Chattogram",
        latitude: 22.3569,
        longitude: 91.7832,
        status: "pending",
        priority: "high",
        isEmergency: false,
        userId: citizens[0].id,
        departmentId: departments[0].id,
      },
    }),
  ])
  console.log("✅ Created 7 sample reports\n")

  // Create Assignments
  console.log("📋 Creating assignments...")
  await Promise.all([
    prisma.assignment.create({
      data: {
        reportId: reports[0].id,
        officerId: officers[0].id,
        claimedAt: new Date(),
        notes: "Emergency assignment - repair team dispatched",
      },
    }),
    prisma.assignment.create({
      data: {
        reportId: reports[4].id,
        officerId: officers[1].id,
        claimedAt: new Date(),
        notes: "Drainage cleaning in progress",
      },
    }),
  ])
  console.log("✅ Created 2 assignments\n")

  // Create Maintenance Schedules
  console.log("📅 Creating maintenance schedules...")
  const now = new Date()
  await Promise.all([
    prisma.maintenanceSchedule.create({
      data: {
        title: "Monthly Water Pipeline Inspection",
        description: "Routine inspection of water pipelines in Dhanmondi area",
        scheduledDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        status: "scheduled",
        priority: "medium",
        departmentId: departments[0].id,
        assignedTo: officers[0].id,
        location: "Dhanmondi Area",
        city: "Dhaka",
        notes: "Check pump stations and main pipelines",
      },
    }),
    prisma.maintenanceSchedule.create({
      data: {
        title: "Weekly Garbage Collection Route Review",
        description: "Review and optimize garbage collection routes in Gulshan and Banani",
        scheduledDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        status: "scheduled",
        priority: "low",
        departmentId: departments[1].id,
        assignedTo: officers[2].id,
        location: "Gulshan & Banani",
        city: "Dhaka",
      },
    }),
    prisma.maintenanceSchedule.create({
      data: {
        title: "Road Repair - Uttara Sector 7",
        description: "Fill potholes and repair damaged roads in Uttara Sector 7",
        scheduledDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        status: "scheduled",
        priority: "high",
        departmentId: departments[2].id,
        assignedTo: officers[3].id,
        location: "Uttara Sector 7",
        city: "Dhaka",
        notes: "Bitumen and concrete materials required",
      },
    }),
    prisma.maintenanceSchedule.create({
      data: {
        title: "Transformer Maintenance - Mirpur",
        description: "Routine transformer inspection and maintenance in Mirpur area",
        scheduledDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        status: "completed",
        priority: "medium",
        departmentId: departments[3].id,
        assignedTo: officers[4].id,
        location: "Mirpur",
        city: "Dhaka",
        notes: "Successfully completed",
      },
    }),
  ])
  console.log("✅ Created 4 maintenance schedules\n")

  // Create Emergency Broadcasts
  console.log("🚨 Creating emergency broadcasts...")
  await Promise.all([
    prisma.emergencyBroadcast.create({
      data: {
        title: "Heavy Rainfall Warning - Dhaka Division",
        message: "Heavy to very heavy rainfall expected in Dhaka division tomorrow. Residents in low-lying areas are advised to stay alert and take necessary precautions.",
        severity: "warning",
        targetCity: "Dhaka",
        targetAll: false,
        sentBy: admin1.id,
        recipients: 5000,
      },
    }),
    prisma.emergencyBroadcast.create({
      data: {
        title: "Water Supply Maintenance Notice",
        message: "Water supply will be temporarily suspended in Mirpur area on Sunday from 10 AM to 3 PM for essential maintenance work. Please store water in advance.",
        severity: "info",
        targetCity: "Dhaka",
        targetAll: false,
        sentBy: admin2.id,
        recipients: 2500,
      },
    }),
  ])
  console.log("✅ Created 2 emergency broadcasts\n")

  // Print Summary
  console.log("═══════════════════════════════════════════════════════════")
  console.log("🎉 Database seeding completed for CityWatch Bangladesh!")
  console.log("═══════════════════════════════════════════════════════════\n")

  console.log("🔑 Test Login Credentials:")
  console.log("─────────────────────────────────────────────────────────────")
  console.log("\n👨‍💼 ADMIN ACCOUNTS:")
  console.log("   Email:    admin@citywatch.gov.bd")
  console.log("   Password: admin123")
  console.log("")
  console.log("   Email:    admin@dncc.gov.bd")
  console.log("   Password: admin123")

  console.log("\n👮 OFFICER ACCOUNTS:")
  console.log("   Water:       water.officer@wasa.gov.bd / officer123")
  console.log("   Waste:       waste.officer@dncc.gov.bd / officer123")
  console.log("   Roads:       roads.officer@rhd.gov.bd / officer123")
  console.log("   Electricity: electric.officer@bpdb.gov.bd / officer123")

  console.log("\n👤 CITIZEN ACCOUNTS:")
  console.log("   Email:    citizen@gmail.com / citizen123")
  console.log("   Email:    rahima@gmail.com / citizen123")
  console.log("═══════════════════════════════════════════════════════════\n")
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