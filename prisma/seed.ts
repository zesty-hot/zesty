import { PrismaClient, Gender, BodyType, Race, PrivateAdCustomerCategory, PrivateAdServiceCategory, PrivateAdExtraType, DaysAvailable } from '@prisma/client';

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
  
  // Delete in order of dependencies
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
  for (const user of users) {
    const userIndex = users.indexOf(user);
    const numImages = Math.floor(Math.random() * 3) + 3; // 3-5 images per user
    
    for (let imgIndex = 0; imgIndex < numImages; imgIndex++) {
      await prisma.images.create({
        data: {
          userId: user.id,
          url: `https://i.pravatar.cc/600?img=${(userIndex * 10 + imgIndex) % 70 + 1}`,
          NSFW: Math.random() < 0.2, // 20% chance image is NSFW
          width: 600,
          height: 600,
          default: imgIndex === 0, // First image is default, others are not
        }
      });
    }
  }
  
  console.log(`✅ Added images for ${users.length} profiles`);
  
  console.log('📋 Creating PrivateAds for escort profiles...');
  
  // Create a PrivateAd for each user (they're all escorts in this seed)
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
    
    // Create the ad
    const ad = await prisma.privateAd.create({
      data: {
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
      }
    });
    
    // Create 2-4 services for each ad with the new schema
    const numServices = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < numServices; i++) {
      const category = randomElement([
        PrivateAdServiceCategory.IN_CALL,
        PrivateAdServiceCategory.OUT_CALL,
        PrivateAdServiceCategory.MASSAGE,
        PrivateAdServiceCategory.MEET_AND_GREET,
      ]);
      
      // Create descriptive label based on category
      const labels: Record<PrivateAdServiceCategory, string> = {
        [PrivateAdServiceCategory.IN_CALL]: 'Incall Service',
        [PrivateAdServiceCategory.OUT_CALL]: 'Outcall Service',
        [PrivateAdServiceCategory.MASSAGE]: 'Massage Session',
        [PrivateAdServiceCategory.MEET_AND_GREET]: 'Meet & Greet',
      };
      
      // Create the service
      const service = await prisma.privateAdService.create({
        data: {
          privateAdId: ad.id,
          category,
          label: labels[category],
        }
      });
      
      // Create 2-4 service options (different durations/prices)
      const numOptions = Math.floor(Math.random() * 3) + 2; // 2-4 options
      const durations = [15, 30, 60, 90, 120]; // minutes
      
      for (let j = 0; j < numOptions; j++) {
        const durationMin = durations[j % durations.length];
        
        // Price varies by category and duration
        let basePrice = 150;
        if (category === PrivateAdServiceCategory.OUT_CALL) basePrice = 200;
        else if (category === PrivateAdServiceCategory.MASSAGE) basePrice = 120;
        else if (category === PrivateAdServiceCategory.MEET_AND_GREET) basePrice = 100;
        
        const price = basePrice + Math.floor((durationMin / 30) * 100) + Math.floor(Math.random() * 50);
        
        await prisma.serviceOption.create({
          data: {
            serviceId: service.id,
            durationMin,
            price,
          }
        });
      }
    }
    
    // Create some extras (add-ons) for the ad
    const numExtras = Math.floor(Math.random() * 4) + 1; // 1-4 extras
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
      .slice(0, numExtras);
    
    for (const extraType of selectedExtras) {
      const extraPrice = Math.floor(Math.random() * 150) + 50; // $50-$200
      
      await prisma.privateAdExtra.create({
        data: {
          privateAdId: ad.id,
          name: extraType,
          price: extraPrice,
          active: Math.random() > 0.2, // 80% active
        }
      });
    }
  }
  
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
      
      await prisma.review.create({
        data: {
          reviewerId: reviewer.id,
          revieweeId: escortUser.id,
          rating,
          comment: rating >= 3 ? comment : (Math.random() > 0.5 ? comment : null), // Lower ratings less likely to have comments
          createdAt: reviewDate,
        }
      });
      
      totalReviews++;
    }
  }
  
  console.log(`✅ Created ${totalReviews} reviews across ${users.length} escort profiles`);
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
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
