// v2/content/hobbies.ts

export interface HobbyAward {
  tier: "gold" | "silver" | "bronze";
  name: string;
  detail?: string;
}

export interface FeaturedHobby {
  id: string;
  title: string;
  role: string;
  iconName: string; // lucide icon name as string key
  description: string;
  awards: HobbyAward[];
  poetryData?: {
    journeySteps: string[];
    poemTitle: string;
    poemSubject: string;
    poemRecognition: string;
    link: string;
  };
}

export interface SecondaryHobby {
  id: string;
  title: string;
  role: string;
  iconName: string;
  description: string;
}

export const FEATURED_HOBBIES: FeaturedHobby[] = [
  {
    id: "tennis",
    title: "Varsity Tennis",
    role: "Vice Captain · 2 Years",
    iconName: "TableTennis",
    description:
      "Led team practices and acted as the backbone of the team. Contributed to multiple school victories while cultivating a positive, growth-focused training environment. Emphasized teamwork, discipline, and leadership on and off the court.",
    awards: [
      {
        tier: "gold",
        name: "CBAADA Scholarship Winner",
        detail:
          "First student in 10 years of West Valley High School to receive this honor. 12 selected from 69 applications across 80 schools in Citrus Belt area.",
      },
      {
        tier: "gold",
        name: "Outstanding Doubles Play",
        detail: "WVHS Tennis Trophy",
      },
      {
        tier: "silver",
        name: "Athlete of the Year & Athletic Scholar Badge",
      },
      {
        tier: "bronze",
        name: "Most Improved Player in Tennis",
        detail: "Varsity Athletic Award",
      },
    ],
  },
  {
    id: "poetry",
    title: "Poetry & Creative Writing",
    role: "Published Poet · National Champion",
    iconName: "Feather",
    description:
      "Competing through the GFWC youth writing contest from club to national level, winning first place nationally in the grades 9–12 poetry division.",
    awards: [
      {
        tier: "gold",
        name: "1st Place — National Youth Writing Contest (GFWC)",
        detail:
          "Grades 9-12 Poetry Division. Elevated Hemet Woman's Club to first-ever national victory in over a decade.",
      },
    ],
    poetryData: {
      journeySteps: ["Club", "District (12 clubs)", "State (185 clubs)", "National (50+ states)"],
      poemTitle: '"The Pencil, the Rocket, and the Sky"',
      poemSubject: "A tribute to Katherine Johnson's legacy",
      poemRecognition:
        "Nation's top entry for creative narrative, historical insight, and literary merit",
      link: "https://www.cfwcdeanzadistrict.org/general-7-1",
    },
  },
];

export const SECONDARY_HOBBIES: SecondaryHobby[] = [
  {
    id: "calisthenics",
    title: "Calisthenics",
    role: "Self-Practice & Discipline",
    iconName: "Dumbbell",
    description:
      "Self-taught bodyweight exercises building physical strength, control, and endurance. Developed a healthier, more focused lifestyle with improved mental well-being and personal resilience.",
  },
  {
    id: "hiking",
    title: "Hiking & Mountain Climbing",
    role: "Adventure & Exploration",
    iconName: "Mountain",
    description:
      "Exploring nature and pushing physical limits. Finding balance between the digital and natural worlds through adventure and discovery.",
  },
  {
    id: "music",
    title: "Music",
    role: "Inspiration & Focus",
    iconName: "Headphones",
    description:
      "Music as inspiration and relaxation. Diverse taste spanning genres — the perfect soundtrack to coding sessions and creative work.",
  },
  {
    id: "anime",
    title: "Anime",
    role: "Storytelling & Culture",
    iconName: "Tv",
    description:
      "Drawn to the storytelling depth, visual artistry, and cultural richness of anime. A source of creative inspiration and imaginative thinking.",
  },
];
