export const partySidebar = {
  name: "CPN (UML)",
  short: "CPN",
  status: "Active Party",
};

export const partyHome = {
  title: "Party Profile",
  subtitle: "Manage your party information",
  name: "Nepal Communist Party (UML)",
  leader: "K.P. Sharma Oli",
  verified: true,
  logoText: "CPN",
  logoBg: "#dc2626",
  vision:
    "Building a prosperous and developed Nepal through socialist principles and democratic governance.",
  team: [
    {
      name: "K.P. Sharma Oli",
      role: "Prime Minister",
      initials: "KO",
      tone: "#dbeafe",
    },
    {
      name: "Bishnu Paudel",
      role: "Finance Minister",
      initials: "BP",
      tone: "#e2e8f0",
    },
    {
      name: "Pradeep Gyawali",
      role: "Home Minister",
      initials: "PG",
      tone: "#e2e8f0",
    },
    {
      name: "Yubaraj Khatiwada",
      role: "Education Minister",
      initials: "YK",
      tone: "#f8fafc",
    },
  ],
};

export const partyAbout = {
  title: "About & Future Plans",
  subtitle: "Share your party's vision and goals",
  plans: [
    "Strengthen democratic institutions and governance",
    "Promote economic development through industrialization",
    "Improve healthcare infrastructure across all provinces",
    "Enhance education quality and accessibility",
    "Develop sustainable agriculture practices",
    "Build modern transportation networks",
    "Create employment opportunities for youth",
    "Ensure social security for all citizens",
    "Protect and promote cultural heritage",
    "Implement environmental conservation programs",
  ],
  guidelines: [
    "Maximum 50 future plans allowed",
    "Be specific and realistic with your plans",
    "Plans will be visible to all voters",
    "Editing locks 24 hours before election",
  ],
};

export const partyProgress = {
  title: "Progress Analytics",
  subtitle: "Admin-controlled performance metrics",
  development: 78,
  damage: 22,
  developmentAreas: [
    { label: "Infrastructure", value: 82 },
    { label: "Healthcare", value: 75 },
    { label: "Education", value: 78 },
  ],
  damageAreas: [
    { label: "Policy Failures", value: 18 },
    { label: "Corruption Cases", value: 12 },
    { label: "Public Complaints", value: 35 },
  ],
  workAnalysis: {
    good: 85,
    bad: 15,
  },
};

export const partyPerformance = {
  title: "Past Performance",
  subtitle: "Historical election results from the last 5 elections",
  stats: [
    { label: "Total Wins", value: "2", icon: "trophy" },
    { label: "Average Votes", value: "52.7K", icon: "votes" },
    { label: "Win Rate", value: "40%", icon: "rate" },
  ],
  history: [
    {
      id: "local-2024",
      title: "Local Election 2024",
      year: "2024",
      votes: "48,920",
      position: "2 of 5",
      result: "Lost",
      badge: "Position #2",
    },
    {
      id: "prov-2023",
      title: "Provincial Election 2023",
      year: "2023",
      votes: "61,250",
      position: "1 of 6",
      result: "Won",
      badge: "Winner",
    },
    {
      id: "national-2022",
      title: "National Election 2022",
      year: "2022",
      votes: "54,120",
      position: "2 of 5",
      result: "Lost",
      badge: "Position #2",
    },
    {
      id: "local-2021",
      title: "Local Election 2021",
      year: "2021",
      votes: "46,780",
      position: "2 of 5",
      result: "Lost",
      badge: "Position #2",
    },
    {
      id: "prov-2020",
      title: "Provincial Election 2020",
      year: "2020",
      votes: "52,340",
      position: "1 of 4",
      result: "Won",
      badge: "Winner",
    },
  ],
  insights: [
    "Your party has shown consistent performance with 2 wins in the last 5 elections.",
    "Strong performance in provincial elections.",
    "Consistent voter base across elections.",
  ],
};

export const partyStats = {
  title: "Current Election Statistics",
  subtitle: "Live voting data and party standings",
  yourParty: {
    name: "Nepal Communist Party (UML)",
    votes: "45,231",
    position: "#1",
    share: "23.8%",
    lead: "+3,081",
  },
  rankings: [
    {
      rank: 1,
      name: "Nepal Communist Party (UML)",
      votes: "45,231",
      share: "23.8%",
      highlight: true,
      color: "#16a34a",
      tag: "Your Party",
      short: "CPN",
    },
    {
      rank: 2,
      name: "Nepali Congress",
      votes: "42,150",
      share: "22.1%",
      color: "#0ea5e9",
      short: "NC",
    },
    {
      rank: 3,
      name: "CPN (Maoist Centre)",
      votes: "38,920",
      share: "20.4%",
      color: "#f59e0b",
      short: "CPN",
    },
    {
      rank: 4,
      name: "Rastriya Swatantra Party",
      votes: "35,680",
      share: "18.7%",
      color: "#0f172a",
      short: "RSP",
    },
    {
      rank: 5,
      name: "Rastriya Prajatantra Party",
      votes: "28,450",
      share: "14.9%",
      color: "#f97316",
      short: "RPP",
    },
  ],
  comparison: [
    { label: "Lead over 2nd place", value: "+3,081 votes" },
    { label: "Total votes cast", value: "190,431" },
    { label: "Competing parties", value: "5" },
    { label: "Votes needed for majority", value: "49,985" },
  ],
  timeline: [
    { label: "Election Started", value: "January 25, 2025 - 7:00 AM" },
    { label: "Voting in Progress", value: "2 days remaining" },
    { label: "Election Ends", value: "January 30, 2025 - 5:00 PM" },
    { label: "Results Announcement", value: "February 1, 2025" },
  ],
  lastUpdated: "Last updated 01:15 PM",
};

export const partyNotifications = {
  title: "Notifications",
  subtitle: "Stay updated with election news and system updates",
  items: [
    {
      id: "start",
      title: "Election Started",
      text: "National Election 2025 has officially begun. Voting is now open.",
      time: "2 hours ago",
      type: "success",
    },
    {
      id: "deadline",
      title: "Profile Editing Deadline",
      text: "Profile editing will be locked in 3 days. Please complete all updates.",
      time: "5 hours ago",
      type: "warning",
    },
    {
      id: "milestone",
      title: "Vote Milestone Reached",
      text: "Your party has crossed 40,000 votes! Keep up the momentum.",
      time: "1 day ago",
      type: "info",
    },
    {
      id: "maintenance",
      title: "System Maintenance",
      text: "Scheduled maintenance on Jan 28, 2025 from 2:00 AM to 4:00 AM.",
      time: "2 days ago",
      type: "neutral",
    },
    {
      id: "results",
      title: "Previous Election Results",
      text: "Results for Local Election 2024 have been published.",
      time: "3 days ago",
      type: "success",
    },
  ],
  email: [
    "Election start and end announcements",
    "Result announcements",
    "System updates and maintenance schedules",
    "Important policy changes",
  ],
};

export const partyRules = {
  title: "Party Rules & Guidelines",
  subtitle: "Important rules for political parties",
  rules: [
    "Only government-issued email addresses (_gov@ovs.gov.np) are allowed for party accounts",
    "Party profiles must be activated by the Election Commission Admin",
    "Profile editing is locked 24 hours before election start time",
    "Development percentages and analytics are controlled by Admin only",
    "Parties cannot edit or manipulate their performance metrics",
    "Maximum 50 future plans can be added to the About section",
    "All party information must be accurate and verifiable",
    "Parties with development score below 40% may be auto-blocked",
    "Vote counts are updated in real-time and are read-only",
    "Results are automatically calculated when election ends",
  ],
  bestPractices: {
    title: "Best Practices",
    subtitle: "Guidelines for success",
    sections: [
      {
        title: "Profile Management",
        items: [
          "Keep your party logo and team photos updated",
          "Write clear and realistic future plans",
          "Update vision and motivation regularly",
          "Ensure all team member information is accurate",
        ],
      },
      {
        title: "During Elections",
        items: [
          "Monitor your vote count in real-time",
          "Check competitor standings for strategy",
          "Respond to voter concerns promptly",
          "Maintain transparency in all communications",
        ],
      },
      {
        title: "Performance Metrics",
        items: [
          "Development scores are based on policy implementation",
          "Good work vs bad work is evaluated by public feedback",
          "Historical performance affects voter trust",
          "Focus on consistent positive impact",
        ],
      },
    ],
  },
  restrictions: [
    "Editing development percentages or analytics",
    "Manipulating vote counts or election data",
    "Editing profile after the deadline",
    "Sharing false or misleading information",
  ],
  help: {
    phone: "01-4200000",
    email: "party-support@ovs.gov.np",
  },
};
