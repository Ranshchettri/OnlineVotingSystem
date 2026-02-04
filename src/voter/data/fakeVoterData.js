export const voterProfile = {
  name: "Ram Sharma",
  id: "NP2025001",
  status: "Verified Voter",
};

export const electionOverview = {
  title: "Election Overview",
  subtitle: "National Election 2025 - Political",
  electionName: "National Election 2025",
  activeLabel: "Election Active",
  activeEnds: "Ends: Jan 30, 2025 5:00 PM",
  statusTitle: "Election Status",
  statusText: "National Election 2025 is currently active",
  statusEnds: "Ends in 2 days",
};

export const stats = [
  {
    key: "votes",
    label: "Total Votes Cast",
    value: "190,430",
    tone: "green",
  },
  {
    key: "leading",
    label: "Currently Leading",
    value: "Nepal Communist Party (UML)",
    size: "sm",
    tone: "yellow",
  },
  {
    key: "parties",
    label: "Active Parties",
    value: "5",
    tone: "orange",
  },
  {
    key: "status",
    label: "Your Status",
    value: "Not Voted",
    size: "sm",
    tone: "red",
  },
];

export const parties = [
  {
    id: "rsp",
    rank: 1,
    name: "Rastriya Swatantra Party",
    leader: "Rabi Lamichhane",
    votes: "35,680",
    share: "18.7%",
    score: 82,
    short: "RSP",
    color: "#0b5cc6",
  },
  {
    id: "ncp",
    rank: 2,
    name: "Nepal Communist Party (UML)",
    leader: "K. P. Sharma Oli",
    votes: "32,105",
    share: "17.1%",
    score: 72,
    short: "CPN",
    color: "#c1121f",
  },
  {
    id: "nc",
    rank: 3,
    name: "Nepali Congress",
    leader: "Sher Bahadur Deuba",
    votes: "29,442",
    share: "15.6%",
    score: 60,
    short: "NC",
    color: "#15803d",
  },
  {
    id: "maobadi",
    rank: 4,
    name: "CPN (Maoist Centre)",
    leader: "Pushpa Kamal Dahal",
    votes: "38,920",
    share: "20.4%",
    score: 65,
    short: "CPN",
    color: "#dc2626",
  },
  {
    id: "rpp",
    rank: 5,
    name: "Rastriya Prajatantra Party",
    leader: "Rajendra Lingden",
    votes: "28,450",
    share: "14.9%",
    score: 58,
    short: "RPP",
    color: "#f97316",
  },
];

export const partyProfiles = {
  rsp: {
    name: "Rastriya Swatantra Party",
    short: "RSP",
    leader: "Rabi Lamichhane",
    email: "rsp_gov@ovs.gov.np",
    bannerColor: "#c1121f",
    logoColor: "#0b5cc6",
    vision:
      "Creating a new Nepal with good governance, zero corruption, and citizen-centric policies through modern democratic practices.",
    developmentScore: 82,
    workAnalysis: {
      good: 88,
      bad: 12,
    },
    futurePlans: [
      "Zero tolerance for corruption",
      "Digital governance transformation",
      "Youth employment programs",
      "Education system reform",
      "Healthcare accessibility for all",
    ],
    teamMembers: [
      { name: "Rabi Lamichhane", role: "Party President", photo: "" },
      { name: "Swarnim Wagle", role: "Vice President", photo: "" },
      { name: "Durga Prasai", role: "General Secretary", photo: "" },
      { name: "Kabita Bogati", role: "Spokesperson", photo: "" },
    ],
  },
};

export const profileDetails = {
  name: "Ram Sharma",
  id: "NP2025001",
  status: "Verified Voter",
  dob: "January 15, 1990",
  district: "Kathmandu",
  province: "Bagmati Province",
  email: "voter@example.com",
  phone: "+977 9841234567",
  photo: "",
};

export const votingHistory = [
  {
    id: "local-2024",
    title: "Local Election 2024",
    year: "2024",
    votedFor: "Nepali Congress",
    winner: "Nepali Congress",
    won: true,
  },
  {
    id: "prov-2023",
    title: "Provincial Election 2023",
    year: "2023",
    votedFor: "CPN (UML)",
    winner: "CPN (UML)",
    won: true,
  },
  {
    id: "national-2022",
    title: "National Election 2022",
    year: "2022",
    votedFor: "Nepali Congress",
    winner: "CPN (Maoist)",
    won: false,
  },
  {
    id: "local-2021",
    title: "Local Election 2021",
    year: "2021",
    votedFor: "CPN (UML)",
    winner: "Nepali Congress",
    won: false,
  },
];

export const currentElection = {
  title: "National Election 2025",
  status: "Election in Progress",
  note: "Results Pending",
};

export const pastResults = [
  {
    id: "local-2024",
    title: "Local Election 2024",
    year: "2024",
    winner: "Nepali Congress",
    winnerVotes: "52,340",
    runnerUp: "CPN (UML)",
    runnerUpVotes: "48,920",
    margin: "3,420 votes",
    short: "NC",
    color: "#15803d",
  },
  {
    id: "local-2021",
    title: "Local Election 2021",
    year: "2021",
    winner: "Nepali Congress",
    winnerVotes: "48,920",
    runnerUp: "CPN (UML)",
    runnerUpVotes: "46,780",
    margin: "2,140 votes",
    short: "NC",
    color: "#15803d",
  },
  {
    id: "prov-2020",
    title: "Provincial Election 2020",
    year: "2020",
    winner: "Rastriya Swatantra Party",
    winnerVotes: "42,150",
    runnerUp: "CPN (UML)",
    runnerUpVotes: "39,840",
    margin: "2,310 votes",
    short: "RSP",
    color: "#0b5cc6",
  },
];

export const timelineActive = {
  title: "National Election 2025",
  type: "Political",
  startDate: "January 25, 2025",
  startTime: "7:00 AM",
  endDate: "January 30, 2025",
  endTime: "5:00 PM",
  remaining: "2 Days",
};

export const upcomingElections = [
  {
    id: "municipal-2026",
    title: "Municipal Election 2026",
    type: "Municipal",
    startDate: "March 15, 2026",
    startTime: "7:00 AM",
    endDate: "March 15, 2026",
    endTime: "5:00 PM",
    status: "Scheduled",
  },
  {
    id: "provincial-2026",
    title: "Provincial Election 2026",
    type: "Provincial",
    startDate: "November 20, 2026",
    startTime: "7:00 AM",
    endDate: "November 20, 2026",
    endTime: "5:00 PM",
    status: "Scheduled",
  },
];

export const notificationSettings = [
  "Election start reminders",
  "Last hour voting reminders",
  "Vote confirmation",
  "Result announcements",
];
