import { PrismaClient, Gender, BodyType, Race, PrivateAdCustomerCategory, PrivateAdServiceCategory, PrivateAdExtraType, PrivateAdDaysAvailable, VIPContentType, EventStatus, EventAttendeeStatus, JobType, JobStatus, ApplicationStatus, SwipeDirection } from '@/prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';

// Strip sslmode from connection string to allow programmatic SSL config
const connectionString = process.env.DATABASE_URL?.replace(/[?&]sslmode=[^&]+/, '') || '';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Australian cities with coordinates
const locations = [
  { city: 'Sydney', state: 'NSW', lat: -33.8688, lon: 151.2093 },
  { city: 'Parramatta', state: 'NSW', lat: -33.8151, lon: 151.0000 },
  { city: 'Bondi', state: 'NSW', lat: -33.8915, lon: 151.2767 },
  { city: 'Melbourne', state: 'VIC', lat: -37.8136, lon: 144.9631 },
  { city: 'Brisbane', state: 'QLD', lat: -27.4698, lon: 153.0251 },
  { city: 'Perth', state: 'WA', lat: -31.9505, lon: 115.8605 },
  { city: 'Adelaide', state: 'SA', lat: -34.9285, lon: 138.6007 },
  { city: 'Gold Coast', state: 'QLD', lat: -28.0167, lon: 153.4000 },
  { city: 'Canberra', state: 'ACT', lat: -35.2809, lon: 149.1300 },
  { city: 'Newcastle', state: 'NSW', lat: -32.9283, lon: 151.7817 },
  { city: 'Wollongong', state: 'NSW', lat: -34.4278, lon: 150.8931 },
  { city: 'Hobart', state: 'TAS', lat: -42.8821, lon: 147.3272 },
  { city: 'Darwin', state: 'NT', lat: -12.4634, lon: 130.8456 },
  { city: 'Townsville', state: 'QLD', lat: -19.2590, lon: 146.8169 },
  { city: 'Cairns', state: 'QLD', lat: -16.9186, lon: 145.7781 },
];

const firstNames = [
  'Sophia', 'Emma', 'Olivia', 'Ava', 'Isabella', 'Mia', 'Charlotte', 'Amelia',
  'Harper', 'Evelyn', 'Abigail', 'Emily', 'Madison', 'Scarlett', 'Victoria',
  'Aria', 'Grace', 'Chloe', 'Zoe', 'Lily', 'Hannah', 'Layla', 'Nora',
  'Marcus', 'James', 'Liam', 'Noah', 'Oliver', 'Elijah', 'Lucas', 'Mason',
  'Logan', 'Alexander', 'Ethan', 'Benjamin', 'Michael', 'Daniel', 'Henry',
  'Jackson', 'Sebastian', 'Jack', 'Aiden', 'Owen', 'Samuel', 'David',
  'Alex', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Morgan', 'Cameron', 'Avery'
];

const bios = [
  'Professional and discreet companion available for upscale engagements.',
  'Sophisticated and elegant, perfect for dinner dates and social events.',
  'Friendly and outgoing personality, great conversation and company.',
  'Experienced and mature companion for discerning clients.',
  'Fun-loving and adventurous, ready to make your evening memorable.',
  'Classy and charming, ideal for business functions and events.',
  'Down-to-earth and genuine, focused on creating authentic connections.',
  'Intelligent and well-educated, perfect for intellectual companionship.',
];

const reviewComments = [
  'Amazing experience! Very professional and friendly. Highly recommend.',
  'Absolutely wonderful time. Great conversation and company.',
  'Professional, punctual, and exactly as described. Will definitely see again.',
  'Exceeded all expectations. A truly memorable experience.',
  'Very accommodating and friendly. Made me feel comfortable right away.',
  'Fantastic service! Everything was perfect from start to finish.',
  'Great personality and very easy to talk to. Had a wonderful time.',
  'Highly professional and discrete. Exactly what I was looking for.',
  'One of the best experiences I\'ve had. Can\'t wait to meet again.',
  'Very friendly and attentive. Made sure I was comfortable throughout.',
  'Exceptional service and great energy. Definitely worth it.',
  'Lovely person with great conversation. Time flew by!',
  'Very professional and respectful of boundaries. Highly recommend.',
  'Had an amazing time! Everything was just as promised.',
  'Wonderful experience. Very responsive to messages and easy to book.',
  null, // Some reviews might not have comments
  null,
  null,
];

const vipCaptions = [
  'Feeling grateful today ✨',
  'Just me being me 💕',
  'New content alert! 🔥',
  'Good vibes only 🌟',
  'Behind the scenes 📸',
  'Exclusive content for my VIPs',
  'Throwback to last weekend',
  'Special post for you all',
  'Loving this energy lately',
  'Making memories 💫',
  'Subscribe for more like this',
  'Feeling myself today',
  'Quality time 🌹',
  'Just dropped something special',
  'New shoot, who dis? 😘',
];

const statusUpdates = [
  'Hey everyone! Just wanted to say thank you for all the love and support. You all make this so worth it! 💕',
  'New content coming tomorrow! Get ready for something special 🔥',
  'Taking a short break this weekend to recharge. Back with fresh content next week!',
  'Thank you to everyone who subscribed this month! You\'re the best! 🌟',
  'Working on something exciting for you all. Can\'t wait to share it! Stay tuned...',
  'Reminder: Check your DMs! I\'ve been responding to messages all day 💌',
  'Feeling so grateful for this amazing community. You all inspire me every day!',
  'Quick poll: What kind of content would you like to see more of? Let me know in the comments!',
  'Just finished an amazing photoshoot. The results are 🔥 Posting soon!',
  'Happy Friday everyone! Hope you all have an amazing weekend 💫',
  'Taking custom content requests this week! DM me for details ✨',
  'New subscriber special running this week! Don\'t miss out 🎁',
  'Behind the scenes day! You\'re getting exclusive access to everything today',
  'Feeling extra today 💋 New posts coming your way!',
  'Thank you for 1000 subscribers! Celebration post coming soon! 🎉',
];

const vipComments = [
  'Absolutely stunning! 😍',
  'You look amazing!',
  'Best content on the platform! 🔥',
  'Love this! Keep it coming',
  'Gorgeous as always 💕',
  'This is why I subscribed!',
  'Incredible! Thank you for sharing',
  'You\'re so beautiful!',
  'Amazing quality content',
  'Worth every penny! ⭐',
  'Can\'t wait for more!',
  'Perfect! 💯',
  'This made my day!',
  'Absolutely beautiful work',
  'You never disappoint!',
];

const eventTitles = [
  'Friday Night Meetup',
  'Weekend Social Gathering',
  'Sunset Rooftop Party',
  'Beach BBQ & Drinks',
  'Wine Tasting Evening',
  'Comedy Night Out',
  'Live Music & Dancing',
  'Cocktail Hour Mixer',
  'Gaming Tournament',
  'Karaoke Night',
  'Pool Party Vibes',
  'Brunch & Mimosas',
  'Trivia Night',
  'Art Gallery Opening',
  'Outdoor Movie Night',
  'Sports Bar Hangout',
  'Networking Drinks',
  'Dance Class Social',
  'Board Game Night',
  'Sunset Picnic',
  'Bar Crawl Adventure',
  'Theme Party Bash',
  'Restaurant Pop-up',
  'Fitness Boot Camp',
  'Yoga & Meditation',
  'Book Club Meetup',
  'Photography Walk',
  'Food Festival',
  'Concert After Party',
  'Speed Dating Event',
];

const eventDescriptions = [
  'Join us for an amazing evening of fun, drinks, and great company! Come meet new people and make lasting connections in a relaxed atmosphere.',
  'Looking for something fun to do this weekend? Join our social gathering and connect with awesome people in your area!',
  'A perfect opportunity to network, socialize, and have a great time. Everyone welcome - bring your friends or come solo!',
  'Experience an unforgettable event filled with good vibes, great music, and even better company. Don\'t miss out!',
  'Whether you\'re new to the area or a local looking to expand your social circle, this event is perfect for you!',
  'Come hang out, have fun, and meet interesting people in a casual and friendly environment.',
  'An evening of entertainment, laughter, and connections awaits! Join us for an experience you won\'t forget.',
  'Bring your best energy and get ready for an amazing time with a diverse and friendly crowd.',
  'Looking to make new friends or just have a great night out? This is the event for you!',
  'Join fellow enthusiasts for a memorable event. Great atmosphere, great people, great memories!',
];

const eventVenues = [
  'The Ivy Rooftop Bar',
  'Bondi Beach Club',
  'Opera Bar Sydney',
  'The Rocks Social',
  'Darling Harbour Terrace',
  'Manly Pavilion',
  'Surry Hills Wine Bar',
  'Crown Casino Melbourne',
  'South Bank Brisbane',
  'Fremantle Brewing Co',
  'The Deck Adelaide',
  'City Beach Cafe',
  'Riverside Restaurant',
  'Garden Terrace',
  'Harbourside Venue',
  'Beach House Social',
  'Urban Rooftop',
  'Waterfront Lounge',
  'Parkside Pavilion',
  'Coastal Club',
];

const eventPostTexts = [
  'So excited for this event! Can\'t wait to meet everyone! 🎉',
  'Who else is coming? Let\'s connect!',
  'This is going to be amazing! See you all there! 🔥',
  'First time attending one of these events, a bit nervous but excited!',
  'Anyone want to share a ride? I\'m coming from [location]',
  'What should I wear to this? Casual or dressy?',
  'Count me in! This looks like so much fun!',
  'Bringing my friend along - hope that\'s cool!',
  'What time are people planning to arrive?',
  'Is there parking nearby? First time at this venue',
  'The weather looks perfect for this! 🌞',
  'Who wants to grab drinks before the event?',
  'This is going to be legendary! 💫',
  'Really looking forward to this!',
  'Anyone else a first-timer? Let\'s stick together!',
];

const eventCommentTexts = [
  'Sounds great! See you there!',
  'I\'m definitely in! 🙌',
  'Count me in as well!',
  'This is going to be fun!',
  'Can\'t wait! 🎉',
  'Same here! Super excited!',
  'Let\'s meet up when we get there!',
  'I\'ll be there around [time]',
  'Awesome! Looking forward to it!',
  'Me too! First timer here as well!',
  'Great vibes already! 🔥',
  'This is going to be epic!',
  'See you soon! ✨',
  'So pumped for this!',
  'Yes! Can\'t wait to meet everyone!',
];

const livestreamTitles = [
  'Just Chatting & Hanging Out',
  'Late Night Vibes',
  'Q&A Session - Ask Me Anything!',
  'Getting Ready Stream',
  'Morning Coffee Chat',
  'Workout Stream',
  'Cooking with Me',
  'Gaming Session',
  'Music & Chill',
  'Behind the Scenes',
  'Story Time',
  'Day in My Life',
  'Planning the Week',
  'Answering Your Questions',
  'Random Thoughts',
];

const livestreamBios = [
  'Join me for regular streams where we can chat, have fun, and just hang out together! Hit follow to get notified when I go live! 💕',
  'Your favorite place to unwind and have great conversations. Come say hi and let\'s make some memories! ✨',
  'Streaming regularly for my amazing community! Let\'s chat, laugh, and have a great time together. Follow for notifications! 🎉',
  'Welcome to my live streams! I love connecting with you all and creating fun content. Don\'t forget to follow! 🔥',
  'Come hang out during my streams! I try to go live regularly - follow to never miss a stream! 💫',
];

function randomAge() {
  return Math.floor(Math.random() * (45 - 21) + 21); // Age between 21-45
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getDateOfBirth(age: number): Date {
  const today = new Date();
  const birthYear = today.getFullYear() - age;
  const birthMonth = Math.floor(Math.random() * 12);
  const birthDay = Math.floor(Math.random() * 28) + 1;
  return new Date(birthYear, birthMonth, birthDay);
}

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  console.log('🗑️  Cleaning existing data...');

  // Delete users with seed slug suffix
  // This will cascade delete most related data

  // First find all seed users to delete related data that doesn't cascade
  const seedUsers = await prisma.user.findMany({
    where: {
      slug: {
        endsWith: '-seed'
      }
    },
    select: { zesty_id: true }
  });

  const seedUserIds = seedUsers.map(u => u.zesty_id);

  if (seedUserIds.length > 0) {
    console.log(`Found ${seedUserIds.length} existing seed users to clean up`);

    // Delete Reviews
    await prisma.review.deleteMany({
      where: {
        OR: [
          { reviewerId: { in: seedUserIds } },
          { revieweeId: { in: seedUserIds } }
        ]
      }
    });

    // Delete PrivateOffers
    await prisma.privateOffer.deleteMany({
      where: {
        OR: [
          { clientId: { in: seedUserIds } },
          { workerId: { in: seedUserIds } }
        ]
      }
    });

    // Delete PrivateAds (services/extras cascade)
    // Need to delete services and extras first as they don't cascade
    const ads = await prisma.privateAd.findMany({
      where: { workerId: { in: seedUserIds } },
      select: { id: true }
    });
    const adIds = ads.map(a => a.id);

    if (adIds.length > 0) {
      await prisma.privateAdService.deleteMany({
        where: { privateAdId: { in: adIds } }
      });

      await prisma.privateAdExtra.deleteMany({
        where: { privateAdId: { in: adIds } }
      });

      await prisma.privateAd.deleteMany({
        where: { id: { in: adIds } }
      });
    }

    // Delete LiveStreamDonations
    await prisma.liveStreamDonation.deleteMany({
      where: {
        donorId: { in: seedUserIds }
      }
    });

    // Delete ChatMessages
    await prisma.chatMessage.deleteMany({
      where: {
        senderId: { in: seedUserIds }
      }
    });

    // Delete VIP Likes
    await prisma.vIPLike.deleteMany({
      where: {
        zesty_id: { in: seedUserIds }
      }
    });

    // Delete VIP Comments
    await prisma.vIPComment.deleteMany({
      where: {
        zesty_id: { in: seedUserIds }
      }
    });

    // Delete VIP Pages (content/subs cascade)
    await prisma.vIPPage.deleteMany({
      where: {
        zesty_id: { in: seedUserIds }
      }
    });

    // Delete Studios (and jobs via cascade)
    await prisma.studio.deleteMany({
      where: {
        slug: {
          endsWith: '-seed'
        }
      }
    });

    // Delete Users
    await prisma.user.deleteMany({
      where: {
        zesty_id: { in: seedUserIds }
      }
    });
  }

  console.log('👥 Creating escort profiles...');

  const profiles = [];

  for (let i = 0; i < 50; i++) {
    const age = randomAge();
    const location = randomElement(locations);
    const firstName = randomElement(firstNames);
    const gender = randomElement([Gender.MALE, Gender.FEMALE, Gender.TRANS]);
    const bodyType = randomElement([BodyType.REGULAR, BodyType.PLUS, BodyType.ATHLETE]);
    const race = randomElement([Race.ASIAN, Race.AFRICAN, Race.HISPANIC, Race.WHITE, Race.DESI, Race.ARABIC]);

    const profile = {
      supabaseId: randomUUID(),
      title: `${firstName} - ${location.city}`,
      slug: `${firstName.toLowerCase()}-${location.city.toLowerCase()}-${i}-seed`,
      bio: randomElement(bios),
      dob: getDateOfBirth(age),
      location: `${location.lat},${location.lon}`,
      suburb: `${location.city}, ${location.state}`,
      gender,
      bodyType,
      race,
      verified: Math.random() > 0.3, // 70% verified
      // image field removed from User model? No, it's not in the schema I read. 
      // Wait, let me check schema again. 
      // Schema: User has `images Images[]`. No `image` string field.
      // So I should not add `image` here.
    };

    profiles.push(profile);
  }

  // Create all profiles
  // We need to create them one by one or use createMany and then find them back
  // createMany is faster but doesn't return IDs.
  // We need IDs for relations.
  // So we'll use createMany then findMany.

  const created = await prisma.user.createMany({
    data: profiles,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${created.count} escort profiles`);

  // Get all created users
  const users = await prisma.user.findMany({
    where: {
      slug: {
        endsWith: '-seed'
      }
    },
    select: {
      zesty_id: true,
      slug: true,
      bio: true,
      dob: true,
      gender: true,
    }
  });

  console.log('🖼️  Adding profile images...');

  // Create images for each user (1 default + 2-4 additional images)
  const imagesToCreate = [];

  for (const user of users) {
    const userIndex = users.indexOf(user);
    const numImages = Math.floor(Math.random() * 3) + 3; // 3-5 images per user

    for (let imgIndex = 0; imgIndex < numImages; imgIndex++) {
      imagesToCreate.push({
        zesty_id: user.zesty_id,
        url: `https://i.pravatar.cc/600?img=${(userIndex * 10 + imgIndex) % 70 + 1}`,
        NSFW: Math.random() < 0.2, // 20% chance image is NSFW
        width: 600,
        height: 600,
        default: imgIndex === 0, // First image is default, others are not
      });
    }
  }

  await prisma.images.createMany({
    data: imagesToCreate,
    skipDuplicates: true,
  });

  console.log(`✅ Added images for ${users.length} profiles`);

  console.log('📋 Creating PrivateAds for escort profiles...');

  // Prepare all private ads data
  const privateAdsToCreate = [];
  const adsData = []; // Store metadata for creating services later

  for (const user of users) {
    // Generate random available days (at least 2 days, up to all 7)
    const allDays = [
      PrivateAdDaysAvailable.MONDAY,
      PrivateAdDaysAvailable.TUESDAY,
      PrivateAdDaysAvailable.WEDNESDAY,
      PrivateAdDaysAvailable.THURSDAY,
      PrivateAdDaysAvailable.FRIDAY,
      PrivateAdDaysAvailable.SATURDAY,
      PrivateAdDaysAvailable.SUNDAY,
    ];
    const numDays = Math.floor(Math.random() * 6) + 2; // 2-7 days
    const availableDays = allDays
      .sort(() => Math.random() - 0.5)
      .slice(0, numDays)
      .sort((a, b) => {
        // Sort days in order Monday-Sunday
        return allDays.indexOf(a) - allDays.indexOf(b);
      });

    privateAdsToCreate.push({
      workerId: user.zesty_id,
      title: randomElement([
        'Exclusive Companion Available',
        'Professional Escort Services',
        'Premium Companionship',
        'Discreet & Sophisticated',
        'Elite Escort Experience',
        'Luxury Companion Services',
        'Professional & Discreet',
        'Upscale Companion Available',
      ]),
      description: randomElement([
        'Offering professional companionship services for discerning clients. Available for dinner dates, social events, and private engagements.',
        'Experienced and sophisticated companion available for upscale occasions. I provide a genuine and memorable experience.',
        'Professional escort offering high-quality companionship. Discreet, reliable, and always punctual.',
        'Elite companion services for those who appreciate quality and discretion. Let me make your evening special.',
        'Available for various engagements including dinner dates, events, and private meetings. Professional and discreet.',
        'Sophisticated companion offering premium services. I cater to clients who value quality and authenticity.',
        'Professional escort with years of experience. I provide a relaxed and enjoyable experience for all occasions.',
        'Offering companion services for business and social events. Elegant, intelligent, and always professional.',
      ]),
      acceptsGender: [
        PrivateAdCustomerCategory.MEN,
        PrivateAdCustomerCategory.WOMEN,
        ...(Math.random() > 0.5 ? [PrivateAdCustomerCategory.GROUPS] : []),
      ],
      acceptsRace: [Race.ASIAN, Race.AFRICAN, Race.HISPANIC, Race.WHITE, Race.DESI, Race.ARABIC],
      daysAvailable: availableDays,
      active: Math.random() > 0.2, // 80% active, 20% inactive
    });

    // Store metadata for later use
    adsData.push({
      userId: user.zesty_id,
      numServices: Math.floor(Math.random() * 3) + 2, // 2-4 services
      numExtras: Math.floor(Math.random() * 4) + 1, // 1-4 extras
    });
  }

  // Create all private ads in batches
  // We need IDs for services, so we can't use createMany easily if we want to link services to ads.
  // But we can find them back by workerId.

  // Create all private ads in batches
  await prisma.privateAd.createMany({
    data: privateAdsToCreate,
    skipDuplicates: true,
  });

  // Get all created private ads
  const privateAds = await prisma.privateAd.findMany({
    where: {
      workerId: {
        in: users.map(u => u.zesty_id)
      }
    },
    select: {
      id: true,
      workerId: true,
    }
  });

  // Batch create services and extras
  const servicesToCreate = [];
  const servicesData = []; // Store for creating options later
  const extrasToCreate = [];

  for (const ad of privateAds) {
    const adMeta = adsData.find(d => d.userId === ad.workerId);
    if (!adMeta) continue;

    // Create descriptive label based on category
    const labels: Record<PrivateAdServiceCategory, string> = {
      [PrivateAdServiceCategory.MODELLING]: 'Modelling',
      [PrivateAdServiceCategory.VIDEO_CHAT]: 'Video Chat Session',
      [PrivateAdServiceCategory.IN_CALL]: 'Incall Service',
      [PrivateAdServiceCategory.OUT_CALL]: 'Outcall Service',
      [PrivateAdServiceCategory.MASSAGE]: 'Massage Session',
      [PrivateAdServiceCategory.MEET_AND_GREET]: 'Meet & Greet',
    };

    // Create services for this ad - ensure unique categories
    const availableCategories = [
      PrivateAdServiceCategory.IN_CALL,
      PrivateAdServiceCategory.OUT_CALL,
      PrivateAdServiceCategory.MASSAGE,
      PrivateAdServiceCategory.MEET_AND_GREET,
      PrivateAdServiceCategory.VIDEO_CHAT,
      PrivateAdServiceCategory.MODELLING,
    ];

    // Shuffle and take unique categories based on numServices
    const selectedCategories = availableCategories
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(adMeta.numServices, availableCategories.length));

    for (const category of selectedCategories) {
      servicesToCreate.push({
        privateAdId: ad.id,
        category,
        label: labels[category],
      });

      servicesData.push({
        adId: ad.id,
        category,
        numOptions: Math.floor(Math.random() * 3) + 2, // 2-4 options
      });
    }

    // Create extras for this ad
    const availableExtras = [
      PrivateAdExtraType.FILMING,
      PrivateAdExtraType.BJ,
      PrivateAdExtraType.ANAL,
      PrivateAdExtraType.BDSM,
      PrivateAdExtraType.NATURAL,
      PrivateAdExtraType.EXTRA_PERSON,
      PrivateAdExtraType.OUTSIDE_LOCATION,
      PrivateAdExtraType.COSTUME,
      PrivateAdExtraType.ROLEPLAY,
      PrivateAdExtraType.TOY_USE,
      PrivateAdExtraType.CREAMPIE,
      PrivateAdExtraType.GOLDEN_SHOWER,
    ];

    const selectedExtras = availableExtras
      .sort(() => Math.random() - 0.5)
      .slice(0, adMeta.numExtras);

    for (const extraType of selectedExtras) {
      const extraPrice = Math.floor(Math.random() * 150) + 50; // $50-$200

      extrasToCreate.push({
        privateAdId: ad.id,
        name: extraType,
        price: extraPrice,
        active: Math.random() > 0.2, // 80% active
      });
    }
  }

  // Batch create all services
  await prisma.privateAdService.createMany({
    data: servicesToCreate,
    skipDuplicates: true,
  });

  // Get all created services
  const services = await prisma.privateAdService.findMany({
    where: {
      privateAdId: {
        in: privateAds.map(ad => ad.id)
      }
    },
    select: {
      id: true,
      privateAdId: true,
      category: true,
    }
  });

  // Batch create service options
  const serviceOptionsToCreate = [];
  const durations = [15, 30, 60, 90, 120]; // minutes

  for (const service of services) {
    const serviceMeta = servicesData.find(s => s.adId === service.privateAdId && s.category === service.category);
    if (!serviceMeta) continue;

    for (let j = 0; j < serviceMeta.numOptions; j++) {
      const durationMin = durations[j % durations.length];

      // Price varies by category and duration
      let basePrice = 150;
      if (service.category === PrivateAdServiceCategory.OUT_CALL) basePrice = 200;
      else if (service.category === PrivateAdServiceCategory.MASSAGE) basePrice = 120;
      else if (service.category === PrivateAdServiceCategory.MEET_AND_GREET) basePrice = 100;

      const price = basePrice + Math.floor((durationMin / 30) * 100) + Math.floor(Math.random() * 50);

      serviceOptionsToCreate.push({
        serviceId: service.id,
        durationMin,
        price,
      });
    }
  }

  // Batch create all service options
  await prisma.privateAdServiceOption.createMany({
    data: serviceOptionsToCreate,
    skipDuplicates: true,
  });

  // Batch create all extras
  await prisma.privateAdExtra.createMany({
    data: extrasToCreate,
    skipDuplicates: true,
  });

  console.log(`✅ Created PrivateAds with services and extras for ${users.length} profiles`);

  console.log('⭐ Creating fake reviews...');

  // Create some fake client users (reviewers)
  const clientProfiles = [];
  for (let i = 0; i < 20; i++) {
    const firstName = randomElement(firstNames);
    const age = randomAge();

    clientProfiles.push({
      supabaseId: randomUUID(),
      // name: firstName, // User model doesn't have name
      title: firstName,
      slug: `${firstName.toLowerCase()}-client-${i}-seed`,
      dob: getDateOfBirth(age),
      verified: true,
    });
  }

  const createdClients = await prisma.user.createMany({
    data: clientProfiles,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${createdClients.count} client profiles for reviews`);

  // Get all client users
  const clients = await prisma.user.findMany({
    where: {
      slug: {
        contains: '-client-'
      }
    },
    select: {
      zesty_id: true,
    }
  });

  // Create reviews for escort profiles
  let totalReviews = 0;
  const escortReviewsToCreate = [];

  for (const escortUser of users) {
    // Each escort gets 0-8 reviews
    const numReviews = Math.floor(Math.random() * 9);

    for (let i = 0; i < numReviews; i++) {
      const reviewer = randomElement(clients);

      let rating: number;
      const rand = Math.random();
      if (rand < 0.60) rating = 5;
      else if (rand < 0.85) rating = 4;
      else if (rand < 0.95) rating = 3;
      else if (rand < 0.98) rating = 2;
      else rating = 1;

      const comment = randomElement(reviewComments);

      const daysAgo = Math.floor(Math.random() * 365);
      const reviewDate = new Date();
      reviewDate.setDate(reviewDate.getDate() - daysAgo);

      escortReviewsToCreate.push({
        reviewerId: reviewer.zesty_id,
        revieweeId: escortUser.zesty_id,
        rating,
        comment: rating >= 3 ? comment : (Math.random() > 0.5 ? comment : null),
        createdAt: reviewDate,
      });

      totalReviews++;
    }
  }

  await prisma.review.createMany({
    data: escortReviewsToCreate,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${totalReviews} reviews`);

  console.log('💎 Creating VIP pages and content...');

  const vipEscortCount = Math.floor(users.length * 0.6);
  const vipEscorts = users.slice(0, vipEscortCount);

  for (const escortUser of vipEscorts) {
    const isFree = Math.random() < 0.2;
    const subscriptionPrice = isFree ? 0 : Math.floor(Math.random() * 4500) + 499;

    const vipPage = await prisma.vIPPage.create({
      data: {
        zesty_id: escortUser.zesty_id,
        description: escortUser.bio || 'Welcome to my VIP page!',
        bannerUrl: `https://picsum.photos/seed/${escortUser.slug}/1200/400`,
        subscriptionPrice,
        isFree,
        active: true,
      }
    });

    // Create content
    const numContent = Math.floor(Math.random() * 10) + 5; // Reduced for speed

    for (let i = 0; i < numContent; i++) {
      let contentType: VIPContentType;
      const typeRand = Math.random();
      if (typeRand < 0.60) contentType = VIPContentType.IMAGE;
      else if (typeRand < 0.85) contentType = VIPContentType.VIDEO;
      else contentType = VIPContentType.STATUS;

      const contentData: any = {
        vipPageId: vipPage.id,
        type: contentType,
        caption: Math.random() < 0.7 ? randomElement(vipCaptions) : null,
        NSFW: Math.random() < 0.3,
      };

      if (contentType === VIPContentType.IMAGE) {
        contentData.imageUrl = `https://picsum.photos/seed/${escortUser.slug}${i}/800/800`;
        contentData.imageWidth = 800;
        contentData.imageHeight = 800;
      } else if (contentType === VIPContentType.VIDEO) {
        contentData.videoUrl = `https://sample-videos.com/video/mp4/720/big_buck_bunny_720p_1mb.mp4`;
        contentData.thumbnailUrl = `https://picsum.photos/seed/${escortUser.slug}${i}/800/800`;
        contentData.duration = 60;
      } else {
        contentData.statusText = randomElement(statusUpdates);
      }

      await prisma.vIPContent.create({
        data: contentData
      });
    }
  }

  console.log('📺 Creating livestream channels...');

  const livestreamCount = Math.floor(users.length * 0.4);
  const livestreamers = users.slice(0, livestreamCount);

  const liveStreamPagesToCreate = livestreamers.map((streamer, index) => {
    const streamKey = `sk_${(streamer.slug || '').substring(0, 8)}_${Date.now()}_${index}`;

    return {
      zesty_id: streamer.zesty_id,
      description: randomElement(livestreamBios),
      streamKey,
      active: true,
    };
  });

  await prisma.liveStreamPage.createMany({
    data: liveStreamPagesToCreate,
    skipDuplicates: true,
  });

  // Get created pages
  const liveStreamPages = await prisma.liveStreamPage.findMany({
    where: {
      zesty_id: {
        in: livestreamers.map(s => s.zesty_id)
      }
    },
    select: { id: true, zesty_id: true }
  });

  // Create streams
  const streamsToCreate = [];
  for (const page of liveStreamPages) {
    if (Math.random() < 0.75) {
      const roomName = `room_${page.id.substring(0, 8)}_live_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      streamsToCreate.push({
        channelId: page.id,
        title: randomElement(livestreamTitles),
        roomName,
        isLive: true,
        viewerCount: Math.floor(Math.random() * 100) + 1,
        startedAt: new Date(),
      });
    }
  }

  await prisma.liveStream.createMany({
    data: streamsToCreate,
    skipDuplicates: true,
  });

  console.log('🎉 Creating events...');

  const numEvents = 30;

  for (let i = 0; i < numEvents; i++) {
    const location = randomElement(locations);
    const organizer = randomElement(users);

    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 30));

    const event = await prisma.event.create({
      data: {
        organizerId: organizer.zesty_id,
        slug: `${randomElement(eventTitles).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${location.city.toLowerCase()}-${i}-seed`,
        title: randomElement(eventTitles),
        description: randomElement(eventDescriptions),
        coverImage: `https://picsum.photos/seed/event${i}/1200/600`,
        location: `${location.lat},${location.lon}`,
        suburb: `${location.city}, ${location.state}`,
        venue: randomElement(eventVenues),
        startTime: eventDate,
        status: EventStatus.OPEN,
        maxAttendees: 100,
      }
    });

    // Add attendees
    const numAttendees = Math.floor(Math.random() * 10) + 5;
    const attendees = clients.slice(0, numAttendees);

    const attendeesToCreate = attendees.map(attendee => ({
      zesty_id: attendee.zesty_id,
      eventId: event.id,
      status: EventAttendeeStatus.GOING,
    }));

    await prisma.eventAttendee.createMany({
      data: attendeesToCreate,
      skipDuplicates: true,
    });
  }

  console.log('💼 Creating studios and jobs...');

  const studioNames = [
    'Paradise Productions', 'Elite Studios', 'Glamour Productions', 'Nightlife Studios', 'Premium Content Co'
  ];

  for (let i = 0; i < studioNames.length; i++) {
    const location = randomElement(locations);
    const owner = randomElement(users);

    const studio = await prisma.studio.create({
      data: {
        name: studioNames[i],
        slug: `${studioNames[i].toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i}-seed`,
        description: 'Professional studio.',
        location: `${location.lat},${location.lon}`,
        suburb: `${location.city}, ${location.state}`,
        ownerId: owner.zesty_id,
        active: true,
        logo: `https://picsum.photos/seed/studio-logo-${i}/200/200`,
        coverImage: `https://picsum.photos/seed/studio-cover-${i}/1200/400`,
      }
    });

    // Create multiple jobs per studio
    for (let j = 0; j < 12; j++) {
      const type = randomElement([
        JobType.ACTOR,
        JobType.DIRECTOR,
        JobType.CAMERA_OPERATOR,
        JobType.EDITOR,
        JobType.PRODUCTION_STAFF,
        JobType.MODEL,
        JobType.OTHER
      ]);

      const titles = {
        [JobType.ACTOR]: ['Lead Actor Needed', 'Supporting Role', 'Background Extras', 'Character Actor', 'Voice Actor'],
        [JobType.DIRECTOR]: ['Assistant Director', 'Director of Photography', 'Art Director', 'Creative Director'],
        [JobType.CAMERA_OPERATOR]: ['Camera Operator', 'Steadicam Operator', 'Drone Operator', 'Videographer'],
        [JobType.EDITOR]: ['Video Editor', 'Colorist', 'Sound Editor', 'VFX Artist'],
        [JobType.PRODUCTION_STAFF]: ['Production Assistant', 'Gaffer', 'Grip', 'Boom Operator', 'Runner'],
        [JobType.MODEL]: ['Fashion Model', 'Hand Model', 'Fitness Model', 'Commercial Model'],
        [JobType.OTHER]: ['Makeup Artist', 'Costume Designer', 'Catering Staff', 'Set Designer']
      };

      const title = randomElement(titles[type]);

      await prisma.job.create({
        data: {
          title: title,
          slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${studio.slug}-${j}`,
          description: `We are looking for a talented ${title.toLowerCase()} to join our production. Great opportunity for the right candidate.`,
          type: type,
          payAmount: Math.floor(Math.random() * 90000) + 10000, // 100-1000
          startDate: new Date(),
          endDate: new Date(new Date().setDate(new Date().getDate() + Math.floor(Math.random() * 60) + 5)), // 5-65 days from now
          studioId: studio.id,
          status: JobStatus.OPEN,
          coverImage: `https://picsum.photos/seed/job-${i}-${j}/1200/600`,
        }
      });
    }
  }

  console.log('💕 Creating dating profiles...');

  const datingUsers = users.slice(0, 30);
  const datingProfilesToCreate = datingUsers.map(user => ({
    zesty_id: user.zesty_id,
    active: true,
    verified: true,
  }));

  await prisma.datingPage.createMany({
    data: datingProfilesToCreate,
    skipDuplicates: true,
  });

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
