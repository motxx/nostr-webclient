export type PostType = {
  userId: string;
  userName: string;
  verified: boolean;
  content: string;
  likes: number;
  reposts: number;
  zaps: number;
  userImage: string;
  timestamp: string;
  mediaUrl?: string;
  mediaType?: "image" | "video-file" | "video-youtube";
  following: boolean;
};
