import { PrismaClient, Gender, BodyType, Race, PrivateAdCustomerCategory, PrivateAdServiceCategory, PrivateAdExtraType, DaysAvailable, VIPContentType, EventStatus, EventAttendeeStatus, JobType, JobStatus, ApplicationStatus, SwipeDirection } from '@prisma/client';

const prisma = new PrismaClient();

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
  
  // Delete events and related data
  await prisma.eventComment.deleteMany({
    where: {
      post: {
        event: {
          organizer: {
            email: {
              contains: '@escort-seed.com'
            }
          }
        }
      }
    }
  });
  
  await prisma.eventPost.deleteMany({
    where: {
      event: {
        organizer: {
          email: {
            contains: '@escort-seed.com'
          }
        }
      }
    }
  });
  
  await prisma.eventAttendee.deleteMany({
    where: {
      event: {
        organizer: {
          email: {
            contains: '@escort-seed.com'
          }
        }
      }
    }
  });
  
  await prisma.event.deleteMany({
    where: {
      organizer: {
        email: {
          contains: '@escort-seed.com'
        }
      }
    }
  });
  
  // Delete livestream data
  await prisma.liveStreamDonation.deleteMany({
    where: {
      stream: {
        channel: {
          user: {
            email: {
              contains: '@escort-seed.com'
            }
          }
        }
      }
    }
  });
  
  await prisma.liveStream.deleteMany({
    where: {
      channel: {
        user: {
          email: {
            contains: '@escort-seed.com'
          }
        }
      }
    }
  });
  
  await prisma.liveStreamFollower.deleteMany({
    where: {
      channel: {
        user: {
          email: {
            contains: '@escort-seed.com'
          }
        }
      }
    }
  });
  
  await prisma.liveStreamPage.deleteMany({
    where: {
      user: {
        email: {
          contains: '@escort-seed.com'
        }
      }
    }
  });
  
  // Delete VIP content and related data first
  await prisma.vIPLike.deleteMany({
    where: {
      content: {
        vipPage: {
          user: {
            email: {
              contains: '@escort-seed.com'
            }
          }
        }
      }
    }
  });
  
  await prisma.vIPComment.deleteMany({
    where: {
      content: {
        vipPage: {
          user: {
            email: {
              contains: '@escort-seed.com'
            }
          }
        }
      }
    }
  });
  
  await prisma.vIPContent.deleteMany({
    where: {
      vipPage: {
        user: {
          email: {
            contains: '@escort-seed.com'
          }
        }
      }
    }
  });
  
  await prisma.vIPSubscription.deleteMany({
    where: {
      vipPage: {
        user: {
          email: {
            contains: '@escort-seed.com'
          }
        }
      }
    }
  });
  
  await prisma.vIPDiscountOffer.deleteMany({
    where: {
      vipPage: {
        user: {
          email: {
            contains: '@escort-seed.com'
          }
        }
      }
    }
  });
  
  await prisma.vIPPage.deleteMany({
    where: {
      user: {
        email: {
          contains: '@escort-seed.com'
        }
      }
    }
  });
  
  // Delete in order of dependencies
  await prisma.serviceOption.deleteMany({
    where: {
      service: {
        privateAd: {
          worker: {
            email: {
              contains: '@escort-seed.com'
            }
          }
        }
      }
    }
  });
  
  await prisma.privateAdExtra.deleteMany({
    where: {
      privateAd: {
        worker: {
          email: {
            contains: '@escort-seed.com'
          }
        }
      }
    }
  });
  
  await prisma.privateAdService.deleteMany({
    where: {
      privateAd: {
        worker: {
          email: {
            contains: '@escort-seed.com'
          }
        }
      }
    }
  });
  
  await prisma.privateAd.deleteMany({
    where: {
      worker: {
        email: {
          contains: '@escort-seed.com'
        }
      }
    }
  });
  
  // Delete reviews (both given and received by seed users)
  await prisma.review.deleteMany({
    where: {
      OR: [
        {
          reviewer: {
            email: {
              contains: '@escort-seed.com'
            }
          }
        },
        {
          reviewee: {
            email: {
              contains: '@escort-seed.com'
            }
          }
        }
      ]
    }
  });
  
  // Delete images (due to foreign key)
  await prisma.images.deleteMany({
    where: {
      user: {
        email: {
          contains: '@escort-seed.com'
        }
      }
    }
  });
  
  // Then delete users
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: '@escort-seed.com'
      }
    }
  });

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
      name: firstName,
      title: `${firstName} - ${location.city}`, // Add unified title
      email: `${firstName.toLowerCase()}.${i}@escort-seed.com`,
      slug: `${firstName.toLowerCase()}-${location.city.toLowerCase()}-${i}`,
      bio: randomElement(bios),
      dob: getDateOfBirth(age),
      location: `${location.lat},${location.lon}`,
      suburb: `${location.city}, ${location.state}`,
      gender,
      bodyType,
      race,
      verified: Math.random() > 0.3, // 70% verified
      image: `https://i.pravatar.cc/400?img=${i + 1}`,
    };

    profiles.push(profile);
  }

  // Create all profiles
  const created = await prisma.user.createMany({
    data: profiles,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${created.count} escort profiles`);

  // Get all created users and add some images
  const users = await prisma.user.findMany({
    where: {
      email: {
        contains: '@escort-seed.com'
      }
    },
    select: {
      id: true,
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
        userId: user.id,
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
    const userIndex = users.indexOf(user);
    
    // Generate random available days (at least 2 days, up to all 7)
    const allDays = [
      DaysAvailable.MONDAY,
      DaysAvailable.TUESDAY,
      DaysAvailable.WEDNESDAY,
      DaysAvailable.THURSDAY,
      DaysAvailable.FRIDAY,
      DaysAvailable.SATURDAY,
      DaysAvailable.SUNDAY,
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
      workerId: user.id,
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
      userId: user.id,
      numServices: Math.floor(Math.random() * 3) + 2, // 2-4 services
      numExtras: Math.floor(Math.random() * 4) + 1, // 1-4 extras
    });
  }
  
  // Create all private ads in batches
  for (const adData of privateAdsToCreate) {
    await prisma.privateAd.create({ data: adData });
  }
  
  // Get all created private ads
  const privateAds = await prisma.privateAd.findMany({
    where: {
      workerId: {
        in: users.map(u => u.id)
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
    
    // Create services for this ad
    for (let i = 0; i < adMeta.numServices; i++) {
      const category = randomElement([
        PrivateAdServiceCategory.IN_CALL,
        PrivateAdServiceCategory.OUT_CALL,
        PrivateAdServiceCategory.MASSAGE,
        PrivateAdServiceCategory.MEET_AND_GREET,
      ]);
      
      // Create descriptive label based on category
      const labels: Record<PrivateAdServiceCategory, string> = {
        [PrivateAdServiceCategory.VIDEO_CHAT]: 'Video Chat Session',
        [PrivateAdServiceCategory.IN_CALL]: 'Incall Service',
        [PrivateAdServiceCategory.OUT_CALL]: 'Outcall Service',
        [PrivateAdServiceCategory.MASSAGE]: 'Massage Session',
        [PrivateAdServiceCategory.MEET_AND_GREET]: 'Meet & Greet',
      };
      
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
  for (const serviceData of servicesToCreate) {
    await prisma.privateAdService.create({ data: serviceData });
  }
  
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
  await prisma.serviceOption.createMany({
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
      name: firstName,
      email: `${firstName.toLowerCase()}.client${i}@escort-seed.com`,
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
      email: {
        contains: '.client'
      }
    },
    select: {
      id: true,
    }
  });
  
  // Create reviews for escort profiles
  let totalReviews = 0;
  const escortReviewsToCreate = [];
  
  for (const escortUser of users) {
    // Each escort gets 0-8 reviews (some might have none)
    const numReviews = Math.floor(Math.random() * 9);
    
    for (let i = 0; i < numReviews; i++) {
      const reviewer = randomElement(clients);
      
      // Rating distribution: mostly 4-5 stars, some 3 stars, rare 1-2 stars
      let rating: number;
      const rand = Math.random();
      if (rand < 0.60) rating = 5; // 60% are 5 stars
      else if (rand < 0.85) rating = 4; // 25% are 4 stars
      else if (rand < 0.95) rating = 3; // 10% are 3 stars
      else if (rand < 0.98) rating = 2; // 3% are 2 stars
      else rating = 1; // 2% are 1 star
      
      const comment = randomElement(reviewComments);
      
      // Create review with random timestamp in the past year
      const daysAgo = Math.floor(Math.random() * 365);
      const reviewDate = new Date();
      reviewDate.setDate(reviewDate.getDate() - daysAgo);
      
      escortReviewsToCreate.push({
        reviewerId: reviewer.id,
        revieweeId: escortUser.id,
        rating,
        comment: rating >= 3 ? comment : (Math.random() > 0.5 ? comment : null), // Lower ratings less likely to have comments
        createdAt: reviewDate,
      });
      
      totalReviews++;
    }
  }
  
  // Batch create all reviews
  await prisma.review.createMany({
    data: escortReviewsToCreate,
    skipDuplicates: true,
  });
  
  console.log(`✅ Created ${totalReviews} reviews across ${users.length} escort profiles`);
  
  console.log('💎 Creating VIP pages and content...');
  
  // Create VIP pages for 60% of escorts (30 out of 50)
  const vipEscortCount = Math.floor(users.length * 0.6);
  const vipEscorts = users.slice(0, vipEscortCount);
  
  console.log(`   Creating ${vipEscortCount} VIP pages with content...`);
  
  let totalVIPContent = 0;
  let totalVIPSubscriptions = 0;
  let totalVIPLikes = 0;
  let totalVIPComments = 0;
  
  for (const escortUser of vipEscorts) {
    const escortIndex = vipEscorts.indexOf(escortUser);
    console.log(`   [${escortIndex + 1}/${vipEscortCount}] Creating VIP page...`);
    
    // Determine if this is a free or paid page (20% free, 80% paid)
    const isFree = Math.random() < 0.2;
    
    // Generate subscription price between $4.99 and $49.99
    const subscriptionPrice = isFree ? 0 : Math.floor(Math.random() * 4500) + 499; // 499-4999 cents
    
    // Get escort details for the VIP page
    const escortDetails = await prisma.user.findUnique({
      where: { id: escortUser.id },
      select: { slug: true, bio: true }
    });
    
    // Create VIP page
    const vipPage = await prisma.vIPPage.create({
      data: {
        userId: escortUser.id,
        description: escortDetails?.bio || 'Welcome to my VIP page! Subscribe for exclusive content, behind-the-scenes access, and special updates just for you.',
        bannerUrl: `https://picsum.photos/seed/${escortIndex}/1200/400`, // Random banner
        subscriptionPrice,
        isFree,
        active: true,
      }
    });
    
    // 30% chance of having an active discount
    if (!isFree && Math.random() < 0.3) {
      const discountPercent = randomElement([10, 15, 20, 25, 30]);
      const discountedPrice = Math.floor(subscriptionPrice * (1 - discountPercent / 100));
      
      // Discount valid for 7-30 days
      const validDays = Math.floor(Math.random() * 24) + 7;
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + validDays);
      
      await prisma.vIPDiscountOffer.create({
        data: {
          vipPageId: vipPage.id,
          discountPercent,
          discountedPrice,
          active: true,
          validUntil,
        }
      });
    }
    
    // Create 15-40 pieces of content for each VIP page
    const numContent = Math.floor(Math.random() * 26) + 15;
    console.log(`      Creating ${numContent} content pieces...`);
    
    const contentToCreate = [];
    
    for (let i = 0; i < numContent; i++) {
      // Content type distribution: 60% images, 25% videos, 15% status updates
      let contentType: VIPContentType;
      const typeRand = Math.random();
      if (typeRand < 0.60) contentType = VIPContentType.IMAGE;
      else if (typeRand < 0.85) contentType = VIPContentType.VIDEO;
      else contentType = VIPContentType.STATUS;
      
      // Random date in the past 6 months
      const daysAgo = Math.floor(Math.random() * 180);
      const contentDate = new Date();
      contentDate.setDate(contentDate.getDate() - daysAgo);
      
      const contentData: any = {
        vipPageId: vipPage.id,
        type: contentType,
        caption: Math.random() < 0.7 ? randomElement(vipCaptions) : null, // 70% have captions
        NSFW: Math.random() < 0.3, // 30% marked as NSFW
        createdAt: contentDate,
      };
      
      // Add type-specific data
      if (contentType === VIPContentType.IMAGE) {
        const imageNum = (escortIndex * 100 + i) % 1000;
        contentData.imageUrl = `https://picsum.photos/seed/${imageNum}/800/800`;
        contentData.imageWidth = 800;
        contentData.imageHeight = 800;
      } else if (contentType === VIPContentType.VIDEO) {
        const videoNum = (escortIndex * 100 + i) % 1000;
        contentData.videoUrl = `https://sample-videos.com/video/mp4/720/big_buck_bunny_720p_1mb.mp4`;
        contentData.thumbnailUrl = `https://picsum.photos/seed/${videoNum}/800/800`;
        contentData.duration = Math.floor(Math.random() * 600) + 30; // 30s - 10min
      } else {
        contentData.statusText = randomElement(statusUpdates);
      }
      
      const content = await prisma.vIPContent.create({
        data: contentData
      });
      
      totalVIPContent++;
    }
    
    // Now batch create likes and comments for all content
    console.log(`      Adding likes and comments...`);
    
    // Get all content for this VIP page
    const pageContent = await prisma.vIPContent.findMany({
      where: { vipPageId: vipPage.id },
      select: { id: true, createdAt: true }
    });
    
    // Batch create likes
    const likesToCreate = [];
    for (const content of pageContent) {
      const numLikes = Math.floor(Math.random() * 15); // Reduced from 25 to 15
      const likingClients = clients
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(numLikes, clients.length));
      
      for (const client of likingClients) {
        likesToCreate.push({
          userId: client.id,
          contentId: content.id,
        });
      }
    }
    
    if (likesToCreate.length > 0) {
      await prisma.vIPLike.createMany({
        data: likesToCreate,
        skipDuplicates: true,
      });
      totalVIPLikes += likesToCreate.length;
    }
    
    // Batch create comments
    const commentsToCreate = [];
    for (const content of pageContent) {
      const numComments = Math.floor(Math.random() * 5); // Reduced from 9 to 5
      const commentingClients = clients
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(numComments, clients.length));
      
      for (const client of commentingClients) {
        const daysAgo = Math.floor((Date.now() - content.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        const commentDaysAfter = Math.floor(Math.random() * Math.min(7, Math.max(1, daysAgo)));
        const commentDate = new Date(content.createdAt);
        commentDate.setDate(commentDate.getDate() + commentDaysAfter);
        
        commentsToCreate.push({
          userId: client.id,
          contentId: content.id,
          text: randomElement(vipComments),
          createdAt: commentDate,
        });
      }
    }
    
    if (commentsToCreate.length > 0) {
      await prisma.vIPComment.createMany({
        data: commentsToCreate,
        skipDuplicates: true,
      });
      totalVIPComments += commentsToCreate.length;
    }
    
    // Create subscriptions (some clients subscribe to VIP pages)
    console.log(`      Creating subscriptions...`);
    const numSubscribers = Math.floor(Math.random() * 15) + 5; // 5-20 subscribers per page
    const subscribers = clients
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(numSubscribers, clients.length));
    
    const subscriptionsToCreate = [];
    for (const subscriber of subscribers) {
      const isActive = Math.random() < 0.85; // 85% active subscriptions
      
      // Subscription started 1-180 days ago
      const startedDaysAgo = Math.floor(Math.random() * 180) + 1;
      const subscriptionDate = new Date();
      subscriptionDate.setDate(subscriptionDate.getDate() - startedDaysAgo);
      
      // Expires in 30 days from start (monthly subscription)
      const expiresAt = new Date(subscriptionDate);
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      subscriptionsToCreate.push({
        subscriberId: subscriber.id,
        vipPageId: vipPage.id,
        active: isActive,
        amountPaid: isFree ? 0 : subscriptionPrice,
        expiresAt: isFree ? null : expiresAt,
        createdAt: subscriptionDate,
      });
    }
    
    if (subscriptionsToCreate.length > 0) {
      await prisma.vIPSubscription.createMany({
        data: subscriptionsToCreate,
        skipDuplicates: true,
      });
      totalVIPSubscriptions += subscriptionsToCreate.length;
    }
    
    console.log(`      ✓ Completed VIP page ${escortIndex + 1}/${vipEscortCount}`);
  }
  
  console.log(`✅ Created ${vipEscortCount} VIP pages with content`);
  console.log(`   - Total VIP content pieces: ${totalVIPContent}`);
  console.log(`   - Total VIP subscriptions: ${totalVIPSubscriptions}`);
  console.log(`   - Total VIP likes: ${totalVIPLikes}`);
  console.log(`   - Total VIP comments: ${totalVIPComments}`);
  
  console.log('📺 Creating livestream channels...');
  
  // Get full user details for livestreamers (40% of escorts)
  const livestreamCount = Math.floor(users.length * 0.4);
  const livestreamers = await prisma.user.findMany({
    where: {
      id: {
        in: users.slice(0, livestreamCount).map(u => u.id)
      },
      slug: {
        not: null  // Ensure user has a slug
      }
    },
    select: {
      id: true,
      slug: true,
      image: true
    }
  });
  
  let totalLiveStreamPages = 0;
  let totalFollowers = 0;
  let totalStreams = 0;
  
  // Batch create livestream pages
  const liveStreamPagesToCreate = livestreamers.map((streamer, index) => {
    const streamKey = `sk_${streamer.id.substring(0, 8)}_${Date.now()}_${index}`;
    
    return {
      userId: streamer.id,
      description: randomElement(livestreamBios),
      streamKey,
      active: true,
    };
  });
  
  // Create all livestream pages at once
  await prisma.liveStreamPage.createMany({
    data: liveStreamPagesToCreate,
    skipDuplicates: true,
  });
  
  totalLiveStreamPages = liveStreamPagesToCreate.length;
  
  // Get created livestream pages WITH ACTIVE STATUS to ensure we only create live streams for active pages
  const liveStreamPages = await prisma.liveStreamPage.findMany({
    where: {
      userId: {
        in: livestreamers.map(s => s.id)
      },
      active: true  // Only get active livestream pages
    },
    select: {
      id: true,
      userId: true,
      active: true
    }
  });
  
  console.log(`   Creating followers and past streams...`);
  
  // Batch create followers and streams
  const followersToCreate = [];
  const streamsToCreate = [];
  
  for (const liveStreamPage of liveStreamPages) {
    // Add followers (5-25 followers per channel)
    const numFollowers = Math.floor(Math.random() * 21) + 5;
    const followers = clients
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(numFollowers, clients.length));
    
    for (const follower of followers) {
      // Followed 1-180 days ago
      const followedDaysAgo = Math.floor(Math.random() * 180) + 1;
      const followDate = new Date();
      followDate.setDate(followDate.getDate() - followedDaysAgo);
      
      followersToCreate.push({
        userId: follower.id,
        channelId: liveStreamPage.id,
        createdAt: followDate,
      });
    }
    
    // Create 2-5 past stream sessions for each channel
    const numPastStreams = Math.floor(Math.random() * 4) + 2;
    
    for (let i = 0; i < numPastStreams; i++) {
      // Stream happened 1-90 days ago
      const streamDaysAgo = Math.floor(Math.random() * 90) + 1;
      const streamStartDate = new Date();
      streamStartDate.setDate(streamStartDate.getDate() - streamDaysAgo);
      streamStartDate.setHours(Math.floor(Math.random() * 24));
      streamStartDate.setMinutes(Math.floor(Math.random() * 60));
      
      // Stream duration: 30min - 4 hours
      const durationMinutes = Math.floor(Math.random() * 210) + 30;
      const streamEndDate = new Date(streamStartDate);
      streamEndDate.setMinutes(streamEndDate.getMinutes() + durationMinutes);
      
      // Generate room name for this session
      const roomName = `room_${liveStreamPage.id.substring(0, 8)}_${streamStartDate.getTime()}_${i}`;
      
      streamsToCreate.push({
        channelId: liveStreamPage.id,
        title: randomElement(livestreamTitles),
        roomName,
        isLive: false, // Past streams are not live
        viewerCount: Math.floor(Math.random() * 50) + 5, // 5-55 peak viewers
        startedAt: streamStartDate,
        endedAt: streamEndDate,
      });
    }
  }

  // Create CURRENTLY LIVE streams for 75% of channels (so we have enough to test with)
  let totalLiveStreams = 0;
  for (const liveStreamPage of liveStreamPages) {
    if (Math.random() < 0.75) { // 75% chance of being live
      // Stream started 10 minutes to 3 hours ago
      const minutesAgo = Math.floor(Math.random() * 170) + 10;
      const streamStartDate = new Date();
      streamStartDate.setMinutes(streamStartDate.getMinutes() - minutesAgo);
      
      const roomName = `room_${liveStreamPage.id.substring(0, 8)}_live_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      streamsToCreate.push({
        channelId: liveStreamPage.id,
        title: randomElement(livestreamTitles),
        roomName,
        isLive: true, // Currently streaming!
        viewerCount: Math.floor(Math.random() * 100) + 1, // 1-100 current viewers
        startedAt: streamStartDate,
        endedAt: null, // Still streaming
      });
      totalLiveStreams++;
    }
  }
  
  // Batch create all followers
  if (followersToCreate.length > 0) {
    await prisma.liveStreamFollower.createMany({
      data: followersToCreate,
      skipDuplicates: true,
    });
    totalFollowers = followersToCreate.length;
  }
  
  // Batch create all streams
  if (streamsToCreate.length > 0) {
    await prisma.liveStream.createMany({
      data: streamsToCreate,
      skipDuplicates: true,
    });
    totalStreams = streamsToCreate.length;
  }
  
  console.log(`✅ Created ${totalLiveStreamPages} livestream channels`);
  console.log(`   - Total followers: ${totalFollowers}`);
  console.log(`   - Total past streams: ${totalStreams}`);
  console.log(`   - Currently live: ${totalLiveStreams}`);
  
  console.log('🎉 Creating events...');
  
  // Create 30 events across different locations and dates
  const numEvents = 30;
  let totalEvents = 0;
  let totalEventAttendees = 0;
  let totalEventPosts = 0;
  let totalEventComments = 0;
  
  for (let i = 0; i < numEvents; i++) {
    const location = randomElement(locations);
    
    // Event status distribution
    let eventStatus: EventStatus;
    const statusRand = Math.random();
    if (statusRand < 0.60) eventStatus = EventStatus.OPEN; // 60% open
    else if (statusRand < 0.75) eventStatus = EventStatus.INVITE_ONLY; // 15% invite only
    else if (statusRand < 0.85) eventStatus = EventStatus.REQUEST_TO_JOIN; // 10% request to join
    else eventStatus = EventStatus.PAY_TO_JOIN; // 15% paid
    
    // Event timing
    const isToday = i < 5; // First 5 events are today
    const isThisWeek = i < 15; // Next 10 events are this week
    // Rest are next 2-4 weeks
    
    const eventDate = new Date();
    if (isToday) {
      // Today: between now and midnight
      eventDate.setHours(Math.floor(Math.random() * 8) + 16); // 4pm - midnight
      eventDate.setMinutes(Math.floor(Math.random() * 60));
    } else if (isThisWeek) {
      // This week: 1-7 days from now
      eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 7) + 1);
      eventDate.setHours(Math.floor(Math.random() * 12) + 12); // noon - midnight
      eventDate.setMinutes(Math.floor(Math.random() * 60));
    } else {
      // Next 2-4 weeks
      eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 14) + 14);
      eventDate.setHours(Math.floor(Math.random() * 12) + 12);
      eventDate.setMinutes(Math.floor(Math.random() * 60));
    }
    
    // Event duration: 2-6 hours
    const durationHours = Math.floor(Math.random() * 5) + 2;
    const endDate = new Date(eventDate);
    endDate.setHours(endDate.getHours() + durationHours);
    
    // Price for paid events: $10-$100
    const price = eventStatus === EventStatus.PAY_TO_JOIN 
      ? Math.floor(Math.random() * 90) + 10 
      : null;
    
    // Max attendees: 10-200
    const maxAttendees = Math.floor(Math.random() * 190) + 10;
    
    // Random organizer (use escorts as organizers)
    const organizer = randomElement(users);
    
    // Create event
    const event = await prisma.event.create({
      data: {
        organizerId: organizer.id,
        slug: `${randomElement(eventTitles).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${location.city.toLowerCase()}-${i}`,
        title: randomElement(eventTitles),
        description: randomElement(eventDescriptions),
        coverImage: `https://picsum.photos/seed/event${i}/1200/600`,
        location: `${location.lat},${location.lon}`,
        suburb: `${location.city}, ${location.state}`,
        venue: randomElement(eventVenues),
        startTime: eventDate,
        endTime: endDate,
        status: eventStatus,
        price,
        maxAttendees,
      }
    });
    
    totalEvents++;
    
    // Add attendees (5-30 attendees per event)
    const numAttendees = Math.floor(Math.random() * 26) + 5;
    const attendees = clients
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(numAttendees, clients.length));
    
    const attendeesToCreate = [];
    for (const attendee of attendees) {
      // Status distribution based on event status
      let attendeeStatus: EventAttendeeStatus;
      
      if (eventStatus === EventStatus.INVITE_ONLY) {
        // For invite only: mix of invited, going, maybe
        const rand = Math.random();
        if (rand < 0.50) attendeeStatus = EventAttendeeStatus.GOING;
        else if (rand < 0.75) attendeeStatus = EventAttendeeStatus.MAYBE;
        else attendeeStatus = EventAttendeeStatus.INVITED;
      } else if (eventStatus === EventStatus.REQUEST_TO_JOIN) {
        // For request to join: mix of going, pending, declined
        const rand = Math.random();
        if (rand < 0.70) attendeeStatus = EventAttendeeStatus.GOING;
        else if (rand < 0.90) attendeeStatus = EventAttendeeStatus.PENDING;
        else attendeeStatus = EventAttendeeStatus.DECLINED;
      } else {
        // For open/paid: mostly going, some maybe
        const rand = Math.random();
        if (rand < 0.80) attendeeStatus = EventAttendeeStatus.GOING;
        else attendeeStatus = EventAttendeeStatus.MAYBE;
      }
      
      // Joined 1-30 days ago (or hours ago for today's events)
      const joinedDate = new Date(eventDate);
      if (isToday) {
        joinedDate.setHours(joinedDate.getHours() - Math.floor(Math.random() * 24));
      } else {
        joinedDate.setDate(joinedDate.getDate() - Math.floor(Math.random() * 30) - 1);
      }
      
      attendeesToCreate.push({
        userId: attendee.id,
        eventId: event.id,
        status: attendeeStatus,
        createdAt: joinedDate,
      });
    }
    
    if (attendeesToCreate.length > 0) {
      await prisma.eventAttendee.createMany({
        data: attendeesToCreate,
        skipDuplicates: true,
      });
      totalEventAttendees += attendeesToCreate.length;
    }
    
    // Create posts from attendees (2-8 posts per event)
    const confirmedAttendees = attendeesToCreate.filter(
      a => a.status === EventAttendeeStatus.GOING || a.status === EventAttendeeStatus.MAYBE
    );
    
    if (confirmedAttendees.length > 0) {
      const numPosts = Math.floor(Math.random() * 7) + 2;
      
      for (let p = 0; p < Math.min(numPosts, confirmedAttendees.length); p++) {
        const poster = randomElement(confirmedAttendees);
        
        // Post created between join date and event date
        const postDate = new Date(poster.createdAt);
        const daysBetween = Math.floor((eventDate.getTime() - poster.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        if (daysBetween > 0) {
          postDate.setDate(postDate.getDate() + Math.floor(Math.random() * daysBetween));
        }
        
        const post = await prisma.eventPost.create({
          data: {
            eventId: event.id,
            authorId: poster.userId,
            content: randomElement(eventPostTexts),
            createdAt: postDate,
          }
        });
        
        totalEventPosts++;
        
        // Add comments to posts (0-5 comments per post)
        const numComments = Math.floor(Math.random() * 6);
        
        for (let c = 0; c < Math.min(numComments, confirmedAttendees.length); c++) {
          const commenter = randomElement(confirmedAttendees);
          
          // Comment created after post
          const commentDate = new Date(postDate);
          const hoursAfterPost = Math.floor(Math.random() * 48) + 1; // 1-48 hours after post
          commentDate.setHours(commentDate.getHours() + hoursAfterPost);
          
          // Only create comment if it's before event date
          if (commentDate < eventDate) {
            await prisma.eventComment.create({
              data: {
                postId: post.id,
                authorId: commenter.userId,
                content: randomElement(eventCommentTexts),
                createdAt: commentDate,
              }
            });
            
            totalEventComments++;
          }
        }
      }
    }
  }
  
  console.log(`✅ Created ${totalEvents} events`);
  console.log(`   - Events today: 5`);
  console.log(`   - Events this week: 10`);
  console.log(`   - Events next 2-4 weeks: 15`);
  console.log(`   - Total attendees: ${totalEventAttendees}`);
  console.log(`   - Total posts: ${totalEventPosts}`);
  console.log(`   - Total comments: ${totalEventComments}`);
  
  console.log('💼 Creating studios and jobs...');
  
  // Import JobType, JobStatus, ApplicationStatus from Prisma
  const { JobType, JobStatus, ApplicationStatus } = await import('@prisma/client');
  
  // Create 10 studios
  const studioNames = [
    'Paradise Productions',
    'Elite Studios',
    'Glamour Productions',
    'Nightlife Studios',
    'Premium Content Co',
    'Luxury Media Group',
    'Diamond Studios',
    'Exclusive Productions',
    'VIP Content Studio',
    'Premier Media',
  ];
  
  const studioDescriptions = [
    'Professional adult content production company with over 10 years of experience. We prioritize performer safety and satisfaction.',
    'Leading studio in the industry, known for high-quality productions and fair treatment of performers. Join our professional team!',
    'Award-winning production company seeking talented performers for upcoming projects. Competitive rates and professional environment.',
    'Established studio specializing in premium content creation. We offer a safe, respectful, and professional work environment.',
    'Top-rated studio with a reputation for excellence. We work with the best talent and provide top-tier compensation.',
    'Professional media company creating high-quality adult content. We value professionalism, safety, and mutual respect.',
    'Innovative production studio pushing creative boundaries. Join our team of professional performers and crew.',
    'Boutique studio focusing on artistic, high-end content. Looking for dedicated performers who take their craft seriously.',
    'Well-established production company with state-of-the-art facilities. Professional, safe, and respectful workplace.',
    'Premium content studio known for treating performers with respect and offering competitive compensation packages.',
  ];
  
  const studiosToCreate = [];
  
  for (let i = 0; i < studioNames.length; i++) {
    const location = randomElement(locations);
    const owner = randomElement(users);
    
    studiosToCreate.push({
      name: studioNames[i],
      slug: studioNames[i].toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: studioDescriptions[i],
      logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(studioNames[i])}&size=200&background=random`,
      coverImage: `https://picsum.photos/seed/studio${i}/1200/400`,
      location: `${location.lat},${location.lon}`,
      suburb: `${location.city}, ${location.state}`,
      website: `https://${studioNames[i].toLowerCase().replace(/[^a-z0-9]+/g, '')}.com.au`,
      email: `contact@${studioNames[i].toLowerCase().replace(/[^a-z0-9]+/g, '')}.com.au`,
      verified: Math.random() > 0.3, // 70% verified
      active: true,
      ownerId: owner.id,
    });
  }
  
  // Batch create studios
  await prisma.studio.createMany({
    data: studiosToCreate,
    skipDuplicates: true,
  });
  
  const studios = await prisma.studio.findMany({
    select: { id: true, name: true, suburb: true, location: true }
  });
  
  console.log(`✅ Created ${studios.length} studios`);
  
  // Add some studio admins (some studios have additional admins)
  const studioAdminsToCreate = [];
  
  for (const studio of studios) {
    // 50% chance a studio has 1-3 additional admins
    if (Math.random() < 0.5) {
      const numAdmins = Math.floor(Math.random() * 3) + 1;
      const adminUsers = users
        .sort(() => Math.random() - 0.5)
        .slice(0, numAdmins);
      
      for (const admin of adminUsers) {
        studioAdminsToCreate.push({
          studioId: studio.id,
          userId: admin.id,
          canPostJobs: true,
          canManageJobs: Math.random() > 0.3, // 70% can manage jobs
          canInviteAdmins: Math.random() > 0.7, // 30% can invite admins
        });
      }
    }
  }
  
  if (studioAdminsToCreate.length > 0) {
    await prisma.studioAdmin.createMany({
      data: studioAdminsToCreate,
      skipDuplicates: true,
    });
  }
  
  console.log(`   - Added ${studioAdminsToCreate.length} studio admins`);
  
  // Create 40 job postings across all studios
  const jobTitles = {
    [JobType.ACTOR]: [
      'Male Performer Needed - Feature Film',
      'Female Talent for Solo Scenes',
      'Couples Scene - Professional Performers',
      'Adult Film Actor - Ongoing Work',
      'Experienced Performer for Premium Content',
    ],
    [JobType.MODEL]: [
      'Glamour Photo Shoot - Model Needed',
      'Lingerie Photoshoot',
      'Fashion Model for Adult Brand',
      'Photography Model - Multiple Sessions',
      'Professional Model for Content Creation',
    ],
    [JobType.CAMERA_OPERATOR]: [
      'Camera Operator - Adult Productions',
      'Videographer for Studio Content',
      'Professional Camera Operator Needed',
      'Senior Camera Operator - Feature Films',
    ],
    [JobType.DIRECTOR]: [
      'Content Director - Creative Vision Required',
      'Assistant Director for Productions',
      'Experienced Director for Premium Content',
    ],
    [JobType.EDITOR]: [
      'Video Editor - Post Production',
      'Senior Editor for Adult Content',
      'Freelance Video Editor Needed',
    ],
    [JobType.PRODUCTION_STAFF]: [
      'Production Assistant Wanted',
      'Set Designer for Adult Productions',
      'Lighting Technician Needed',
      'Makeup Artist for Adult Content',
    ],
  };
  
  const jobDescriptionTemplates = {
    [JobType.ACTOR]: 'We are seeking professional performers for an upcoming production. Must be 18+, reliable, and comfortable with adult content. Competitive rates and professional environment.',
    [JobType.MODEL]: 'Looking for confident models for photo/video content creation. Must be 18+, professional, and experienced with adult modeling. Great rates for the right candidate.',
    [JobType.CAMERA_OPERATOR]: 'Experienced camera operator needed for professional adult content production. Must have portfolio and references. Excellent pay for skilled professionals.',
    [JobType.DIRECTOR]: 'Seeking creative director with vision and experience in adult content production. Must have proven track record and professional references.',
    [JobType.EDITOR]: 'Professional video editor needed for post-production work. Must be experienced with industry-standard software and have adult content editing experience.',
    [JobType.PRODUCTION_STAFF]: 'Production crew member needed for various roles on set. Must be professional, reliable, and comfortable working in adult content environment.',
  };
  
  const jobsToCreate = [];
  const totalJobsToCreate = 40;
  
  for (let i = 0; i < totalJobsToCreate; i++) {
    const studio = randomElement(studios);
    const jobType = randomElement([
      JobType.ACTOR,
      JobType.ACTOR,
      JobType.ACTOR, // More actor jobs
      JobType.MODEL,
      JobType.MODEL, // More model jobs
      JobType.CAMERA_OPERATOR,
      JobType.DIRECTOR,
      JobType.EDITOR,
      JobType.PRODUCTION_STAFF,
    ]);
    
    const titleOptions = jobTitles[jobType];
    const title = randomElement(titleOptions);
    
    // Status distribution: 60% open, 20% closed, 15% filled, 5% cancelled
    let status: JobStatus;
    const statusRand = Math.random();
    if (statusRand < 0.60) status = JobStatus.OPEN;
    else if (statusRand < 0.80) status = JobStatus.CLOSED;
    else if (statusRand < 0.95) status = JobStatus.FILLED;
    else status = JobStatus.CANCELLED;
    
    // Job start date: 1-60 days from now for open jobs, past dates for closed/filled
    const startDate = new Date();
    if (status === JobStatus.OPEN) {
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 60) + 1);
    } else {
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 90)); // Past dates
    }
    
    // End date: 1-7 days after start
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 7) + 1);
    
    // Pay varies by job type
    let basePayAmount = 0;
    let payType = 'FIXED';
    
    if (jobType === JobType.ACTOR || jobType === JobType.MODEL) {
      basePayAmount = Math.floor(Math.random() * 150000) + 50000; // $500-$2000
      payType = 'FIXED';
    } else if (jobType === JobType.CAMERA_OPERATOR || jobType === JobType.DIRECTOR) {
      basePayAmount = Math.floor(Math.random() * 10000) + 5000; // $50-$150/hour
      payType = 'HOURLY';
    } else {
      basePayAmount = Math.floor(Math.random() * 30000) + 20000; // $200-$500/day
      payType = 'DAILY';
    }
    
    // Duration
    const lengthHours = payType === 'HOURLY' ? Math.floor(Math.random() * 8) + 2 : null;
    const lengthDays = payType === 'DAILY' ? Math.floor(Math.random() * 5) + 1 : null;
    
    jobsToCreate.push({
      title,
      slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${studio.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i}`,
      description: jobDescriptionTemplates[jobType],
      type: jobType,
      payAmount: basePayAmount,
      payType,
      lengthHours,
      lengthDays,
      location: studio.location || null,  // Use studio.location (lat,lon) instead of suburb
      suburb: studio.suburb,
      venue: `${studio.name} Studios`,
      startDate,
      endDate,
      requirements: 'Must be 18+, professional, and have valid ID. References preferred.',
      coverImage: `https://picsum.photos/seed/job${i}/1200/600`,
      status,
      maxApplicants: status === JobStatus.OPEN ? Math.floor(Math.random() * 20) + 10 : null,
      studioId: studio.id,
    });
  }
  
  // Batch create jobs
  await prisma.job.createMany({
    data: jobsToCreate,
    skipDuplicates: true,
  });
  
  const jobs = await prisma.job.findMany({
    select: { id: true, status: true }
  });
  
  console.log(`✅ Created ${jobs.length} job postings`);
  
  // Create job applications
  const applicationsToCreate = [];
  
  for (const job of jobs) {
    // Only create applications for non-cancelled jobs
    if (job.status !== JobStatus.CANCELLED) {
      // 3-15 applications per job
      const numApplications = Math.floor(Math.random() * 13) + 3;
      const applicants = users
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(numApplications, users.length));
      
      for (const applicant of applicants) {
        let appStatus: ApplicationStatus;
        
        if (job.status === JobStatus.OPEN) {
          // Open jobs: mostly pending, some accepted/rejected
          const rand = Math.random();
          if (rand < 0.70) appStatus = ApplicationStatus.PENDING;
          else if (rand < 0.85) appStatus = ApplicationStatus.ACCEPTED;
          else if (rand < 0.95) appStatus = ApplicationStatus.REJECTED;
          else appStatus = ApplicationStatus.WITHDRAWN;
        } else if (job.status === JobStatus.FILLED) {
          // Filled jobs: one accepted, rest rejected or withdrawn
          const rand = Math.random();
          if (rand < 0.10) appStatus = ApplicationStatus.ACCEPTED; // Only 1-2 accepted
          else if (rand < 0.80) appStatus = ApplicationStatus.REJECTED;
          else appStatus = ApplicationStatus.WITHDRAWN;
        } else {
          // Closed jobs: mix of rejected and withdrawn
          const rand = Math.random();
          if (rand < 0.70) appStatus = ApplicationStatus.REJECTED;
          else appStatus = ApplicationStatus.WITHDRAWN;
        }
        
        const coverLetters = [
          'I am very interested in this opportunity. I have extensive experience and would love to work with your team.',
          'I believe I would be a great fit for this role. Please review my profile and let me know if you would like to discuss further.',
          'Experienced professional seeking new opportunities. I am reliable, professional, and easy to work with.',
          'I would love to be considered for this position. I have the skills and experience you are looking for.',
          'Professional and dedicated. I am interested in joining your team and contributing to successful productions.',
        ];
        
        applicationsToCreate.push({
          jobId: job.id,
          applicantId: applicant.id,
          coverLetter: Math.random() > 0.3 ? randomElement(coverLetters) : null, // 70% have cover letters
          status: appStatus,
        });
      }
    }
  }
  
  if (applicationsToCreate.length > 0) {
    await prisma.jobApplication.createMany({
      data: applicationsToCreate,
      skipDuplicates: true,
    });
  }
  
  console.log(`   - Created ${applicationsToCreate.length} job applications`);
  
  // Create studio reviews
  const reviewsToCreate = [];
  
  for (const studio of studios) {
    // 3-10 reviews per studio
    const numReviews = Math.floor(Math.random() * 8) + 3;
    const reviewers = users
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(numReviews, users.length));
    
    for (const reviewer of reviewers) {
      // Rating distribution: mostly positive (4-5 stars)
      let rating: number;
      const rand = Math.random();
      if (rand < 0.50) rating = 5;
      else if (rand < 0.80) rating = 4;
      else if (rand < 0.92) rating = 3;
      else if (rand < 0.97) rating = 2;
      else rating = 1;
      
      const positiveComments = [
        'Professional studio with great facilities. Would definitely work with them again!',
        'Excellent experience working here. Very professional and respectful team.',
        'Great studio to work with. Fair pay, professional environment, highly recommended.',
        'One of the best studios I\'ve worked for. Professional, safe, and respectful.',
        'Amazing team and facilities. Would work here again without hesitation.',
      ];
      
      const negativeComments = [
        'Not the best experience. Could improve on communication.',
        'Average experience. Nothing special but nothing terrible either.',
        'Had some issues but they were eventually resolved.',
      ];
      
      reviewsToCreate.push({
        studioId: studio.id,
        reviewerId: reviewer.id,
        rating,
        comment: rating >= 4 ? randomElement(positiveComments) : (rating >= 3 ? randomElement([...positiveComments, ...negativeComments]) : randomElement(negativeComments)),
        wouldWorkAgain: rating >= 3,
      });
    }
  }
  
  if (reviewsToCreate.length > 0) {
    await prisma.studioReview.createMany({
      data: reviewsToCreate,
      skipDuplicates: true,
    });
  }
  
  console.log(`   - Created ${reviewsToCreate.length} studio reviews`);
  
  console.log('💕 Creating dating profiles...');
  
  // Create dating profiles for 70% of users (both escorts and clients)
  const allUsersForDating = [...users, ...clients];
  const datingUserCount = Math.floor(allUsersForDating.length * 0.7);
  const datingUsers = allUsersForDating
    .sort(() => Math.random() - 0.5)
    .slice(0, datingUserCount);
  
  const datingProfilesToCreate = [];
  
  for (const user of datingUsers) {
    // Get user details
    const userDetails = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        gender: true,
        dob: true,
      }
    });
    
    if (!userDetails) continue;
    
    // Determine what they're looking for
    const lookingForOptions = ['Dating', 'Friends', 'Relationship', 'Casual'];
    const numOptions = Math.floor(Math.random() * 2) + 1; // 1-2 options
    const lookingFor = lookingForOptions
      .sort(() => Math.random() - 0.5)
      .slice(0, numOptions);
    
    // Age preference based on their own age
    const userAge = userDetails.dob ? new Date().getFullYear() - userDetails.dob.getFullYear() : 20;
    const ageRangeMin = Math.max(18, userAge - 10);
    const ageRangeMax = Math.min(65, userAge + 15);
    
    // Max distance: 10-100km
    const maxDistance = [10, 25, 50, 75, 100][Math.floor(Math.random() * 5)];
    
    // Gender preference
    let showGender: Gender[] = [];
    if (userDetails.gender === Gender.MALE) {
      // Males mostly looking for females, some for both
      showGender = Math.random() < 0.85 
        ? [Gender.FEMALE] 
        : [Gender.FEMALE, Gender.TRANS];
    } else if (userDetails.gender === Gender.FEMALE) {
      // Females mostly looking for males, some for both
      showGender = Math.random() < 0.85 
        ? [Gender.MALE] 
        : [Gender.MALE, Gender.FEMALE];
    } else {
      // Trans looking for various combinations
      showGender = Math.random() < 0.5 
        ? [Gender.MALE, Gender.FEMALE] 
        : [Gender.MALE, Gender.FEMALE, Gender.TRANS];
    }
    
    datingProfilesToCreate.push({
      userId: user.id,
      lookingFor,
      ageRangeMin,
      ageRangeMax,
      maxDistance,
      showGender,
      active: Math.random() > 0.15, // 85% active
      verified: Math.random() > 0.6, // 40% verified
    });
  }
  
  // Batch create dating profiles
  await prisma.datingPage.createMany({
    data: datingProfilesToCreate,
    skipDuplicates: true,
  });
  
  console.log(`✅ Created ${datingProfilesToCreate.length} dating profiles`);
  
  // Get created dating profiles
  const datingProfiles = await prisma.datingPage.findMany({
    where: {
      userId: {
        in: datingUsers.map(u => u.id)
      }
    },
    select: {
      id: true,
      userId: true,
    }
  });
  
  // Create some swipes and matches
  console.log('   Creating swipes and matches...');
  
  const swipesToCreate = [];
  const matchesToCreate = [];
  const swipeMap = new Map<string, Set<string>>(); // Track who swiped on whom
  
  for (const profile of datingProfiles) {
    // Each profile swipes on 5-20 other profiles
    const numSwipes = Math.floor(Math.random() * 16) + 5;
    const otherProfiles = datingProfiles
      .filter(p => p.id !== profile.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, numSwipes);
    
    if (!swipeMap.has(profile.id)) {
      swipeMap.set(profile.id, new Set());
    }
    
    for (const otherProfile of otherProfiles) {
      // 60% like, 40% pass
      const direction = Math.random() < 0.6 ? SwipeDirection.LIKE : SwipeDirection.PASS;
      const superLike = direction === SwipeDirection.LIKE && Math.random() < 0.1; // 10% of likes are super likes
      
      swipesToCreate.push({
        swiperId: profile.id,
        swipedId: otherProfile.id,
        direction,
        superLike,
      });
      
      swipeMap.get(profile.id)!.add(otherProfile.id);
      
      // Check for mutual match
      if (direction === SwipeDirection.LIKE && swipeMap.has(otherProfile.id) && swipeMap.get(otherProfile.id)!.has(profile.id)) {
        // Both swiped on each other, check if other person liked back
        const otherSwipedLike = swipesToCreate.find(
          s => s.swiperId === otherProfile.id && s.swipedId === profile.id && s.direction === SwipeDirection.LIKE
        );
        
        if (otherSwipedLike) {
          // Create a match!
          // First create a chat
          const chat = await prisma.chat.create({
            data: {
              activeUsers: {
                connect: [
                  { id: profile.userId },
                  { id: otherProfile.userId }
                ]
              }
            }
          });
          
          matchesToCreate.push({
            user1Id: profile.id,
            user2Id: otherProfile.id,
            chatId: chat.id,
          });
        }
      }
    }
  }
  
  // Batch create swipes
  if (swipesToCreate.length > 0) {
    await prisma.datingSwipe.createMany({
      data: swipesToCreate,
      skipDuplicates: true,
    });
  }
  
  // Batch create matches
  if (matchesToCreate.length > 0) {
    await prisma.datingMatch.createMany({
      data: matchesToCreate,
      skipDuplicates: true,
    });
  }
  
  console.log(`   - Created ${swipesToCreate.length} swipes`);
  console.log(`   - Created ${matchesToCreate.length} matches`);
  
  console.log('🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Total escort profiles: ${created.count}`);
  console.log(`   - Total client profiles: ${createdClients.count}`);
  console.log(`   - Locations covered: ${locations.length} cities`);
  console.log(`   - Images per profile: 3-5 images (1 default + 2-4 additional)`);
  console.log(`   - Private ads created: ${users.length}`);
  console.log(`   - Services per ad: 2-4 services with multiple pricing options`);
  console.log(`   - Extras per ad: 1-4 optional add-ons`);
  console.log(`   - Total reviews: ${totalReviews} (0-8 per escort)`);
  console.log(`   - Rating distribution: 60% 5★, 25% 4★, 10% 3★, 5% 1-2★`);
  console.log(`\n💎 VIP Content Summary:`);
  console.log(`   - VIP pages created: ${vipEscortCount} (60% of escorts)`);
  console.log(`   - Content per page: 15-40 pieces`);
  console.log(`   - Content types: 60% images, 25% videos, 15% status updates`);
  console.log(`   - Subscriptions per page: 5-20 subscribers`);
  console.log(`   - Free pages: ~20%, Paid pages: ~80%`);
  console.log(`   - Active discounts: ~30% of paid pages`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
