export type Category =
  | "inbox"
  | "hike"
  | "summit"
  | "stay"
  | "recipe"
  | "restaurant"
  | "wine"
  | "experience"
  | "trip"
  | "goal"
  | "savings"
  | "memory";
export type Item = {
  beforeWedding?: boolean;
  id: string;
  title: string;
  category: Category;
  status: "Someday" | "Planning" | "Scheduled" | "Experienced";
  owner: string;
  notes: string;
  url?: string;
  location?: string;
  date?: string;
  photo?: string;
  distance?: number;
  gain?: number;
  current?: number;
  target?: number;
  unit?: string;
  estimated?: boolean;
  logs?: { date: string; value: number; note?: string }[];
  related?: string[];
  review?: string;
  creator?: string;
  ingredients?: string;
  steps?: string;
  budget?: number;
  rating?: number;
  favorite?: boolean;
  updatedAt?: string;
};
export type Visit = {
  beforeWedding?: boolean;
  id: string;
  kind: "country" | "state" | "park";
  name: string;
  status: "Dreaming" | "Planning" | "Visited";
  date?: string;
  notes?: string;
};
export type Store = {
  items: Item[];
  visits: Visit[];
  belts: { name: string; earned: boolean; date?: string }[];
  letter: string;
  wedding: string;
  version: number;
};
