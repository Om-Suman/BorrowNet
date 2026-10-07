import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const neighborhoods = [
  "Koramangala, Bengaluru",
  "Indiranagar, Bengaluru",
  "Andheri West, Mumbai",
  "Powai, Mumbai",
  "Hauz Khas, New Delhi",
  "Sector 62, Noida",
  "Koregaon Park, Pune",
  "Gachibowli, Hyderabad",
  "Adyar, Chennai",
  "Salt Lake, Kolkata",
];

const ownerAvatars = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=256&h=256&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&h=256&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&h=256&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80",
];

const owners = neighborhoods.map((location, index) => ({
  email: `demo.owner${String(index + 1).padStart(2, "0")}@borrownet.test`,
  name: [
    "Aarav Mehta", "Diya Nair", "Ishaan Rao", "Meera Kapoor", "Kabir Shah",
    "Ananya Das", "Vivaan Iyer", "Sana Khan", "Arjun Pillai", "Tara Banerjee",
  ][index],
  avatarUrl: ownerAvatars[index],
  location,
}));

const image = (photoId) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1000&q=80`;

const catalogs = [
  {
    slug: "photography", price: 900,
    entries: [
      ["Canon EOS 1500D DSLR with 18-55mm Lens", "Beginner-friendly DSLR for portraits, college events, and travel photography.", image("photo-1495708014741-c258f81ea7e1")],
      ["Nikon D7500 DSLR Camera Body", "Crop-sensor DSLR for wildlife, sports, and weekend photography projects.", image("photo-1516035069371-29a1b244cc32")],
      ["Sony Alpha A6400 Mirrorless Camera", "Compact mirrorless camera for creator videos, portraits, and everyday travel.", image("photo-1502920917128-1aa500764cbd")],
      ["Sigma 30mm f/1.4 Portrait Lens for Sony E", "Bright prime lens for portraits, indoor events, and low-light shoots.", image("photo-1617005082133-548c4dd27f35")],
      ["Manfrotto Compact Camera Tripod Kit", "Portable tripod for stable long exposures, interviews, and group photographs.", image("photo-1507679799987-c73779587ccf")],
    ],
  },
  {
    slug: "video-film", price: 1300,
    entries: [
      ["Sony Alpha A7 III Video Creator Camera Kit", "Full-frame camera kit for short films, interviews, and independent productions.", image("photo-1574717024653-61fd2cf4d44d")],
      ["DJI Ronin-SC Camera Gimbal", "Three-axis stabilizer for smooth handheld shots and campus film projects.", image("photo-1533090161767-e6ffed986b88")],
      ["Canon EF 50mm f/1.8 STM Video Lens", "Lightweight prime lens for talking-head video and cinematic background blur.", image("photo-1512790182412-b19e6d62bc39")],
      ["Feelworld 5-inch On-Camera Field Monitor", "Camera-top monitor for checking focus and framing during a video shoot.", image("photo-1526738549149-8e07eca6c147")],
      ["SmallRig DSLR Shoulder Rig with Follow Focus", "Shoulder support rig for steadier handheld filming and longer takes.", image("photo-1588702547923-7093a6c3ba33")],
    ],
  },
  {
    slug: "audio-music", price: 500,
    entries: [
      ["Rode NT1 Studio Condenser Microphone Kit", "Studio microphone kit for podcasts, voiceovers, and home music recording.", image("photo-1590658268037-6bf12165a8df")],
      ["Focusrite Scarlett 2i2 USB Audio Interface", "Two-input interface for recording vocals and instruments on a laptop.", image("photo-1598488035139-bdbb2231ce04")],
      ["Audio-Technica ATH-M50x Studio Headphones", "Closed-back monitoring headphones for editing, mixing, and practice.", image("photo-1505740420928-5e560c06d30e")],
      ["Zoom H5 Portable Audio Recorder", "Portable recorder for interviews, field recordings, and student films.", image("photo-1519683109079-d5f539e1542f")],
      ["PreSonus Eris 3.5 Studio Monitor Pair", "Compact powered monitors for a small bedroom or project studio.", image("photo-1545454675-3531b543be5d")],
    ],
  },
  {
    slug: "power-tools", price: 350,
    entries: [
      ["Bosch GSB 600 Impact Drill with Masonry Bit Set", "Corded impact drill for shelves, furniture assembly, and household repairs.", image("photo-1504148455328-c376907d081c")],
      ["Makita 18V Cordless Drill Driver with Battery", "Cordless driver for furniture assembly and light renovation around the home.", image("photo-1572981779307-38b8cabb2407")],
      ["DeWalt 4-inch Angle Grinder with Guard", "Angle grinder for cutting and surface preparation; safety guard included.", image("photo-1581092160607-ee22621dd758")],
      ["Bosch 125mm Random Orbital Sander", "Random orbital sander for smoothing wood before painting or polishing.", image("photo-1581783342308-f792dbdd27c5")],
      ["Stanley 800W Jigsaw with Wood Blades", "Compact jigsaw for curved cuts in plywood and DIY craft projects.", image("photo-1540555700478-4be289fbecef")],
    ],
  },
  {
    slug: "camping-outdoor", price: 450,
    entries: [
      ["Quechua 3-Person Waterproof Dome Tent", "Quick-pitch dome tent for a weekend at Nandi Hills, Pawna, or a local campsite.", image("photo-1504280390367-361c6d9f38f4")],
      ["Decathlon 50L Trekking Backpack", "Large trekking pack with padded hip belt for multi-day trips in the Western Ghats.", image("photo-1553062407-98eeb64c6a62")],
      ["Two-Person Self-Inflating Camping Mattress Set", "Pair of compact sleeping mats for overnight road trips and campsite stays.", image("photo-1478827536114-da961b7f86d2")],
      ["Coleman Portable Butane Camping Stove", "Single-burner camping stove for outdoor cooking; fuel canister supplied separately.", image("photo-1508873696983-2df5293cb325")],
      ["Naturehike Lightweight Sleeping Bag, 5°C", "Packable sleeping bag suited to cool hill-station and shoulder-season nights.", image("photo-1510312305653-8ed496efae75")],
    ],
  },
  {
    slug: "sports-fitness", price: 400,
    entries: [
      ["Giant Escape 3 Hybrid Bicycle, Medium Frame", "Hybrid cycle for city rides, lake loops, and weekend fitness around Bengaluru.", image("photo-1485965120184-e220f721d03e")],
      ["Decathlon Riverside 500 Hybrid Cycle, Large", "Comfortable multi-speed bicycle for errands and recreational rides in Pune.", image("photo-1532298229144-0ec0c57515c7")],
      ["Firefox Road Runner Pro 700C Bicycle", "Road bicycle for longer paved routes and group rides around Hyderabad.", image("photo-1507035895480-2b3156c31fc8")],
      ["Schwinn Indoor Bicycle Trainer Stand", "Rear-wheel trainer for indoor cycling when monsoon weather keeps you home.", image("photo-1517649763962-0c623266ddc0")],
      ["Cosco Full-Size Cricket Kit with Bat and Pads", "Practice kit for a casual cricket match; includes bat, pads, and gloves.", image("photo-1531415074868-036b107e775a")],
    ],
  },
  {
    slug: "party-events", price: 800,
    entries: [
      ["Pioneer DDJ-FLX4 Two-Channel DJ Controller", "USB DJ controller for house parties, college events, and beginner practice.", image("photo-1571266028243-3716f02d2d2e")],
      ["Behringer Xenyx 802S Compact Audio Mixer", "Small mixer for a home event, acoustic set, or community programme.", image("photo-1511671782779-c97d3d27a1d4")],
      ["Numark Party Mix II DJ Controller with Lights", "Entry-level controller with built-in light effects for a small gathering.", image("photo-1470225620780-dba8ba36b745")],
      ["Pioneer DDJ-400 Rekordbox DJ Controller", "Two-channel controller for rehearsals and small private events.", image("photo-1514525253161-7a46d19cd819")],
      ["Compact RGB DJ Light Bar with Tripod", "Portable colour light bar for birthdays, society events, and home celebrations.", image("photo-1516450360452-9312f5e86fc7")],
    ],
  },
  {
    slug: "kitchen-cooking", price: 500,
    entries: [
      ["DeLonghi Dedica Espresso Machine", "Compact espresso maker for home coffee experiments and small gatherings.", image("photo-1514432324607-a09d9b4aefdd")],
      ["Philips 4.1L Digital Air Fryer", "Countertop air fryer for snacks and quick meals in a shared flat.", image("photo-1586201375761-83865001e31c")],
      ["KitchenAid Artisan Stand Mixer, 4.8L", "Stand mixer for baking cakes, bread, and festive batches of biscuits.", image("photo-1590794056226-79ef3a8147e1")],
      ["Prestige PIC 20 Induction Cooktop", "Portable induction cooktop for temporary kitchens and cooking demonstrations.", image("photo-1556911220-e15b29be8c8f")],
      ["Bosch TrueMixx Pro 750W Mixer Grinder", "Mixer grinder with jars for chutneys, masalas, and everyday Indian cooking.", image("photo-1544025162-d76694265947")],
    ],
  },
  {
    slug: "lawn-garden-machinery", price: 550,
    entries: [
      ["Honda 4-Stroke Push Lawn Mower", "Push mower for maintaining a home lawn or community garden plot.", image("photo-1592417817098-8f3d69109853")],
      ["Kärcher K2 Universal Pressure Washer", "Compact pressure washer for balconies, patios, bikes, and outdoor tiles.", image("photo-1557429287-b2e26467fc2b")],
      ["Black+Decker 450W Electric Hedge Trimmer", "Electric trimmer for shaping hedges and keeping a small garden tidy.", image("photo-1513836279014-a89f7a76ae86")],
      ["Bosch EasyGrassCut Cordless Grass Trimmer", "Lightweight cordless trimmer for lawn edges and hard-to-reach corners.", image("photo-1590496793929-36417d3117de")],
      ["Gardena 18V Cordless Leaf Blower", "Battery-powered blower for clearing dry leaves from a courtyard or driveway.", image("photo-1617196034183-421b4917c92d")],
    ],
  },
  {
    slug: "electronics-tech", price: 900,
    entries: [
      ["DJI Mini 4 Pro Drone Fly More Combo", "Compact camera drone for permitted recreational flying and travel footage.", image("photo-1527977966376-1c8408f9f108")],
      ["DJI Mini 3 Pro Drone with RC Controller", "Foldable camera drone with controller for planned outdoor shoots.", image("photo-1508614589041-895b88991e3e")],
      ["DJI Air 3 Dual-Camera Drone", "Dual-camera drone for landscape photography and permitted aerial filming.", image("photo-1473968512647-3e447244af8f")],
      ["DJI Avata 2 FPV Drone Starter Kit", "First-person-view drone kit for experienced pilots and open practice areas.", image("photo-1506947411487-a56738267384")],
      ["DJI Mavic 3 Classic Camera Drone", "Long-flight camera drone for planned landscape and travel projects.", image("photo-1533558701576-23c65e0272fb")],
    ],
  },
  {
    slug: "musical-instruments", price: 300,
    entries: [
      ["Yamaha F310 Acoustic Guitar with Gig Bag", "Full-size steel-string acoustic guitar for practice, songwriting, and small jams.", image("photo-1511379938547-c1f69419868d")],
      ["Fender Squier Stratocaster Electric Guitar", "Entry-level electric guitar for rehearsal and beginner recording sessions.", image("photo-1514525253161-7a46d19cd819")],
      ["Kadence Frontier Electro-Acoustic Guitar", "Cutaway electro-acoustic guitar for performances and unplugged practice.", image("photo-1525201548942-d8732f6617a0")],
      ["Kala Concert Ukulele with Padded Bag", "Compact four-string ukulele for travel, lessons, and casual music sessions.", image("photo-1460723237483-7a6dc9d0b212")],
      ["Yamaha TRBX174 Electric Bass Guitar", "Four-string bass for rehearsals, college bands, and home recording.", image("photo-1550985616-10810253b84d")],
    ],
  },
  {
    slug: "diy-workshop", price: 300,
    entries: [
      ["Bosch UniversalLevel 360 Cross-Line Laser", "Self-leveling laser tool for shelves, tile layout, and home interior work.", image("photo-1504307651254-35680f356dfd")],
      ["Fluke 117 True-RMS Digital Multimeter", "Digital multimeter for supervised electronics troubleshooting and hobby projects.", image("photo-1581092335397-9583fe92d232")],
      ["Stanley FatMax 8m Measuring Tape and Laser Measure", "Measuring kit for planning rooms, furniture, and small renovation jobs.", image("photo-1586864387967-d02ef85d93e8")],
      ["Dremel 3000 Rotary Tool Kit with Accessories", "Variable-speed rotary tool for carving, sanding, and detailed DIY work.", image("photo-1578328819058-b69f3a3b0f6b")],
      ["Weller 60W Temperature-Controlled Soldering Station", "Bench soldering station for electronics repair and maker projects.", image("photo-1581092580497-e0d23cbdf1dc")],
    ],
  },
];

async function main() {
  const ownerPasswordHash = await bcrypt.hash("BorrowNetDemo123!", 10);
  const ownerIds = [];

  for (const owner of owners) {
    const record = await prisma.user.upsert({
      where: { email: owner.email },
      update: {
        name: owner.name,
        location: owner.location,
        avatarUrl: owner.avatarUrl,
        bio: "Demo BorrowNet community lender. Sample account for local development only.",
      },
      create: {
        ...owner,
        passwordHash: ownerPasswordHash,
        bio: "Demo BorrowNet community lender. Sample account for local development only.",
        isVerified: true,
      },
      select: { id: true },
    });
    ownerIds.push(record.id);
  }

  let inserted = 0;
  let updated = 0;
  for (const catalog of catalogs) {
    const category = await prisma.category.findUnique({ where: { slug: catalog.slug } });
    if (!category) {
      console.warn(`Category '${catalog.slug}' not found, skipping.`);
      continue;
    }

    for (let index = 0; index < catalog.entries.length; index += 1) {
      const [productName, detail, itemImg] = catalog.entries[index];
      const title = productName;
      const locationIndex = (index + catalogs.findIndex((entry) => entry.slug === catalog.slug)) % neighborhoods.length;
      const ownerId = ownerIds[locationIndex];
      const location = neighborhoods[locationIndex];
      const existing = await prisma.item.findFirst({ where: { title } });
      const data = {
        title,
        description: `${detail} Pickup in ${location}. Demo listing for BorrowNet development.`,
        condition: ["LIKE_NEW", "GOOD", "FAIR", "GOOD", "LIKE_NEW"][index],
        pricePerDay: catalog.price + index * Math.max(50, Math.round(catalog.price * 0.12)),
        depositValue: catalog.price * (4 + (index % 3)),
        location,
        rules: "Demo listing. Agree on a public pickup point, inspect the item together, and return it clean and complete.",
        minDays: 1,
        maxDays: [7, 10, 14, 21, 30][index],
        ownerId,
        categoryId: category.id,
        status: "ACTIVE",
      };

      const item = existing
        ? await prisma.item.update({ where: { id: existing.id }, data })
        : await prisma.item.create({ data });

      const priorImage = await prisma.itemImage.findFirst({ where: { itemId: item.id }, orderBy: { order: "asc" } });
      if (priorImage) {
        await prisma.itemImage.update({ where: { id: priorImage.id }, data: { url: itemImg, order: 0 } });
      } else {
        await prisma.itemImage.create({ data: { itemId: item.id, url: itemImg, order: 0 } });
      }

      if (existing) updated += 1;
      else inserted += 1;
    }
  }

  console.log(JSON.stringify({ inserted, updated, owners: owners.length, categories: catalogs.length }));
}

main()
  .catch((error) => {
    console.error("Demo seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
