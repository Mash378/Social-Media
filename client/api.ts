import axios from "axios";

const API_BASE = "http://localhost:5001/api/votes";

export const castVote = async (
  battleId: string,
  voterId: string,
  votedFor: string,
  votedAgainst: string
) => {
  await axios.post(`${API_BASE}/vote`, {
    battleId,
    voterId,
    votedFor,
    votedAgainst,
  });
};
