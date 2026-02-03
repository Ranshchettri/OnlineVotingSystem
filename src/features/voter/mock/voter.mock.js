export const voterHome = {
  activeElection: {
    id: "e1",
    title: "National Assembly 2026",
    endsAt: "2026-03-01T18:00:00",
  },
  stats: {
    totalVoters: 1203456,
    parties: 7,
    turnout: "61%",
  },
};

export const parties = [
  {
    id: "p1",
    name: "People First",
    logo: "/mock/p1.png",
    votes: 21034,
    manifesto: "For the people",
  },
  {
    id: "p2",
    name: "Green Front",
    logo: "/mock/p2.png",
    votes: 18234,
    manifesto: "Sustainable future",
  },
  {
    id: "p3",
    name: "Progressive Unity",
    logo: "/mock/p3.png",
    votes: 16540,
    manifesto: "Progressive change",
  },
  {
    id: "p4",
    name: "Unity Alliance",
    logo: "/mock/p4.png",
    votes: 14200,
    manifesto: "Unity in diversity",
  },
  {
    id: "p5",
    name: "New Dawn",
    logo: "/mock/p5.png",
    votes: 11500,
    manifesto: "New beginning",
  },
];

export const voteHistory = [
  {
    id: "h1",
    election: "Local Assembly 2024",
    choice: "Green Front",
    date: "2024-06-12",
    result: "Won",
  },
  {
    id: "h2",
    election: "Regional Council 2023",
    choice: "Progressive Unity",
    date: "2023-11-20",
    result: "Lost",
  },
];

export const votedParty = { id: "p2", name: "Green Front" };
