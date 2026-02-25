import api from "../../services/api";

export const sendVoteOtp = async (partyId) => {
  const res = await api.post("/votes/request-otp", { partyId });
  return res.data;
};

export const confirmVote = async ({ partyId, otp }) => {
  const res = await api.post("/voter/confirm-vote", { partyId, otp });
  return res.data;
};
