import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Power Tools",
    slug: "power-tools",
    description: "Hammer drills, impact drivers, rotary tools, angle grinders & battery kits",
    icon: "🔨",
  },
  {
    name: "Pressure Cleaning",
    slug: "pressure-cleaning",
    description: "Commercial pressure washers, surface cleaners, turbo nozzles & foam guns",
    icon: "💦",
  },
  {
    name: "Lawn & Garden",
    slug: "lawn-garden-machinery",
    description: "Cordless mowers, backpack leaf blowers, hedge trimmers & aerators",
    icon: "🌿",
  },
  {
    name: "Ladders & Scaffolding",
    slug: "outdoor-diy-rigging",
    description: "Multi-position extension ladders, scaffolding towers & roofing safety gear",
    icon: "🪜",
  },
  {
    name: "Generators & Power",
    slug: "generators-site-power",
    description: "Inverter generators, portable power stations & heavy-duty distribution",
    icon: "⚡",
  },
  {
    name: "Concrete & Masonry",
    slug: "concrete-masonry",
    description: "SDS-Max rotary demolition hammers, cement mixers & plate compactors",
    icon: "🧱",
  },
  {
    name: "Plumbing & Drains",
    slug: "plumbing-drains",
    description: "Electric drain snakes, pipe threaders, inspection endoscopes & crimpers",
    icon: "🔧",
  },
  {
    name: "Carpentry & Woodworking",
    slug: "carpentry-woodworking",
    description: "Sliding compound miter saws, table saws, planers, jointers & routers",
    icon: "🪵",
  },
  {
    name: "Cameras & Studio Lights",
    slug: "cameras-studio-lights",
    description: "Cinema camera kits, full-frame bodies, prime glass, gimbals & LED strobes",
    icon: "🎥",
  },
  {
    name: "Tents & Trail Gear",
    slug: "tents-trail-gear",
    description: "4-season expedition tents, trekking backpacks, sleeping bags & stoves",
    icon: "⛺",
  },
  {
    name: "Pressure Washing & Landscaping",
    slug: "pressure-washing-landscaping",
    description: "Gas pressure washers, commercial aerators & post hole diggers",
    icon: "💧",
  },
  {
    name: "Sound Systems & Projectors",
    slug: "sound-systems-projectors",
    description: "QSC powered PA speakers, subwoofers, 4K laser projectors & stage mixers",
    icon: "🔊",
  },
  {
    name: "Kayaks & Mobility",
    slug: "kayaks-mobility",
    description: "Inflatable kayaks, stand-up paddleboards, e-cargo bikes & bike trailers",
    icon: "🚣",
  },
  {
    name: "Photography",
    slug: "photography",
    description: "DSLRs, mirrorless bodies, portrait lenses & studio flash triggers",
    icon: "📷",
  },
  {
    name: "Video & Film",
    slug: "video-film",
    description: "Handheld gimbals, field monitors, wireless transmitters & matte boxes",
    icon: "🎬",
  },
  {
    name: "Audio & Music",
    slug: "audio-music",
    description: "Podcast mics, USB audio interfaces, studio monitors & headphones",
    icon: "🎙️",
  },
  {
    name: "Party & Events",
    slug: "party-events",
    description: "DJ mixing controllers, party speakers, disco lights & smoke machines",
    icon: "🎉",
  },
  {
    name: "Sports & Fitness",
    slug: "sports-fitness",
    description: "Smart indoor bike trainers, road cycles, cricket bowling machines",
    icon: "🚴",
  },
  {
    name: "Kitchen & Cooking",
    slug: "kitchen-cooking",
    description: "Espresso machines, planetary stand mixers, air fryers & tandoors",
    icon: "🍳",
  },
  {
    name: "Electronics & Tech",
    slug: "electronics-tech",
    description: "Sub-249g travel camera drones, action cams & VR headsets",
    icon: "💻",
  },
  {
    name: "Musical Instruments",
    slug: "musical-instruments",
    description: "Acoustic/electric guitars, digital pianos & electronic drum kits",
    icon: "🎸",
  },
  {
    name: "DIY & Workshop",
    slug: "diy-workshop",
    description: "360° laser levels, digital multimeters & wood carving rotary kits",
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
    bio: "BorrowNet Community Safety & Trust Operations Lead.",
    location: "Bengaluru, Karnataka",
    reputationScore: 99,
  },
  {
    email: "alex@borrownet.com",
    name: "Alex Tiwari",
    role: "USER",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80",
    bio: "DIY enthusiast and renovation specialist. Sharing professional Milwaukee and Bosch gear.",
    location: "Indiranagar, Bengaluru",
    reputationScore: 98,
  },
  {
    email: "dave@borrownet.com",
    name: "Dev Malhotra",
    role: "USER",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80",
    bio: "Commercial property manager and equipment collector in Koramangala.",
    location: "Koramangala, Bengaluru",
    reputationScore: 96,
  },
  {
    email: "chloe@borrownet.com",
    name: "Charu Sharma",
    role: "USER",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80",
    bio: "Custom furniture maker and woodworker. Always happy to share precision cutting tools.",
    location: "HSR Layout, Bengaluru",
    reputationScore: 97,
  },
  {
    email: "marcus@borrownet.com",
    name: "Manas Patel",
    role: "USER",
    avatarUrl:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&h=256&q=80",
    bio: "Landscape architect and outdoor adventurer in Indiranagar.",
    location: "Indiranagar, Bengaluru",
    reputationScore: 95,
  },
  {
    email: "keith@borrownet.com",
    name: "Karan Bhatia",
    role: "USER",
    avatarUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&h=256&q=80",
    bio: "Civil contractor and interior builder sharing heavy-duty masonry equipment.",
    location: "Whitefield, Bengaluru",
    reputationScore: 94,
  },
  {
    email: "sarah@borrownet.com",
    name: "Shweta Joshi",
    role: "USER",
    avatarUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80",
    bio: "Home improvement enthusiast and community organizer.",
    location: "Koramangala, Bengaluru",
    reputationScore: 95,
  },
  {
    email: "ryan@borrownet.com",
    name: "Rohan Verma",
    role: "USER",
    avatarUrl:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&h=256&q=80",
    bio: "Gardener and weekend yard specialist based in BTM Layout.",
    location: "BTM Layout, Bengaluru",
    reputationScore: 93,
  },
  {
    email: "elena@borrownet.com",
    name: "Esha Roy",
    role: "USER",
    avatarUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&h=256&q=80",
    bio: "Pop-up event producer. Providing reliable silent inverter power for creators.",
    location: "Indiranagar, Bengaluru",
    reputationScore: 99,
  },
  {
    email: "pooja@borrownet.com",
    name: "Pooja Reddy",
    role: "USER",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&h=256&q=80",
    bio: "Commercial photographer and AV producer with the Bengaluru Creators Guild.",
    location: "Indiranagar, Bengaluru",
    reputationScore: 99,
  },
  {
    email: "ananya@borrownet.com",
    name: "Ananya Iyer",
    role: "USER",
    avatarUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80",
    bio: "Fashion photographer & aerial videographer based in Koramangala.",
    location: "Koramangala, Bengaluru",
    reputationScore: 94,
  },
  {
    email: "vikram@borrownet.com",
    name: "Vikram Malhotra",
    role: "USER",
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&h=256&q=80",
    bio: "Himalayan expedition leader & endurance cyclist in HSR Layout.",
    location: "HSR Layout, Bengaluru",
    reputationScore: 96,
  },
  {
    email: "priya@borrownet.com",
    name: "Priya Nair",
    role: "USER",
    avatarUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80",
    bio: "Podcast host and sound designer sharing studio vocal equipment.",
    location: "Hauz Khas, New Delhi",
    reputationScore: 95,
  },
  {
    email: "kabir@borrownet.com",
    name: "Kabir Mehta",
    role: "USER",
    avatarUrl:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&h=256&q=80",
    bio: "Architect & woodworking craftsman in Koregaon Park, Pune.",
    location: "Koregaon Park, Pune",
    reputationScore: 92,
  },
];

// Curated items aligned with frontend components, each with 100% unique images
const itemsData = [
  // 1. Browse Page Item 1: Milwaukee Hammer Drill
  {
    title: "Milwaukee M18 FUEL Hammer Drill & Impact Driver Set (2x Batteries)",
    description:
      "Heavy-duty brushless cordless hammer drill and 1/4-inch hex impact driver. Includes two 5.0Ah REDLITHIUM XC batteries, rapid multi-voltage charger, side handle, and hard carrying case.",
    condition: "LIKE_NEW",
    pricePerDay: 550.0,
    depositValue: 2500.0,
    location: "Indiranagar, Bengaluru",
    rules:
      "Keep batteries away from direct moisture. Please blow dust off drill chuck before return.",
    minDays: 1,
    maxDays: 14,
    categorySlug: "power-tools",
    ownerEmail: "alex@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // 2. Browse Page Item 2: Simpson Megablaster Pressure Washer
  {
    title: "Simpson Megablaster 3400 PSI Commercial Pressure Washer",
    description:
      "Commercial-grade pressure washer powered by a Honda commercial engine. Includes 5 quick-connect spray tips, 50ft steel-braided high-pressure hose, and detergent injection kit. Ideal for driveways, tiles, and exterior facades.",
    condition: "LIKE_NEW",
    pricePerDay: 899.0,
    depositValue: 4000.0,
    location: "Koramangala, Bengaluru",
    rules:
      "Ensure steady water supply before turning on pump. Do not point spray wand at persons, electrical outlets, or pets.",
    minDays: 1,
    maxDays: 7,
    categorySlug: "pressure-cleaning",
    ownerEmail: "dave@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // 3. Browse Page Item 3: DeWalt Sliding Miter Saw
  {
    title: "DeWalt 12-Inch Sliding Compound Miter Saw with Mobile Stand",
    description:
      "Dual-bevel sliding compound miter saw featuring XPS cross-cut positioning system for ultra-accurate cuts in trim, molding, and framing. Comes with heavy-duty wheeled folding stand.",
    condition: "LIKE_NEW",
    pricePerDay: 750.0,
    depositValue: 3500.0,
    location: "HSR Layout, Bengaluru",
    rules:
      "Always wear eye protection. Do not cut metal or masonry on this blade. Use dust collection port.",
    minDays: 1,
    maxDays: 10,
    categorySlug: "carpentry-woodworking",
    ownerEmail: "chloe@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // 4. Browse Page Item 4: Ryobi 40V Cordless Brushless Lawn Mower
  {
    title: "Ryobi 40V Cordless Brushless Lawn Mower + Fast Charger Kit",
    description:
      "Push-button start cordless lawn mower with 20-inch poly deck, single-point height adjustment, mulch plug, and grass collection bag. Includes two 40V 6.0Ah batteries.",
    condition: "LIKE_NEW",
    pricePerDay: 650.0,
    depositValue: 3000.0,
    location: "Indiranagar, Bengaluru",
    rules:
      "Clear lawn of stones and branches before mowing. Hose underside of deck clean before return.",
    minDays: 1,
    maxDays: 5,
    categorySlug: "lawn-garden-machinery",
    ownerEmail: "marcus@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // 5. Browse Page Item 5: Bosch SDS-Max Rotary Hammer
  {
    title: "Bosch 1-9/16 in. SDS-Max Rotary Hammer with Chisels & Case",
    description:
      "Heavy-duty combination rotary hammer delivering 6.1 ft-lbs of impact energy. Includes flat chisel, pointed bull-point chisel, SDS-Max core adapter, and auxiliary vibration control handle.",
    condition: "LIKE_NEW",
    pricePerDay: 950.0,
    depositValue: 4500.0,
    location: "Whitefield, Bengaluru",
    rules:
      "Use SDS-Max grease on bit shanks. Clean dust out of motor housing vents.",
    minDays: 1,
    maxDays: 7,
    categorySlug: "concrete-masonry",
    ownerEmail: "keith@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // 6. Browse Page Item 6: Little Giant 3-in-1 Extension Ladder
  {
    title: "Little Giant King Kombo 3-in-1 Fiberglass Extension Ladder",
    description:
      "Non-conductive fiberglass multi-position ladder. Converts seamlessly from stepladder to leaning ladder and extension ladder. Features rotating wall pad for corners and studs.",
    condition: "GOOD",
    pricePerDay: 450.0,
    depositValue: 2000.0,
    location: "Koramangala, Bengaluru",
    rules:
      "Ensure all hinge locks click into place before climbing. Never exceed 150 kg working load.",
    minDays: 1,
    maxDays: 14,
    categorySlug: "outdoor-diy-rigging",
    ownerEmail: "sarah@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // 7. Browse Page Item 7: STIHL Backpack Leaf Blower
  {
    title: "STIHL Gas Powered Backpack Leaf Blower (Full Tank Inc.)",
    description:
      "Commercial-grade backpack leaf blower with anti-vibration harness and high-output airflow for sweeping large lawns, parking lots, and garden debris. Supplied with full tank of 50:1 pre-mix fuel.",
    condition: "GOOD",
    pricePerDay: 599.0,
    depositValue: 2500.0,
    location: "BTM Layout, Bengaluru",
    rules:
      "Only use 2-stroke oil pre-mix fuel. Wear ear protection during operation.",
    minDays: 1,
    maxDays: 5,
    categorySlug: "lawn-garden-machinery",
    ownerEmail: "ryan@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1617196034183-421b4917c92d?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // 8. Browse Page Item 8: Generac Portable Inverter Generator
  {
    title: "Generac 3300-Watt Portable Inverter Generator (Ultra Quiet)",
    description:
      "Clean inverter electricity safe for laptops, cameras, sound consoles, and power tools. Super quiet 58 dBA rating with economy throttle mode, USB charging ports, and parallel capability.",
    condition: "LIKE_NEW",
    pricePerDay: 1100.0,
    depositValue: 5000.0,
    location: "Indiranagar, Bengaluru",
    rules:
      "Operate strictly outdoors in well-ventilated areas. Never run generator indoors or inside a parking garage.",
    minDays: 1,
    maxDays: 10,
    categorySlug: "generators-site-power",
    ownerEmail: "elena@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1609137144822-261541484643?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // 9. Home Page Spotlight 1: Honda GX200 3200 PSI Pressure Washer
  {
    title: "Honda GX200 3200 PSI Pressure Washer",
    description:
      "Direct-drive high-performance pressure washer engineered for terrace washing, vehicle detailing, and exterior concrete restoration in Bengaluru.",
    condition: "LIKE_NEW",
    pricePerDay: 799.0,
    depositValue: 3500.0,
    location: "Indiranagar, Bengaluru",
    rules:
      "Check oil level before starting. Connect inlet hose before pulling recoil starter.",
    minDays: 1,
    maxDays: 7,
    categorySlug: "pressure-washing-landscaping",
    ownerEmail: "alex@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1557429287-b2e26467fc2b?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // 10. Home Page Spotlight 2: Sony Alpha A7 IV Kit
  {
    title: "Sony Alpha A7 IV Kit + 24-70mm GM",
    description:
      "33MP full-frame hybrid mirrorless camera paired with Sony FE 24-70mm f/2.8 G Master zoom lens. Includes 2 high-capacity batteries, 128GB V90 UHS-II SD card, and protective hard case.",
    condition: "LIKE_NEW",
    pricePerDay: 1899.0,
    depositValue: 8000.0,
    location: "Indiranagar, Bengaluru",
    rules:
      "Front UV filter must remain on lens at all times. Physical government ID verification required.",
    minDays: 1,
    maxDays: 14,
    categorySlug: "cameras-studio-lights",
    ownerEmail: "pooja@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // 11. Home Page Spotlight 3: The North Face Wawona 6-Person Tent
  {
    title: "The North Face Wawona 6-Person Tent",
    description:
      "Spacious double-wall 6-person dome tent with massive vestibule porch, internal gear pockets, and high ceiling. Tested in Western Ghats rain and hill station winds.",
    condition: "LIKE_NEW",
    pricePerDay: 599.0,
    depositValue: 2500.0,
    location: "HSR Layout, Bengaluru",
    rules:
      "Air-dry tent thoroughly before packing. Never use open flames or cook inside the vestibule.",
    minDays: 2,
    maxDays: 14,
    categorySlug: "tents-trail-gear",
    ownerEmail: "vikram@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1478827536114-da961b7f86d2?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // 12. Cine Camera Rig: Sony FX3 Cinema Kit
  {
    title: "Sony FX3 Full-Frame Cinema Camera Kit (4K 120fps)",
    description:
      "Full-frame cinema line body with top audio XLR handle, SmallRig cage, 2x 160GB CFexpress Type A cards, fast dual charger, and 3 original batteries. Ideal for music videos and ads.",
    condition: "LIKE_NEW",
    pricePerDay: 3500.0,
    depositValue: 25000.0,
    location: "Koramangala, Bengaluru",
    rules:
      "Do not expose to heavy monsoon rains without certified weather housing. ID verification required.",
    minDays: 1,
    maxDays: 10,
    categorySlug: "cameras-studio-lights",
    ownerEmail: "dave@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // 13. Sound Systems: QSC K12.2 PA Speakers
  {
    title: "QSC K12.2 PA Speaker Set (Pair) with Stands & Cables",
    description:
      "Industry-standard 2000W Class-D active PA loudspeakers with 12-inch woofers, DSP EQ presets, heavy-duty aluminium speaker stands, and balanced Mogami XLR audio cables.",
    condition: "LIKE_NEW",
    pricePerDay: 1400.0,
    depositValue: 7000.0,
    location: "Indiranagar, Bengaluru",
    rules:
      "Do not drive into red clip limiters. Keep away from pool splashes or open rain.",
    minDays: 1,
    maxDays: 5,
    categorySlug: "sound-systems-projectors",
    ownerEmail: "pooja@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // 14. Kayaks & Mobility: Inflatable Stand-Up Paddleboard
  {
    title: "Inflatable Stand-Up Paddleboard Kit (10'6\") with Pump & Paddle",
    description:
      "All-around drop-stitch SUP board with dual-action hand pump, carbon adjustable paddle, safety ankle leash, waterproof phone dry bag, and heavy-duty travel backpack.",
    condition: "LIKE_NEW",
    pricePerDay: 850.0,
    depositValue: 3500.0,
    location: "Indiranagar, Bengaluru",
    rules:
      "Rinse with fresh water after use. Always wear supplied personal flotation device (PFD).",
    minDays: 1,
    maxDays: 10,
    categorySlug: "kayaks-mobility",
    ownerEmail: "marcus@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // 15. Audio & Studio: Shure SM7B Vocal Mic Kit
  {
    title: "Shure SM7B Vocal Dynamic Mic + Cloudlifter CL-1 Kit",
    description:
      "Broadcast vocal microphone standard. Includes Cloudlifter inline preamp, desktop boom stand, and gold-plated XLR cable. Crystal-clear recording for podcasts and YouTube voiceovers.",
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
  // 16. Tech: DJI Mini 4 Pro Drone Combo
  {
    title: "DJI Mini 4 Pro Drone Fly More Combo (Sub-249g)",
    description:
      "No DGCA pilot license required for sub-250g recreational flying. Omnidirectional obstacle sensing, 4K/60fps HDR video, vertical Instagram Reels mode, and 3 batteries (90 min flight time).",
    condition: "LIKE_NEW",
    pricePerDay: 2800.0,
    depositValue: 18000.0,
    location: "Koramangala, Bengaluru",
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
  // 17. Plumbing & Drains: Ridgid Heavy-Duty Electric Drain Auger
  {
    title: "Ridgid Heavy-Duty 50ft Electric Drain Auger / Snake",
    description:
      "Commercial motor-driven plumbing drain cleaner with auto-feed cable mechanism. Quickly clears grease, hair, and root clogs from 1.5-inch to 4-inch pipes without harsh chemicals.",
    condition: "GOOD",
    pricePerDay: 700.0,
    depositValue: 3000.0,
    location: "Whitefield, Bengaluru",
    rules:
      "Wear heavy leather work gloves provided. Wash and wipe cable with lubricant after unclogging.",
    minDays: 1,
    maxDays: 3,
    categorySlug: "plumbing-drains",
    ownerEmail: "keith@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // 18. Concrete & Masonry: Belle Electric Concrete Mixer
  {
    title: "Belle Portable Electric Concrete Mixer (130L Drum)",
    description:
      "Compact tipper concrete mixer on puncture-proof transport wheels. Mixes full barrow load of concrete, mortar, or stucco in under 4 minutes with quiet 230V electric motor.",
    condition: "GOOD",
    pricePerDay: 900.0,
    depositValue: 4000.0,
    location: "Koramangala, Bengaluru",
    rules:
      "Wash drum thoroughly with hose and gravel wash before wet mortar cures inside drum.",
    minDays: 1,
    maxDays: 7,
    categorySlug: "concrete-masonry",
    ownerEmail: "sarah@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // 19. Musical Instruments: Yamaha Acoustic Guitar
  {
    title: "Yamaha F310 Full-Size Acoustic Guitar with Padded Gig Bag",
    description:
      "Beloved Indian acoustic guitar. Solid spruce top, rosewood fretboard, warm resonant tone. Freshly restrung with D'Addario 11-gauge strings. Includes padded gig bag, capo, and picks.",
    condition: "GOOD",
    pricePerDay: 500.0,
    depositValue: 3000.0,
    location: "Hauz Khas, New Delhi",
    rules:
      "Keep inside padded gig bag during transport. Do not store in hot cars or direct sunlight.",
    minDays: 2,
    maxDays: 30,
    categorySlug: "musical-instruments",
    ownerEmail: "priya@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // 20. Photography: Canon EOS R6 Mark II Wedding Kit
  {
    title: "Canon EOS R6 Mark II + RF 24-70mm f/2.8L IS USM",
    description:
      "Premier wedding and portrait mirrorless kit. 40fps high-speed bursts, stellar low-light ISO, dual UHS-II SD slots, 6K RAW HDMI out, and weather-sealed red-ring zoom lens.",
    condition: "LIKE_NEW",
    pricePerDay: 3200.0,
    depositValue: 22000.0,
    location: "Koramangala, Bengaluru",
    rules:
      "UV filter must remain installed on the front element at all times. Physical ID and address verification required.",
    minDays: 1,
    maxDays: 14,
    categorySlug: "photography",
    ownerEmail: "ananya@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // 21. Party & Events: JBL PartyBox 310 Speaker
  {
    title: "JBL PartyBox 310 Portable Bluetooth Party Speaker (240W)",
    description:
      "Massive 240W RMS sound output with dynamic synchronized light shows, bass boost, and built-in wheels with telescopic handle. 18-hour battery life. Perfect for terrace parties & gatherings.",
    condition: "GOOD",
    pricePerDay: 1800.0,
    depositValue: 10000.0,
    location: "Koramangala, Bengaluru",
    rules:
      "Respect local residential sound guidelines after 10 PM. Avoid splashing water on charging ports.",
    minDays: 1,
    maxDays: 4,
    categorySlug: "party-events",
    ownerEmail: "dave@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // 22. Sports & Fitness: Garmin Edge + Wahoo Smart Trainer
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
  // 23. Kitchen & Culinary: Breville Barista Brew Espresso Machine
  {
    title: "Breville / Philips Barista Brew Espresso Machine with Frother",
    description:
      "Authentic 15-bar Italian pump espresso machine with stainless steel portafilter and high-pressure steam wand for cafe-style flat whites, cappuccinos, and espressos at home.",
    condition: "LIKE_NEW",
    pricePerDay: 850.0,
    depositValue: 4500.0,
    location: "Koramangala, Bengaluru",
    rules:
      "Only use filtered or bottled drinking water to avoid mineral scale. Wipe steam wand with damp cloth immediately after frothing.",
    minDays: 2,
    maxDays: 14,
    categorySlug: "kitchen-cooking",
    ownerEmail: "ananya@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // 24. Camping & Outdoor: Quechua 3-Person Waterproof Tent
  {
    title: "Quechua 3-Person Waterproof Camping Tent + 2 Sleeping Bags",
    description:
      "Quick 10-minute pitch dome tent with 2000mm waterproof PU coating, mosquito net doors, groundsheet footprint, and two 5°C comfort sleeping bags included.",
    condition: "LIKE_NEW",
    pricePerDay: 750.0,
    depositValue: 3500.0,
    location: "HSR Layout, Bengaluru",
    rules:
      "Ensure tent is completely dry before repacking to prevent damp odor. Never cook inside tent.",
    minDays: 2,
    maxDays: 14,
    categorySlug: "tents-trail-gear",
    ownerEmail: "vikram@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // 25. Workshop Woodworking: Makita 18V Cordless Circular Saw
  {
    title: "Makita 18V Cordless Circular Saw (6-1/2 Inch Blade)",
    description:
      "Lightweight brushless circular saw with 50-degree bevel capacity, electric blade brake, and LED cutline illumination. Includes 4.0Ah battery, fast charger, and 24T carbide blade.",
    condition: "LIKE_NEW",
    pricePerDay: 500.0,
    depositValue: 2500.0,
    location: "HSR Layout, Bengaluru",
    rules:
      "Inspect blade guard retraction before every cut. Wear ear and eye protection.",
    minDays: 1,
    maxDays: 7,
    categorySlug: "carpentry-woodworking",
    ownerEmail: "chloe@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // 26. Cinematography: DJI Ronin-SC 3-Axis Camera Gimbal
  {
    title: "DJI Ronin-SC 3-Axis Gimbal Stabilizer",
    legacyTitle: "DJI Ronin-SC 3-Axis Camera Gimbal Stabilizer",
    description:
      "Ultra-smooth motorized handheld stabilizer designed for mirrorless setups. Features mechanical axis locks, ActiveTrack 3.0 subject tracking, and smartphone mount for follow focus.",
    condition: "LIKE_NEW",
    pricePerDay: 1300.0,
    depositValue: 6000.0,
    location: "Indiranagar, Bengaluru",
    rules:
      "Balance all 3 axes mechanically before powering on motors to prevent motor strain.",
    minDays: 1,
    maxDays: 10,
    categorySlug: "video-film",
    ownerEmail: "pooja@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // Related-gear demo listing: Sony FE 85mm portrait lens
  {
    title: "Sony FE 85mm F1.8 Portrait Lens",
    description:
      "Fast full-frame E-mount prime lens for portraits, college film projects, interviews, and event coverage. Its wide F1.8 aperture creates soft background blur in low light. Includes hood, front and rear caps, and a padded pouch.",
    condition: "LIKE_NEW",
    pricePerDay: 650.0,
    depositValue: 5000.0,
    location: "Indiranagar, Bengaluru",
    rules: "Keep both caps on when not mounted. Clean only with the supplied microfiber cloth.",
    minDays: 1,
    maxDays: 10,
    categorySlug: "photography",
    ownerEmail: "pooja@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // Related-gear demo listing: fluid-head tripod
  {
    title: "Manfrotto Fluid-Head Video Tripod",
    description:
      "Stable aluminium tripod with a smooth fluid pan-and-tilt head for student films, interviews, travel videos, and locked-off product shots. Includes quick-release plate, carry bag, and a 5 kg payload rating.",
    condition: "GOOD",
    pricePerDay: 400.0,
    depositValue: 2500.0,
    location: "Koramangala, Bengaluru",
    rules: "Lock the legs before carrying. Do not exceed the stated payload rating.",
    minDays: 1,
    maxDays: 14,
    categorySlug: "video-film",
    ownerEmail: "dave@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // Related-gear demo listing: portable LED lighting
  {
    title: "Aputure Amaran Bi-Color LED Panel Kit",
    description:
      "Portable dimmable bi-color continuous light for indoor interviews, portrait sessions, product videos, and student film sets. Includes diffuser, power adapter, light stand, and a carry case.",
    condition: "LIKE_NEW",
    pricePerDay: 550.0,
    depositValue: 3000.0,
    location: "HSR Layout, Bengaluru",
    rules: "Allow the panel to cool before packing. Keep the adapter and diffuser with the kit.",
    minDays: 1,
    maxDays: 10,
    categorySlug: "cameras-studio-lights",
    ownerEmail: "ananya@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // Related-gear demo listing: wireless interview audio
  {
    title: "Rode Wireless GO II Dual Microphone Kit",
    description:
      "Compact two-person wireless microphone kit for campus interviews, presentations, short films, and event coverage. Includes two transmitters, receiver, charging case, furry windshields, and connection cables.",
    condition: "LIKE_NEW",
    pricePerDay: 500.0,
    depositValue: 3000.0,
    location: "Indiranagar, Bengaluru",
    rules: "Charge all units before return. Store the windshields and cables in the case pockets.",
    minDays: 1,
    maxDays: 7,
    categorySlug: "audio-music",
    ownerEmail: "priya@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // Related-gear demo listing: rig cage and handles
  {
    title: "SmallRig Full-Frame Rig Cage and Top Handle",
    description:
      "Protective aluminium rig cage with a top handle, cold-shoe mounts, and accessory threads for building a comfortable handheld setup for short films, reels, and interviews. Includes hex keys and mounting screws.",
    condition: "GOOD",
    pricePerDay: 300.0,
    depositValue: 1800.0,
    location: "Koramangala, Bengaluru",
    rules: "Check screw fit before mounting. Do not overtighten the supplied fasteners.",
    minDays: 1,
    maxDays: 10,
    categorySlug: "video-film",
    ownerEmail: "dave@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // Related-gear demo listing: on-set monitoring
  {
    title: "Feelworld 5-Inch On-Camera Field Monitor",
    description:
      "Bright compact external field monitor with focus-assist tools for checking framing and exposure during interviews, event shoots, and student film production. Includes sun hood, HDMI cable, battery, and mounting arm.",
    condition: "GOOD",
    pricePerDay: 450.0,
    depositValue: 2500.0,
    location: "BTM Layout, Bengaluru",
    rules: "Use the supplied HDMI cable and remove the battery for long-term storage.",
    minDays: 1,
    maxDays: 10,
    categorySlug: "video-film",
    ownerEmail: "pooja@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // 33. Audio Production: Focusrite Scarlett 2i2 USB Audio Interface
  {
    title: "Focusrite Scarlett 2i2 USB Audio Interface (4th Gen)",
    description:
      "Two studio-grade ultra-low-noise mic preamps with 69dB gain range, Auto Gain, Clip Safe, and flagship converters. Plug and play USB-C connectivity with balanced headphone output.",
    condition: "LIKE_NEW",
    pricePerDay: 450.0,
    depositValue: 2500.0,
    location: "Hauz Khas, New Delhi",
    rules:
      "Connect only using supplied braided USB-C cable. Handle TRS headphone jacks gently.",
    minDays: 2,
    maxDays: 21,
    categorySlug: "audio-music",
    ownerEmail: "priya@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // 34. DJ Gear: Pioneer DDJ-FLX4 2-Channel DJ Controller
  {
    title: "Pioneer DDJ-FLX4 2-Channel DJ Controller",
    description:
      "Standard layout 2-channel DJ controller compatible with rekordbox and Serato DJ Lite. Features Smart Fader, Smart CFX, responsive jog wheels, and 8 performance pads per deck.",
    condition: "LIKE_NEW",
    pricePerDay: 950.0,
    depositValue: 5000.0,
    location: "Koramangala, Bengaluru",
    rules:
      "Transport strictly inside padded case. Do not place drinks near faders or touch jog wheels with dirty hands.",
    minDays: 1,
    maxDays: 5,
    categorySlug: "party-events",
    ownerEmail: "dave@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // 35. DIY Tools: Bosch 360° Cross-Line Laser Level
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
  // 36. Lawn & Garden: Husqvarna Petrol Chainsaw
  {
    title: "Husqvarna 16-Inch Petrol Chainsaw (Safety Helmet & Chaps)",
    description:
      "Versatile 38cc chainsaw with X-Torq engine for trimming branches, felling small garden trees, and firewood cutting. Includes safety helmet, face mesh, ear defenders, and safety chaps.",
    condition: "GOOD",
    pricePerDay: 750.0,
    depositValue: 3500.0,
    location: "Indiranagar, Bengaluru",
    rules:
      "Chainsaw certification or verified experience required. Wear all safety gear provided.",
    minDays: 1,
    maxDays: 4,
    categorySlug: "lawn-garden-machinery",
    ownerEmail: "marcus@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // 37. Lawn & Garden: Black+Decker Cordless Hedge Trimmer
  {
    title: "Black+Decker 20V Cordless 22-Inch Hedge Trimmer",
    description:
      "Dual-action hardened steel blades for clean, fast cuts on hedges and shrubs. Power Drive transmission prevents stalling in thick branches. Includes 20V MAX battery and charger.",
    condition: "LIKE_NEW",
    pricePerDay: 400.0,
    depositValue: 1800.0,
    location: "BTM Layout, Bengaluru",
    rules:
      "Wipe sap off blades after use. Oil blade before returning.",
    minDays: 1,
    maxDays: 5,
    categorySlug: "lawn-garden-machinery",
    ownerEmail: "ryan@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // 38. Camping & Trail: Camp Chef 2-Burner Outdoor Camp Stove
  {
    title: "Camp Chef Explorer 2-Burner Outdoor Camp Stove",
    description:
      "Two 30,000 BTU cast aluminum burners with detachable legs and three-sided windscreen. Perfect for rooftop gatherings, camping cookouts, and weekend gatherings.",
    condition: "GOOD",
    pricePerDay: 480.0,
    depositValue: 2000.0,
    location: "HSR Layout, Bengaluru",
    rules:
      "Operate strictly in open air or ventilated campsite. Turn off regulator valve after cooking.",
    minDays: 2,
    maxDays: 10,
    categorySlug: "tents-trail-gear",
    ownerEmail: "vikram@borrownet.com",
    images: [
      "https://images.unsplash.com/photo-1508873696983-2df5293cb325?auto=format&fit=crop&w=1000&q=80",
    ],
  },
];

// Extra catalog neighbors make recommendations useful across every seeded category.
const relatedDemoImages = {
  "power-tools": [
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=1000&q=80",
  ],
  "pressure-cleaning": [
    "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1557429287-b2e26467fc2b?auto=format&fit=crop&w=1000&q=80",
  ],
  "outdoor-diy-rigging": [
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80",
  ],
  "generators-site-power": [
    "https://eu.ecoflow.com/cdn/shop/files/ecoflow-river-2-portable-power-station-ch-version-1207399655_1066x.png?v=1763555450",
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1000&q=80",
  ],
  "pressure-washing-landscaping": [
    "https://images.unsplash.com/photo-1557429287-b2e26467fc2b?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1000&q=80",
  ],
  "sound-systems-projectors": [
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80",
    "https://www.australismusic.com.au/Files/Images/2021_productImages/000-EWI00-00010_2.png",
  ],
  "kayaks-mobility": [
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1000&q=80",
  ],
  "electronics-tech": [
    "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1000&q=80",
  ],
  "plumbing-drains": [
    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=1000&q=80",
  ],
  "musical-instruments": [
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1000&q=80",
  ],
  "sports-fitness": [
    "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80",
  ],
  "kitchen-cooking": [
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80",
  ],
  "diy-workshop": [
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=1000&q=80",
  ],
};
const relatedImageIndex = new Map();
const relatedDemoListings = [
  ["Bosch Professional 18V Impact Driver", "Compact brushless impact driver for driving long screws, assembling furniture, and completing renovation work alongside a cordless drill. Includes two batteries, charger, and bit set.", "power-tools", "alex@borrownet.com", 400, 2000, "Indiranagar, Bengaluru"],
  ["DeWalt 20V Oscillating Multi-Tool Kit", "Versatile cordless cutting and sanding tool for flush cuts, grout removal, and detail work during home repairs. Includes wood and metal blades, sanding pad, battery, and charger.", "power-tools", "chloe@borrownet.com", 450, 2200, "HSR Layout, Bengaluru"],
  ["Kärcher 16-Inch Pressure Washer Surface Cleaner", "Rotating dual-nozzle attachment for cleaning wide patios, tiled terraces, driveways, and apartment parking areas evenly with less splash than a standard lance.", "pressure-cleaning", "dave@borrownet.com", 350, 1800, "Koramangala, Bengaluru"],
  ["Foam Cannon and 10-Metre Wash Hose Kit", "Quick-connect foam cannon with adjustable spray pattern and a reinforced extension hose for two-wheelers, cars, balconies, and outdoor furniture. Compatible adapters included.", "pressure-cleaning", "alex@borrownet.com", 250, 1200, "Indiranagar, Bengaluru"],
  ["Werner Multi-Position Ladder Stabilizer", "Wide stand-off stabilizer that improves clearance around gutters and provides a broader contact stance for painting, exterior maintenance, and safe access work.", "outdoor-diy-rigging", "sarah@borrownet.com", 250, 1500, "Koramangala, Bengaluru"],
  ["Full-Body Fall-Arrest Safety Harness Kit", "Adjustable full-body harness with lanyard and anchor strap for supervised elevated maintenance and construction tasks. Supplied with inspection checklist and storage bag.", "outdoor-diy-rigging", "sarah@borrownet.com", 350, 2500, "Koramangala, Bengaluru"],
  ["EcoFlow 1kWh Portable Power Station", "Rechargeable backup power for laptops, lights, routers, and small production equipment during campus events or planned outages. Includes AC, USB-C, and car charging outputs.", "generators-site-power", "elena@borrownet.com", 900, 7000, "Indiranagar, Bengaluru"],
  ["25-Metre Heavy-Duty Outdoor Extension Reel", "Weather-resistant cable reel with overload protection for temporary outdoor work sites, garden projects, and event equipment. Fully unwind before connecting high-load appliances.", "generators-site-power", "elena@borrownet.com", 180, 1000, "Indiranagar, Bengaluru"],
  ["Honda-Compatible 15-Inch Rotary Surface Cleaner", "Stainless rotary deck attachment for restoring large paved areas, apartment driveways, and outdoor tiled spaces with a more even finish than a narrow spray tip.", "pressure-washing-landscaping", "alex@borrownet.com", 400, 2200, "Indiranagar, Bengaluru"],
  ["Snow-Foam Cannon with Vehicle Detailing Kit", "Adjustable detergent cannon with soft wash mitt and microfiber drying towels for weekend vehicle detailing. Includes the quick-connect adapter and a measured soap bottle.", "pressure-washing-landscaping", "dave@borrownet.com", 220, 1200, "Koramangala, Bengaluru"],
  ["Epson Portable Full-HD Projector", "Portable bright projector for classroom presentations, society screenings, and small event setups. Includes HDMI cable, remote, carry case, and a foldable projection screen.", "sound-systems-projectors", "pooja@borrownet.com", 1200, 7000, "Indiranagar, Bengaluru"],
  ["Behringer 8-Channel Compact Audio Mixer", "Compact mixer with microphone preamps, stereo inputs, and simple EQ for connecting microphones and speakers at college events, talks, and small performances.", "sound-systems-projectors", "pooja@borrownet.com", 650, 3500, "Indiranagar, Bengaluru"],
  ["Intex Explorer K2 Tandem Inflatable Kayak", "Two-person inflatable kayak kit with aluminium paddles, hand pump, and removable skegs for calm-water outings at approved lakes and coastal locations. Packs into a carry bag.", "kayaks-mobility", "marcus@borrownet.com", 900, 4500, "Indiranagar, Bengaluru"],
  ["Two-Person Kayak Safety and Dry-Bag Kit", "Pair of adjustable personal flotation devices, waterproof phone pouch, throw line, and compact dry bag for a short paddling trip. Check local water rules before use.", "kayaks-mobility", "marcus@borrownet.com", 300, 1800, "Indiranagar, Bengaluru"],
  ["DJI Mini Series Intelligent Flight Battery Pair", "Two spare intelligent flight batteries and a charging hub to extend a day of aerial photography and travel filming. Includes protective battery case and charging cable.", "electronics-tech", "ananya@borrownet.com", 600, 4000, "Koramangala, Bengaluru"],
  ["Foldable Drone Landing Pad and Safety Kit", "High-visibility foldable landing mat with spare propellers, tool, and carry pouch for cleaner take-offs and landings on dusty fields and uneven outdoor locations.", "electronics-tech", "ananya@borrownet.com", 250, 1300, "Koramangala, Bengaluru"],
  ["Ridgid Compact Pipe Inspection Scope", "Water-resistant inspection scope with a flexible camera cable and display for checking hard-to-reach pipe sections before choosing a cleaning approach. Includes spare batteries and case.", "plumbing-drains", "keith@borrownet.com", 550, 3000, "Whitefield, Bengaluru"],
  ["Heavy-Duty Pipe Wrench and Drain-Clearing Kit", "Two pipe wrenches, hand auger, gloves, and drain-cleaning tools for routine sink and bathroom maintenance. Supplied in a labelled carry case.", "plumbing-drains", "keith@borrownet.com", 300, 1600, "Whitefield, Bengaluru"],
  ["Fender Frontman 20G Guitar Practice Amplifier", "Compact guitar amplifier with clean and drive channels, headphone output, and auxiliary input for home practice, beginner lessons, and small jam sessions.", "musical-instruments", "priya@borrownet.com", 450, 2500, "Hauz Khas, New Delhi"],
  ["Casio 61-Key Portable Keyboard with Stand", "Portable 61-key keyboard with lesson modes, built-in tones, music rest, power adapter, and folding stand for practice, rehearsals, and college performances.", "musical-instruments", "priya@borrownet.com", 500, 3000, "Hauz Khas, New Delhi"],
  ["Giro Adjustable Cycling Helmet and Light Set", "Adjustable ventilated cycling helmet paired with front and rear rechargeable lights for safer early-morning rides and indoor trainer sessions. Cleaned and inspected between loans.", "sports-fitness", "vikram@borrownet.com", 250, 1500, "HSR Layout, Bengaluru"],
  ["Thule Rear-Mounted Two-Bike Carrier", "Foldable rear-mounted carrier for transporting two bicycles to a trail or weekend ride. Includes frame straps and fitting instructions; verify vehicle compatibility before booking.", "sports-fitness", "vikram@borrownet.com", 700, 5000, "HSR Layout, Bengaluru"],
  ["Baratza Encore Coffee Grinder", "Conical burr grinder with stepped settings for espresso-style brews, pour-over, and French press. Includes hopper, grounds bin, cleaning brush, and quick-start guide.", "kitchen-cooking", "ananya@borrownet.com", 350, 2200, "Koramangala, Bengaluru"],
  ["Digital Coffee Scale and Pour-Over Starter Kit", "Precision scale with timer, kettle, dripper, and reusable server for measuring consistent coffee recipes at home or in a shared kitchen.", "kitchen-cooking", "ananya@borrownet.com", 220, 1300, "Koramangala, Bengaluru"],
  ["Fluke Digital Multimeter and Test Lead Set", "Portable digital meter for checking voltage, continuity, and resistance during electronics repairs, workshop projects, and basic home troubleshooting. Includes leads and protective case.", "diy-workshop", "kabir@borrownet.com", 300, 1800, "Koregaon Park, Pune"],
  ["Dremel 3000 Rotary Tool Accessory Kit", "Variable-speed rotary tool with cutting, sanding, polishing, and engraving accessories for model making, small repairs, and detailed craft projects.", "diy-workshop", "kabir@borrownet.com", 350, 2000, "Koregaon Park, Pune"],
].map(([title, description, categorySlug, ownerEmail, pricePerDay, depositValue, location]) => {
  const imageOptions = relatedDemoImages[categorySlug] || [];
  const imageIndex = relatedImageIndex.get(categorySlug) || 0;
  relatedImageIndex.set(categorySlug, imageIndex + 1);
  const image = imageOptions[imageIndex % imageOptions.length];

  return {
    title,
    description,
    condition: "GOOD",
    pricePerDay,
    depositValue,
    location,
    rules: "Return the item clean, with all included parts and accessories in its case.",
    minDays: 1,
    maxDays: 7,
    categorySlug,
    ownerEmail,
    images: image ? [image] : [],
  };
});

itemsData.push(...relatedDemoListings);

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

  console.log("Seeding Indian user accounts with unique avatars...");
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

  console.log("Upserting Indian equipment demo catalog...");

  for (const item of itemsData) {
    const categoryId = categoryMap.get(item.categorySlug);
    const ownerId = userMap.get(item.ownerEmail);

    if (!categoryId || !ownerId) {
      console.warn(`Skipping item "${item.title}": category or owner missing`);
      continue;
    }

    const existingItem = await prisma.item.findFirst({
      where: {
        ownerId,
        title: { in: [item.title, item.legacyTitle].filter(Boolean) },
      },
      select: { id: true },
    });
    const itemData = {
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
    };
    const imageData = item.images.map((url, order) => ({ url, order }));
    const itemRecord = existingItem
      ? await prisma.item.update({
          where: { id: existingItem.id },
          data: {
            ...itemData,
            images: { deleteMany: {}, create: imageData },
          },
        })
      : await prisma.item.create({
          data: { ...itemData, images: { create: imageData } },
        });

    // Force a fresh vector after demo text or category changes; backfill after seeding.
    await prisma.$executeRaw`UPDATE "Item" SET "embedding" = NULL WHERE "id" = ${itemRecord.id}`;

    console.log(`Seeded listing: ${itemRecord.title}`);
  }

  console.log(
    `Seed completed successfully! Upserted ${categories.length} categories, ${usersData.length} users, and ${itemsData.length} demo listings. Other listings were preserved.`
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
