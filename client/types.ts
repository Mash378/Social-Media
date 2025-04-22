// client/types.ts
export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Video {
  _id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  tags: string[];
  uploadedAt: Date;
  uploaderId: string;
  views: number;
  votes: number;
  status: "active" | "deleted";
}

export interface Battle {
  _id: string;
  video1: Video;
  video2: Video;
  tag: string;
  startedAt: Date;
  endsAt: Date;
  active: boolean;
  video1Votes: number;
  video2Votes: number;
  winner?: string;
  concludedAt?: Date;
  endsInMs: number;
}

export interface Vote {
  battleId: string;
  voterId: string;
  votedFor: string;
  votedAgainst: string;
  votedAt: Date;
}
