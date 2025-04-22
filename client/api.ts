import axios from "axios";
import { Battle, Video } from "./types";

const API_BASE = "http://localhost:3001/api";

export const castVote = async (
  battleId: string,
  votedFor: string,
  votedAgainst: string
): Promise<void> => {
  await axios.post(`${API_BASE}/votes/vote`, {
    battleId,
    votedFor,
    votedAgainst,
  });
};

export const fetchVideos = async (): Promise<Video[]> => {
  const response = await axios.get(`${API_BASE}/videos/my-videos`, {
    withCredentials: true,
  });
  return response.data;
};

export const fetchBattles = async (): Promise<Battle[]> => {
  const response = await axios.get(`${API_BASE}/battles/active`, {
    withCredentials: true,
  });
  return response.data;
};

export const fetchBattle = async (battleId: string): Promise<Battle> => {
  const response = await axios.get(`${API_BASE}/battles/${battleId}`, {
    withCredentials: true,
  });
  return response.data;
};

export interface UserProfile {
  username: string;
  videos: Video[];
  votes: {
    battleId: string;
    votedFor: string;
    votedAgainst: string;
    endsIn: number; // ms remaining
  }[];
}

export const fetchProfile = async (): Promise<UserProfile> => {
  const { data } = await axios.get(`${API_BASE}/profile`, {
    withCredentials: true,
  });
  return data;
};
