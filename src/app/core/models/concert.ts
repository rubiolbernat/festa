export interface Concert {
  concert_id: number;
  title: string;
  description?: string;
  date: string;
  location: string;
  tickets_url?: string;
}
