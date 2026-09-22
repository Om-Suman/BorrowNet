import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Photography",
    slug: "photography",
    description: "DSLRs, mirrorless bodies, prime lenses & studio strobes",
    icon: "📷",
  },
  {
    name: "Video & Film",
    slug: "video-film",
    description:
      "Cinema rigs, gimbals, field monitors & wireless video transmitters",
    icon: "🎥",
  },
  {
    name: "Audio & Music",
    slug: "audio-music",
    description: "Podcast mics, sound cards, studio monitors & stage mixers",
    icon: "🎙️",
  },
  {
    name: "Power Tools",
    slug: "power-tools",
    description: "Hammer drills, rotary sanders, angle grinders & battery kits",
    icon: "🔨",
  },
  {
    name: "Camping & Outdoor",
    slug: "camping-outdoor",
    description: "All-weather tents, trekking rucksacks & portable stoves",
    icon: "⛺",
  },
  {
    name: "Sports & Fitness",
    slug: "sports-fitness",
    description:
      "Smart cycle trainers, cricket bowling machines & trekking poles",
    icon: "🚴",
  },
  {
    name: "Party & Events",
    slug: "party-events",
    description: "High-output party speakers, disco lights & smoke machines",
    icon: "🎉",
  },
  {
    name: "Kitchen & Cooking",
    slug: "kitchen-cooking",
    description: "Espresso makers, stand mixers, air fryers & tandoor ovens",
    icon: "🍳",
  },
  {
    name: "Garden & Landscaping",
    slug: "garden-landscaping",
    description: "High-pressure washers, lawn trimmers & leaf blowers",
    icon: "🌿",
  },
  {
    name: "Electronics & Tech",
    slug: "electronics-tech",
    description: "Compact travel drones, 4K home projectors & VR headsets",
    icon: "💻",
  },
  {
    name: "Musical Instruments",
    slug: "musical-instruments",
    description:
      "Acoustic/electric guitars, digital pianos & electronic drum kits",
    icon: "🎸",
  },
  {
    name: "DIY & Workshop",
    slug: "diy-workshop",
    description:
      "Laser distance meters, precision multimeters & wood carving sets",
    icon: "🛠️",
  },
];

const usersData = [
  {
    email: "admin@borrownet.com",
    name: "BorrowNet Admin",
    role: "ADMIN",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
    bio: "BorrowNet India Community Safety & Trust Operations.",
    location: "Bengaluru, Karnataka",
    reputationScore: 99,
  },
  {
    email: "rohan@borrownet.com",
    name: "Rohan Sharma",
    role: "USER",
    avatarUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&h=256&q=80",
    bio: "Independent filmmaker and commercial ad creator based in Mumbai. Sharing pro cine gear.",
    location: "Bandra West, Mumbai",
    reputationScore: 96,
  },
  {
    email: "ananya@borrownet.com",
    name: "Ananya Iyer",
    role: "USER",
    avatarUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80",
    bio: "Wedding and fashion photographer. Passionate about portrait primes & mirrorless systems.",
    location: "Indiranagar, Bengaluru",
    reputationScore: 94,
  },
  {
    email: "vikram@borrownet.com",
    name: "Vikram Malhotra",
    role: "USER",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80",
    bio: "Himalayan trek leader & motorcyclist. Sharing tested expedition and camping gear.",
    location: "HSR Layout, Bengaluru",
    reputationScore: 92,
  },
  {
    email: "priya@borrownet.com",
    name: "Priya Nair",
    role: "USER",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
    bio: "Indie music producer, podcast sound designer and vocalist.",
    location: "Hauz Khas, New Delhi",
    reputationScore: 95,
  },
  {
    email: "kabir@borrownet.com",
    name: "Kabir Mehta",
    role: "USER",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80",
    bio: "Architect and woodworking hobbyist. Passionate about precision power tools.",
    location: "Koregaon Park, Pune",
    reputationScore: 90,
  },
];

const itemsData = [
  {
    title: "Sony FX3 Full-Frame Cinema Camera Kit (4K 120fps)",
    description:
      "Includes top audio handle, 2x 160GB Type A CFexpress cards, 3 original NP-FZ100 batteries, fast dual charger & SmallRig cage. Ideal for music videos & wedding cinematography in Mumbai.",
    condition: "LIKE_NEW",
    pricePerDay: 3500.0,
    depositValue: 25000.0,
    location: "Bandra West, Mumbai",
    rules:
      "Handle with utmost care. Do not shoot under heavy monsoon rain without weather housing. ID verification mandatory upon pickup.",
    minDays: 1,
    maxDays: 10,
    categorySlug: "video-film",
    ownerEmail: "rohan@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    title: "Shure SM7B Vocal Dynamic Mic + Cloudlifter CL-1 Kit",
    description:
      "Broadcast-standard vocal microphone setup. Comes with Cloudlifter inline preamp, desktop boom stand, and gold-plated XLR cable. Perfect for podcasts and YouTube voiceovers.",
    condition: "LIKE_NEW",
    pricePerDay: 1200.0,
    depositValue: 8000.0,
    location: "Hauz Khas, New Delhi",
    rules:
      "Requires audio interface with +48V phantom power. Clean windscreen provided with UV sanitation.",
    minDays: 1,
    maxDays: 20,
    categorySlug: "audio-music",
    ownerEmail: "priya@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    title: "Bosch GSB 600 Professional Impact Drill & 100-pc Masonry Kit",
    description:
      "Powerful 600W reversible hammer drill with auxiliary handle and depth gauge. Includes complete bit set for concrete, brick, tile, and wood. Ideal for home interior projects.",
    condition: "GOOD",
    pricePerDay: 450.0,
    depositValue: 2000.0,
    location: "Koregaon Park, Pune",
    rules:
      "Clean dust off vents before returning. Do not use blunt bits on RCC lintels.",
    minDays: 1,
    maxDays: 7,
    categorySlug: "power-tools",
    ownerEmail: "kabir@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    title: "Quechua 3-Person Waterproof Camping Tent + 2 Sleeping Bags",
    description:
      "Tested in Western Ghats & Himachal. Quick 10-minute setup, 2000mm waterproof PU coating, mosquito net doors, groundsheet footprint, and two 5°C comfort sleeping bags included.",
    condition: "LIKE_NEW",
    pricePerDay: 750.0,
    depositValue: 3500.0,
    location: "HSR Layout, Bengaluru",
    rules:
      "Ensure tent is completely dry before repacking to prevent damp odor. Never cook inside the tent.",
    minDays: 2,
    maxDays: 14,
    categorySlug: "camping-outdoor",
    ownerEmail: "vikram@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    title: "DJI Mini 4 Pro Drone Fly More Combo (Sub-249g)",
    description:
      "No DGCA pilot license required for sub-250g recreational flying. Omnidirectional obstacle sensing, 4K/60fps HDR video, vertical Instagram Reels mode, 3 batteries (90 min total fly time).",
    condition: "LIKE_NEW",
    pricePerDay: 2800.0,
    depositValue: 18000.0,
    location: "Indiranagar, Bengaluru",
    rules:
      "Follow DGCA No-Fly zones (airports, military cantonments). Avoid flying during high winds or rain.",
    minDays: 1,
    maxDays: 7,
    categorySlug: "electronics-tech",
    ownerEmail: "ananya@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    title: "Yamaha F310 Full-Size Acoustic Guitar with Padded Gig Bag",
    description:
      "Indias most beloved acoustic guitar. Solid spruce top, rosewood fretboard, warm resonant tone. Strung with fresh DAddario 11-gauge phosphor bronze strings. Includes pick & capo.",
    condition: "GOOD",
    pricePerDay: 500.0,
    depositValue: 3000.0,
    location: "Hauz Khas, New Delhi",
    rules:
      "Keep inside padded gig bag when traveling in auto/metro. Do not keep in direct sunlight.",
    minDays: 2,
    maxDays: 30,
    categorySlug: "musical-instruments",
    ownerEmail: "priya@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    title: "Canon EOS R6 Mark II + RF 24-70mm f/2.8L IS USM (Wedding Kit)",
    description:
      "Premier wedding and portrait mirrorless kit. 40fps high-speed bursts, stellar low-light ISO, dual UHS-II SD slots, 6K RAW HDMI out, and weather-sealed red-ring zoom lens.",
    condition: "LIKE_NEW",
    pricePerDay: 3200.0,
    depositValue: 22000.0,
    location: "Indiranagar, Bengaluru",
    rules:
      "UV filter must remain installed on the front element at all times. Physical ID and address proof checked.",
    minDays: 1,
    maxDays: 14,
    categorySlug: "photography",
    ownerEmail: "ananya@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    title: "Bosch Professional 360° Self-Leveling Cross-Line Laser",
    description:
      "High-visibility green beam laser for false ceiling, tile layout, kitchen cabinet leveling, and modular interior fittings. Includes heavy duty 1.5m crank tripod.",
    condition: "LIKE_NEW",
    pricePerDay: 400.0,
    depositValue: 1500.0,
    location: "Koregaon Park, Pune",
    rules:
      "Lock pendulum before switching off or transporting. Handle tripod with care.",
    minDays: 1,
    maxDays: 7,
    categorySlug: "diy-workshop",
    ownerEmail: "kabir@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    title: "JBL PartyBox 310 Portable Bluetooth Party Speaker (240W)",
    description:
      "Massive 240W RMS sound output with dynamic synchronized light shows, bass boost, and built-in wheels with telescopic handle. 18-hour battery life. Perfect for terrace parties & Diwali get-togethers.",
    condition: "GOOD",
    pricePerDay: 1800.0,
    depositValue: 10000.0,
    location: "Bandra West, Mumbai",
    rules:
      "Respect local society sound curfew after 10 PM. Avoid splashing water on charging ports.",
    minDays: 1,
    maxDays: 4,
    categorySlug: "party-events",
    ownerEmail: "rohan@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    title: "Garmin Edge 530 GPS + Wahoo Smart Indoor Cycling Trainer",
    description:
      "Direct-drive indoor cycling setup for monsoon season and endurance training. Compatible with Zwift and Strava. Includes front wheel riser block and Shimano 11-speed cassette.",
    condition: "LIKE_NEW",
    pricePerDay: 1400.0,
    depositValue: 9000.0,
    location: "HSR Layout, Bengaluru",
    rules:
      "Use sweat guard over bike frame while riding. Fits both quick-release and thru-axle frames.",
    minDays: 3,
    maxDays: 30,
    categorySlug: "sports-fitness",
    ownerEmail: "vikram@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    title: "Breville / Philips Barista Brew Espresso Machine with Frother",
    description:
      "Authentic 15-bar Italian pump espresso machine with stainless steel portafilter and high-pressure steam wand for cafe-style cappuccinos and flat whites at home.",
    condition: "LIKE_NEW",
    pricePerDay: 850.0,
    depositValue: 4500.0,
    location: "Indiranagar, Bengaluru",
    rules:
      "Only use RO or bottled drinking water to avoid mineral scale buildup. Wipe steam wand with damp cloth immediately after frothing.",
    minDays: 2,
    maxDays: 14,
    categorySlug: "kitchen-cooking",
    ownerEmail: "ananya@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    title: "Kärcher K2 Universal High-Pressure Washer (110 Bar)",
    description:
      "Heavy duty pressure washer with dirt blaster spray lance and high-pressure foam nozzle. Ideal for deep cleaning SUVs, bikes, driveways, solar panels, and terrace tiles.",
    condition: "GOOD",
    pricePerDay: 650.0,
    depositValue: 3000.0,
    location: "Koregaon Park, Pune",
    rules:
      "Ensure continuous water supply before starting the motor to avoid dry running. Drain excess water before packing.",
    minDays: 1,
    maxDays: 3,
    categorySlug: "garden-landscaping",
    ownerEmail: "kabir@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1557429287-b2e26467fc2b?auto=format&fit=crop&w=1000&q=80",
    ],
  },
];

async function main() {
  console.log("Seeding categories...");
  const categoryMap = new Map();
  for (const cat of categories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
      },
      create: cat,
    });
    categoryMap.set(cat.slug, record.id);
  }

  console.log("Seeding Indian user accounts...");
  const passwordHash = await bcrypt.hash("Password123!", 12);
  const adminPasswordHash = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || "AdminPass123!",
    12,
  );
  const userMap = new Map();

  for (const u of usersData) {
    const hash = u.role === "ADMIN" ? adminPasswordHash : passwordHash;
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
        location: u.location,
        reputationScore: u.reputationScore,
        role: u.role,
        isVerified: true,
      },
      create: {
        email: u.email,
        name: u.name,
        passwordHash: hash,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
        location: u.location,
        reputationScore: u.reputationScore,
        role: u.role,
        isVerified: true,
      },
    });
    userMap.set(u.email, user.id);
  }

  console.log("Resetting and seeding Indian equipment catalog...");
  // Clean up existing item images and items for fresh Indian catalog
  await prisma.itemImage.deleteMany();
  await prisma.item.deleteMany();

  for (const item of itemsData) {
    const categoryId = categoryMap.get(item.categorySlug);
    const ownerId = userMap.get(item.ownerEmail);

    if (!categoryId || !ownerId) continue;

    const itemRecord = await prisma.item.create({
      data: {
        title: item.title,
        description: item.description,
        condition: item.condition,
        pricePerDay: item.pricePerDay,
        depositValue: item.depositValue,
        location: item.location,
        rules: item.rules,
        minDays: item.minDays,
        maxDays: item.maxDays,
        ownerId,
        categoryId,
        status: "ACTIVE",
      },
    });

    for (let i = 0; i < item.images.length; i++) {
      await prisma.itemImage.create({
        data: {
          itemId: itemRecord.id,
          url: item.images[i],
          order: i,
        },
      });
    }
  }

  console.log(
    "Seed completed successfully with authentic Indian equipment and profiles!",
  );
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
