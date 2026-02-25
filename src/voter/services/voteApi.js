import api from "../../services/api";

export const sendVoteOtp = async (partyId) => {
  const res = await api.post("/votes/request-otp", { partyId });
  return res.data;
};

export const confirmVote = async ({ electionId, partyId }) => {
  const res = await api.post("/votes", { electionId, partyId });
  return res.data;
};
