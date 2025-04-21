// client/api.ts (updated with proper types)
import axios from "axios";
import { Video, Battle, Vote } from "./types";

const API_BASE = "http://localhost:3001/api";

export const castVote = async (
    battleId: string,
    voterId: string,
    votedFor: string,
    votedAgainst: string
): Promise<void> => {
  await axios.post(`${API_BASE}/votes/vote`, {
    battleId,
    voterId,
    votedFor,
    votedAgainst,
  });
};

export const fetchVideos = async (): Promise<Video[]> => {
  const response = await axios.get(`${API_BASE}/videos/my-videos`, {
    withCredentials: true
  });
  return response.data;
};

export const fetchBattles = async (): Promise<Battle[]> => {
  const response = await axios.get(`${API_BASE}/battles/active`, {
    withCredentials: true
  });
  return response.data;
};

export const fetchBattle = async (battleId: string): Promise<Battle> => {
  const response = await axios.get(`${API_BASE}/battles/${battleId}`, {
    withCredentials: true
  });
  return response.data;
};