export interface Story {
  imageUrl: string;
  votes?: number;
  votsPositius?: number;
  votsNegatius?: number;
  originalDrinkId?: number;
  uploaded_at?: string;
}

export interface UserStoryData {
  user: {
    name: string;
    id: number;
    profileImage: string;
    stories: Story[];
  };
}
