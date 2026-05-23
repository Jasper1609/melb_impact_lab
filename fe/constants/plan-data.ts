export interface PlanItem {
  label: string;
  detail: string;
  // People
  isContact?: boolean;
  email?: string;
  emailSubject?: string;
  emailBody?: string;
  // Events
  source?: string;
  eventUrl?: string;
  date?: string;
  location?: string;
  // Communities
  platform?: string;
  groupUrl?: string;
  // Requests
  provider?: string;
  resourceUrl?: string;
}

export interface PlanCategory {
  id: string;
  icon: string;
  title: string;
  scanLabel: string;
  summary: string;
  items: PlanItem[];
  actionLabel: string;
}

export const CATEGORIES: PlanCategory[] = [
  {
    id: 'people',
    icon: '\uD83D\uDC65',
    title: 'People',
    scanLabel: 'Finding people near you...',
    summary: '5 people worth checking in with',
    actionLabel: 'Connect via email',
    items: [
      {
        label: 'Mei-Ling Chan',
        detail: 'Also from Hong Kong, lives 2 streets away',
        isContact: true,
        email: 'meiling.chan@email.com',
        emailSubject: 'Hi from your new neighbour!',
        emailBody:
          "Hi Mei-Ling,\n\nI just moved to Kensington from Hong Kong with my partner and two kids. I heard you're also from Hong Kong and live nearby \u2014 I'd love to meet up for a coffee sometime.\n\nLooking forward to connecting!",
      },
      {
        label: 'Sarah Chen',
        detail: 'Parent at Kensington Primary, kids same age',
        isContact: true,
        email: 'sarah.chen@email.com',
        emailSubject: 'Fellow Kensington Primary parent',
        emailBody:
          "Hi Sarah,\n\nMy kids are starting at Kensington Primary soon and I'd love to connect with other parents. Would you have time for a quick chat about the school?\n\nThanks!",
      },
      {
        label: 'David Wong',
        detail: 'Runs HK Families Melbourne group',
        email: 'david.wong@email.com',
        emailSubject: 'Interested in HK Families Melbourne',
        emailBody:
          "Hi David,\n\nI recently moved to Melbourne from Hong Kong with my family and came across your HK Families Melbourne group. We'd love to join and meet other families.\n\nCould you let us know how to get involved?\n\nThanks!",
      },
      {
        label: 'Priya Sharma',
        detail: 'New to the area, has kids same age',
        isContact: true,
        email: 'priya.sharma@email.com',
        emailSubject: 'New neighbour \u2014 kids around the same age!',
        emailBody:
          "Hi Priya,\n\nI just moved nearby and heard your kids are a similar age to mine. It would be great to arrange a playdate sometime \u2014 always nice to have friendly faces around!\n\nHope to hear from you!",
      },
      {
        label: 'Tom Wilson',
        detail: 'Neighbourhood welcome volunteer',
        email: 'tom.wilson@email.com',
        emailSubject: 'Thank you for the welcome!',
        emailBody:
          "Hi Tom,\n\nI'm new to Kensington and heard you volunteer with the local welcome program. I'd love to learn more about the area and any tips for settling in.\n\nThanks for what you do!",
      },
    ],
  },
  {
    id: 'events',
    icon: '\uD83D\uDCC5',
    title: 'Events',
    scanLabel: 'Scanning local events...',
    summary: '3 upcoming events near you',
    actionLabel: 'View event',
    items: [
      {
        label: 'New Residents Welcome Morning Tea',
        detail:
          'A settling-in session for new residents with info stalls, morning tea, and local service providers.',
        source: 'City of Melbourne',
        eventUrl: 'https://whatson.melbourne.vic.gov.au',
        date: 'Sat 7 June, 10:00am',
        location: 'Kensington Town Hall',
      },
      {
        label: 'Kensington Primary Open Morning',
        detail:
          'Meet teachers, tour classrooms, and learn about enrolment for Term 3.',
        source: 'School website',
        eventUrl: 'https://www.education.vic.gov.au/parents/going-to-school/Pages/choose-enrol-primary-school.aspx',
        date: 'Tue 10 June, 9:00am',
        location: 'Kensington Primary School',
      },
      {
        label: 'Multicultural Families Picnic',
        detail:
          'BYO picnic for multicultural families. Kids activities, food sharing, and community connections.',
        source: 'Luma',
        eventUrl: 'https://lu.ma',
        date: 'Sun 15 June, 11:00am',
        location: 'JJ Holland Park, Kensington',
      },
    ],
  },
  {
    id: 'communities',
    icon: '\uD83C\uDFE0',
    title: 'Communities',
    scanLabel: 'Discovering communities...',
    summary: '4 communities you might like',
    actionLabel: 'View group',
    items: [
      {
        label: 'HK Families Melbourne',
        detail: '520 members \u2022 Very active',
        platform: 'Facebook Group',
        groupUrl: 'https://www.facebook.com/groups/',
      },
      {
        label: 'Kensington Primary Parents',
        detail: '89 members \u2022 Weekly meetups',
        platform: 'WhatsApp Group',
        groupUrl: 'https://chat.whatsapp.com/',
      },
      {
        label: 'Kensington Neighbours',
        detail: '1,120 members \u2022 Local tips & events',
        platform: 'Facebook Group',
        groupUrl: 'https://www.facebook.com/groups/',
      },
      {
        label: 'New to Melbourne',
        detail: '1,240 members \u2022 Tips & advice',
        platform: 'Facebook Group',
        groupUrl: 'https://www.facebook.com/groups/',
      },
    ],
  },
  {
    id: 'requests',
    icon: '\u2728',
    title: 'Your requests',
    scanLabel: 'Matching your needs...',
    summary: '3 things we can help with',
    actionLabel: 'View guide',
    items: [
      {
        label: 'Primary school enrolment',
        detail:
          'Step-by-step guide for enrolling at Victorian government schools, plus 2 nearby schools currently accepting students.',
        provider: 'vic.gov.au',
        resourceUrl: 'https://www.vic.gov.au/school-enrolments',
      },
      {
        label: 'Bank account setup',
        detail:
          'How to open a bank account as a new resident. Most banks offer newcomer accounts with no monthly fees.',
        provider: 'moneysmart.gov.au',
        resourceUrl: 'https://moneysmart.gov.au/banking',
      },
      {
        label: 'Public transport (Myki)',
        detail:
          'Get a Myki card for trains, trams, and buses across Melbourne. Available at 7-Eleven and train stations.',
        provider: 'ptv.vic.gov.au',
        resourceUrl: 'https://www.ptv.vic.gov.au/tickets/myki/',
      },
    ],
  },
];
