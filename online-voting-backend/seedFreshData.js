// require("dotenv").config();
// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
// const Party = require("./models/Party");
// const User = require("./models/User");

// const PROFILE_IMAGES = [
//   "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
//   "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
//   "https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg",
// ];

// const makeTextLogo = (label = "P", bg = "#1d4ed8", fg = "#ffffff") => {
//   const safeLabel = String(label || "P").slice(0, 8);
//   const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'>
//   <rect width='300' height='300' fill='${bg}'/>
//   <text x='150' y='165' font-size='56' text-anchor='middle' fill='${fg}' font-family='Arial, sans-serif' font-weight='700'>${safeLabel}</text>
//   </svg>`;
//   return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
// };

// const partySeeds = [
//   {
//     name: "Mato Janashakti Party",
//     shortName: "MJP",
//     symbol: "Mato",
//     symbolName: "Mato",
//     leader: "Rajan Bhattarai",
//     email: "mato.party@ovs.gov.np",
//     mobile: "9801000001",
//     color: "#92400e",
//     description:
//       "Mato Janashakti Party focuses on local agriculture, land rights, and rural livelihoods.",
//     vision:
//       "Build self-reliant communities through sustainable soil, farming, and local enterprise.",
//     headquarters: "Dhulikhel, Kavrepalanchok",
//     totalMembers: 412000,
//     establishedDate: new Date("2017-04-14"),
//     goodWorkPercent: 62,
//     badWorkPercent: 38,
//     development: 62,
//     goodWork: 62,
//     badWork: 38,
//     detailedMetrics: {
//       infrastructure: 61,
//       healthcare: 58,
//       education: 67,
//       economy: 64,
//       policyFailures: 14,
//       corruptionCases: 10,
//       publicComplaints: 14,
//     },
//     goodWorkBreakdown: [
//       { label: "Infrastructure", value: 61 },
//       { label: "Healthcare", value: 58 },
//       { label: "Education", value: 67 },
//       { label: "Agriculture", value: 69 },
//     ],
//     badWorkBreakdown: [
//       { label: "Policy failures", value: 14 },
//       { label: "Corruption cases", value: 10 },
//       { label: "Public complaints", value: 14 },
//     ],
//     futurePlans: [
//       "Land productivity modernization",
//       "Rural irrigation and soil testing labs",
//       "Cooperative market chain expansion",
//       "Village entrepreneurship grants",
//     ],
//   },
//   {
//     name: "Batti Pragati Party",
//     shortName: "BPP",
//     symbol: "Batti",
//     symbolName: "Batti",
//     leader: "Sarita Adhikari",
//     email: "batti.party@ovs.gov.np",
//     mobile: "9801000002",
//     color: "#d97706",
//     description:
//       "Batti Pragati Party champions energy access, urban services, and digital public utilities.",
//     vision:
//       "Deliver reliable light, power, and digital services in every household and municipality.",
//     headquarters: "Biratnagar, Morang",
//     totalMembers: 385000,
//     establishedDate: new Date("2018-11-02"),
//     goodWorkPercent: 59,
//     badWorkPercent: 41,
//     development: 59,
//     goodWork: 59,
//     badWork: 41,
//     detailedMetrics: {
//       infrastructure: 63,
//       healthcare: 56,
//       education: 58,
//       economy: 60,
//       policyFailures: 16,
//       corruptionCases: 9,
//       publicComplaints: 16,
//     },
//     goodWorkBreakdown: [
//       { label: "Infrastructure", value: 63 },
//       { label: "Healthcare", value: 56 },
//       { label: "Education", value: 58 },
//       { label: "Energy Access", value: 59 },
//     ],
//     badWorkBreakdown: [
//       { label: "Policy failures", value: 16 },
//       { label: "Corruption cases", value: 9 },
//       { label: "Public complaints", value: 16 },
//     ],
//     futurePlans: [
//       "Smart streetlight in all municipalities",
//       "Micro-grid for rural electrification",
//       "Public service digital help centers",
//       "24x7 city utility response cells",
//     ],
//   },
//   {
//     name: "Halo Krishak Party",
//     shortName: "HKP",
//     symbol: "Halo",
//     symbolName: "Halo",
//     leader: "Milan Rai",
//     email: "halo.party@ovs.gov.np",
//     mobile: "9801000003",
//     color: "#166534",
//     description:
//       "Halo Krishak Party represents farmers, cooperatives, and agro-industrial reforms.",
//     vision:
//       "Secure farmer income and modernize agriculture through value chain and technology.",
//     headquarters: "Damak, Jhapa",
//     totalMembers: 447000,
//     establishedDate: new Date("2015-01-26"),
//     goodWorkPercent: 64,
//     badWorkPercent: 36,
//     development: 64,
//     goodWork: 64,
//     badWork: 36,
//     detailedMetrics: {
//       infrastructure: 62,
//       healthcare: 61,
//       education: 63,
//       economy: 68,
//       policyFailures: 12,
//       corruptionCases: 11,
//       publicComplaints: 13,
//     },
//     goodWorkBreakdown: [
//       { label: "Infrastructure", value: 62 },
//       { label: "Healthcare", value: 61 },
//       { label: "Education", value: 63 },
//       { label: "Food Security", value: 70 },
//     ],
//     badWorkBreakdown: [
//       { label: "Policy failures", value: 12 },
//       { label: "Corruption cases", value: 11 },
//       { label: "Public complaints", value: 13 },
//     ],
//     futurePlans: [
//       "Farm mechanization subsidy",
//       "Agriculture cold-storage network",
//       "Minimum support price automation",
//       "Women-led farm cooperative fund",
//     ],
//   },
//   {
//     name: "Mobile Nagrik Party",
//     shortName: "MNP",
//     symbol: "Mobile",
//     symbolName: "Mobile",
//     leader: "Prakash Gurung",
//     email: "mobile.party@ovs.gov.np",
//     mobile: "9801000004",
//     color: "#2563eb",
//     description:
//       "Mobile Nagrik Party drives digital governance, startup growth, and youth jobs.",
//     vision:
//       "Citizen-first digital Nepal powered by transparent services and innovation economy.",
//     headquarters: "Baneshwor, Kathmandu",
//     totalMembers: 361000,
//     establishedDate: new Date("2019-06-30"),
//     goodWorkPercent: 57,
//     badWorkPercent: 43,
//     development: 57,
//     goodWork: 57,
//     badWork: 43,
//     detailedMetrics: {
//       infrastructure: 55,
//       healthcare: 53,
//       education: 61,
//       economy: 59,
//       policyFailures: 18,
//       corruptionCases: 11,
//       publicComplaints: 14,
//     },
//     goodWorkBreakdown: [
//       { label: "Infrastructure", value: 55 },
//       { label: "Healthcare", value: 53 },
//       { label: "Education", value: 61 },
//       { label: "Digital Services", value: 64 },
//     ],
//     badWorkBreakdown: [
//       { label: "Policy failures", value: 18 },
//       { label: "Corruption cases", value: 11 },
//       { label: "Public complaints", value: 14 },
//     ],
//     futurePlans: [
//       "Single mobile citizen app",
//       "Digital literacy in all provinces",
//       "Startup seed grants",
//       "National cyber incident response grid",
//     ],
//   },
//   {
//     name: "Basuri Sanskritik Party",
//     shortName: "BSP",
//     symbol: "Basuri",
//     symbolName: "Basuri",
//     leader: "Nisha Karki",
//     email: "basuri.party@ovs.gov.np",
//     mobile: "9801000005",
//     color: "#7c3aed",
//     description:
//       "Basuri Sanskritik Party prioritizes culture, tourism, arts, and social harmony.",
//     vision:
//       "Promote inclusive identity, local heritage, and creative economy across Nepal.",
//     headquarters: "Pokhara, Kaski",
//     totalMembers: 329000,
//     establishedDate: new Date("2016-09-18"),
//     goodWorkPercent: 55,
//     badWorkPercent: 45,
//     development: 55,
//     goodWork: 55,
//     badWork: 45,
//     detailedMetrics: {
//       infrastructure: 52,
//       healthcare: 54,
//       education: 57,
//       economy: 58,
//       policyFailures: 19,
//       corruptionCases: 10,
//       publicComplaints: 16,
//     },
//     goodWorkBreakdown: [
//       { label: "Infrastructure", value: 52 },
//       { label: "Healthcare", value: 54 },
//       { label: "Education", value: 57 },
//       { label: "Culture & Tourism", value: 60 },
//     ],
//     badWorkBreakdown: [
//       { label: "Policy failures", value: 19 },
//       { label: "Corruption cases", value: 10 },
//       { label: "Public complaints", value: 16 },
//     ],
//     futurePlans: [
//       "National cultural grants program",
//       "Community tourism circuits",
//       "Local language tech archive",
//       "Creative economy startup fund",
//     ],
//   },
// ];

// const firstNames = [
//   "Aarav",
//   "Aayush",
//   "Anisha",
//   "Aakriti",
//   "Bikash",
//   "Binita",
//   "Chirag",
//   "Diksha",
//   "Dipesh",
//   "Gita",
//   "Hem",
//   "Isha",
//   "Kiran",
//   "Kusum",
//   "Laxman",
//   "Mina",
//   "Nabin",
//   "Nisha",
//   "Pratik",
//   "Rabin",
//   "Rita",
//   "Sajan",
//   "Sapana",
//   "Sita",
//   "Sushant",
//   "Umesh",
//   "Yubraj",
// ];

// const lastNames = [
//   "Adhikari",
//   "Basnet",
//   "Bhujel",
//   "Bista",
//   "Chhetri",
//   "Dahal",
//   "Gurung",
//   "Karki",
//   "KC",
//   "Lama",
//   "Magar",
//   "Maharjan",
//   "Neupane",
//   "Pandey",
//   "Poudel",
//   "Rai",
//   "Shahi",
//   "Sharma",
//   "Tamang",
//   "Thapa",
// ];

// const districts = [
//   "Kathmandu",
//   "Lalitpur",
//   "Bhaktapur",
//   "Kaski",
//   "Morang",
//   "Jhapa",
//   "Sunsari",
//   "Chitwan",
//   "Rupandehi",
//   "Kailali",
// ];

// const provinces = [
//   "Koshi",
//   "Madhesh",
//   "Bagmati",
//   "Gandaki",
//   "Lumbini",
//   "Karnali",
//   "Sudurpashchim",
// ];

// const buildVoters = (count = 100) => {
//   const voters = [];
//   for (let i = 1; i <= count; i += 1) {
//     const first = firstNames[i % firstNames.length];
//     const last = lastNames[i % lastNames.length];
//     const district = districts[i % districts.length];
//     const province = provinces[i % provinces.length];
//     const voterNum = String(3000000 + i).padStart(7, "0");
//     const voterId = `NP${voterNum}`;
//     const email = `voter${String(i).padStart(3, "0")}@ovs.voter.np`;
//     const mobile = `98${String(10000000 + i).slice(-8)}`;
//     const year = 1985 + (i % 18);
//     const month = String((i % 12) + 1).padStart(2, "0");
//     const day = String((i % 27) + 1).padStart(2, "0");

//     voters.push({
//       fullName: `${first} ${last}`,
//       mobile,
//       email,
//       role: "voter",
//       voterId,
//       voterIdNumber: voterId,
//       dateOfBirth: new Date(`${year}-${month}-${day}`),
//       address: `Ward ${((i % 12) + 1).toString()}, ${district}`,
//       district,
//       province,
//       profilePhoto: PROFILE_IMAGES[i % PROFILE_IMAGES.length],
//       verificationStatus: "auto-approved",
//       verified: true,
//       isVerified: true,
//       isEmailVerified: true,
//       hasVoted: false,
//       isStudent: false,
//     });
//   }
//   return voters;
// };

// const upsertParties = async () => {
//   let created = 0;
//   let updated = 0;

//   for (const [index, seed] of partySeeds.entries()) {
//     const logo =
//       index === 0
//         ? makeTextLogo("Mato", "#92400e")
//         : index === 1
//           ? makeTextLogo("Batti", "#d97706")
//           : index === 2
//             ? makeTextLogo("Halo", "#166534")
//             : index === 3
//               ? makeTextLogo("Mobile", "#2563eb")
//               : makeTextLogo("Basuri", "#7c3aed");

//     const payload = {
//       ...seed,
//       logo,
//       electionType: "Political",
//       isActive: true,
//       isVerified: true,
//       status: "approved",
//       contact: {
//         address: seed.headquarters,
//         phone: seed.mobile,
//         email: seed.email,
//       },
//       socialMedia: {
//         facebook: `https://facebook.com/${seed.shortName.toLowerCase()}nepal`,
//         twitter: `https://x.com/${seed.shortName.toLowerCase()}nepal`,
//         website: `https://${seed.shortName.toLowerCase()}.gov.np`,
//       },
//       teamMembers: [
//         {
//           name: seed.leader,
//           position: "Party Chairperson",
//           role: "Leader",
//           photo: PROFILE_IMAGES[0],
//           bio: `${seed.leader} leads ${seed.shortName} with governance and reform agenda.`,
//         },
//         {
//           name: `${seed.shortName} General Secretary`,
//           position: "General Secretary",
//           role: "Core Committee",
//           photo: PROFILE_IMAGES[1],
//           bio: "Coordinates party policy, organization, and field campaigns.",
//         },
//         {
//           name: `${seed.shortName} Spokesperson`,
//           position: "Spokesperson",
//           role: "Media",
//           photo: PROFILE_IMAGES[2],
//           bio: "Handles public communication and strategic messaging.",
//         },
//       ],
//       gallery: [
//         PROFILE_IMAGES[0],
//         PROFILE_IMAGES[1],
//         PROFILE_IMAGES[2],
//       ],
//     };

//     const existing = await Party.findOne({ name: seed.name });
//     if (existing) {
//       await Party.updateOne({ _id: existing._id }, { $set: payload });
//       updated += 1;
//     } else {
//       await Party.create(payload);
//       created += 1;
//     }
//   }

//   return { created, updated };
// };

// const upsertPartyUsers = async () => {
//   const passwordHash = await bcrypt.hash("Party@12345", 10);
//   let created = 0;
//   let updated = 0;

//   for (const seed of partySeeds) {
//     const party = await Party.findOne({ name: seed.name }).select("_id name");
//     if (!party) continue;

//     const payload = {
//       fullName: seed.leader,
//       mobile: seed.mobile,
//       email: seed.email.toLowerCase(),
//       password: passwordHash,
//       role: "party",
//       partyId: party._id,
//       partyRole: "admin",
//       voterIdNumber: `PRTY-${party._id.toString().slice(-8).toUpperCase()}`,
//       address: seed.headquarters,
//       district: String(seed.headquarters || "").split(",").pop()?.trim() || "Kathmandu",
//       province: "Bagmati",
//       profilePhoto: PROFILE_IMAGES[0],
//       verificationStatus: "auto-approved",
//       verified: true,
//       isVerified: true,
//       isEmailVerified: true,
//     };

//     const existing = await User.findOne({
//       email: seed.email.toLowerCase(),
//       role: "party",
//     });
//     if (existing) {
//       await User.updateOne({ _id: existing._id }, { $set: payload });
//       updated += 1;
//     } else {
//       await User.create(payload);
//       created += 1;
//     }
//   }

//   return { created, updated };
// };

// const upsertVoters = async (count = 100) => {
//   const voters = buildVoters(count);
//   const passwordHash = await bcrypt.hash("Voter@12345", 10);
//   let created = 0;
//   let updated = 0;

//   for (const voter of voters) {
//     const payload = {
//       ...voter,
//       password: passwordHash,
//     };

//     const existing = await User.findOne({
//       $or: [{ email: voter.email }, { voterId: voter.voterId }],
//       role: "voter",
//     });

//     if (existing) {
//       await User.updateOne({ _id: existing._id }, { $set: payload });
//       updated += 1;
//     } else {
//       await User.create(payload);
//       created += 1;
//     }
//   }

//   return { created, updated };
// };

// const run = async () => {
//   const mongoUri = process.env.MONGO_URI;
//   if (!mongoUri) {
//     throw new Error("MONGO_URI missing in .env");
//   }

//   await mongoose.connect(mongoUri);
//   console.log("Connected MongoDB for fresh seed");

//   const partyResult = await upsertParties();
//   const partyUserResult = await upsertPartyUsers();
//   const voterResult = await upsertVoters(100);

//   const totalPartyCount = await Party.countDocuments();
//   const totalVoterCount = await User.countDocuments({ role: "voter" });

//   console.log("Seeding complete");
//   console.table({
//     partiesCreated: partyResult.created,
//     partiesUpdated: partyResult.updated,
//     partyUsersCreated: partyUserResult.created,
//     partyUsersUpdated: partyUserResult.updated,
//     votersCreated: voterResult.created,
//     votersUpdated: voterResult.updated,
//     totalParties: totalPartyCount,
//     totalVoters: totalVoterCount,
//   });
// };

// run()
//   .then(async () => {
//     await mongoose.disconnect();
//     process.exit(0);
//   })
//   .catch(async (error) => {
//     console.error("seedFreshData failed:", error.message);
//     if (mongoose.connection.readyState !== 0) {
//       await mongoose.disconnect();
//     }
//     process.exit(1);
//   });
