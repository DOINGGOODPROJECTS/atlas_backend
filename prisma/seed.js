require("dotenv/config");
const { PrismaClient, $Enums } = require("@prisma/client");

const prisma = new PrismaClient({
          {
            type: $Enums.ReportType.COMPARISON,
            status: $Enums.ReportStatus.READY,
            url: "https://cdn.adinkraatlas.com/reports/atlanta-vs-houston.pdf",
            payload: { cities: ["Atlanta", "Houston"], score: 87 },
          },
        ],
      },
    },
  });

  await prisma.session.create({
    data: {
      userId: user.id,
      token: "session-token-001",
      ipAddress: "127.0.0.1",
      userAgent: "seed-script",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  });
}

  // ...existing code continues here...
    {
      slug: "atlanta-ga",
      name: "Atlanta",
      state: "GA",
      region: "SOUTH",
      population: 498000,
      medianIncome: 71000,
      costIndex: 98,
      businessScore: 86,
      blackPopulationPct: 47,
      opportunityScore: 88,
      networkStrength: 90,
      housingIndex: 95,
      climate: "Humid subtropical",
      highlights: [
        "Global fintech & logistics hub",
        "Top Black entrepreneur network",
        "Strong airport connectivity",
      ],
      industries: ["Fintech", "Logistics", "Media"],
      incentives: [
        {
          title: "Invest Atlanta Grants",
          description: "Local grants and mentorship for growth-stage founders.",
          url: "https://investatlanta.com",
        },
      ],
      grants: [
        { name: "ATL Business Boost", deadline: new Date("2026-10-18"), amount: "$25K" },
      ],
    },
    {
      slug: "houston-tx",
      name: "Houston",
      state: "TX",
      region: "SOUTH",
      population: 2300000,
      medianIncome: 61000,
      costIndex: 92,
      businessScore: 82,
      blackPopulationPct: 23,
      opportunityScore: 84,
      networkStrength: 78,
      housingIndex: 88,
      climate: "Hot humid",
      highlights: [
        "Energy + medical corridor",
        "No state income tax",
        "Large port economy",
      ],
      industries: ["Energy", "Health", "Aerospace"],
      incentives: [
        {
          title: "Houston Small Business Grants",
          description: "City-backed funding for minority founders.",
          url: "https://houstontx.gov",
        },
      ],
      grants: [
        { name: "Houston Forge", deadline: new Date("2026-09-30"), amount: "$30K" },
      ],
    },
    {
      slug: "detroit-mi",
      name: "Detroit",
      state: "MI",
      region: "MIDWEST",
      population: 630000,
      medianIncome: 40000,
      costIndex: 84,
      businessScore: 72,
      blackPopulationPct: 77,
      opportunityScore: 78,
      networkStrength: 82,
      housingIndex: 68,
      climate: "Cold winters",
      highlights: [
        "Manufacturing resurgence",
        "Affordable industrial space",
        "Major foundation support",
      ],
      industries: ["Mobility", "Manufacturing", "Design"],
      incentives: [
        {
          title: "Motor City Match",
          description: "Small business funding and coaching program.",
          url: "https://motorcitymatch.com",
        },
      ],
      grants: [
        { name: "Motor City Match", deadline: new Date("2026-10-05"), amount: "$50K" },
      ],
    },
  ];

  const createdCities = [];
  for (const city of cities) {
    const created = await prisma.city.create({
      data: {
        slug: city.slug,
        name: city.name,
        state: city.state,
        region: city.region,
        population: city.population,
        medianIncome: city.medianIncome,
        costIndex: city.costIndex,
        businessScore: city.businessScore,
        blackPopulationPct: city.blackPopulationPct,
        opportunityScore: city.opportunityScore,
        networkStrength: city.networkStrength,
        housingIndex: city.housingIndex,
        climate: city.climate,
        highlights: {
          create: city.highlights.map((text, index) => ({ text, order: index })),
        },
        industries: {
          create: city.industries.map((name) => ({ name })),
        },
        incentives: {
          create: city.incentives,
        },
        grants: {
          create: city.grants,
        },
      },
    });
    createdCities.push(created);
  }

  const [atlanta, houston] = createdCities;

  const user = await prisma.user.create({
    data: {
      email: "founder@adinkraatlas.com",
      name: "Janelle Parker",
      password: "hashed-password",
      profile: {
        create: {
          businessName: "Atlas Studio",
          stage: "EARLY_REVENUE",
          industry: "Fintech",
          relocationWindow: "3-6 months",
          budgetRange: "$50k-$150k",
          priorities: ["Cost", "Network", "Grants"],
          currentLocation: "New York, NY",
          relocationNotes: "Seeking strong Black founder ecosystem and funding.",
          responseStyle: "Concise",
        },
      },
      savedSearches: {
        create: [
          {
            query: "Affordable fintech hubs",
            region: "SOUTH",
            sortKey: "opportunityScore",
            filters: { maxCostIndex: 105 },
          },
        ],
      },
      favorites: {
        create: [
          {
            city: { connect: { id: atlanta.id } },
          },
        ],
      },
      comparisons: {
        create: [
          {
            title: "South expansion shortlist",
            cities: {
              create: [
                { city: { connect: { id: atlanta.id } }, orderIndex: 0 },
                { city: { connect: { id: houston.id } }, orderIndex: 1 },
              ],
            },
          },
        ],
      },
      chatSessions: {
        create: [
          {
            title: "Funding options",
            messages: {
              create: [
                {
                  role: "USER",
                  content: "Compare grants for Atlanta and Houston.",
                },
                {
                  role: "ASSISTANT",
                  content:
                    "Atlanta shows stronger local grant programs, while Houston offers tax benefits.",
                },
              ],
            },
          },
        ],
      },
      notifications: {
        create: [
          {
            title: "New grant match: ATL Business Boost",
            category: "GRANTS",
          },
          {
            title: "Atlanta cost index updated",
            category: "CITY_DATA",
          },
        ],
      },
      reports: {
        create: [
          {
            type: "COMPARISON",
            status: "READY",
            url: "https://cdn.adinkraatlas.com/reports/atlanta-vs-houston.pdf",
            payload: { cities: ["Atlanta", "Houston"], score: 87 },
          },
        ],
      },
    },
  });

  await prisma.session.create({
    data: {
      userId: user.id,
      token: "session-token-001",
      ipAddress: "127.0.0.1",
      userAgent: "seed-script",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
