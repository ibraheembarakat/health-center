export type Article = {
  id: number;
  title: string;
  content: string;
  category: string;
  category_display: string;
  author_name: string;
  published_at: string;
};

export type ApiResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Article[];
};

export interface HeroPage {
  name: string
  role: string
  address?: string
  date_of_birth?: string
  registration_date?: string
  nutrition_status?: string
  weight?: string
  height?: string
  phone?: string
  email?: string
}