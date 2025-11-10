export interface Tour {
  id: number;
  title: string;
  country: string;
  country_id: number;
  duration_display: string;
  _days: number;
  _nights: number;
  rating: number;
  no_of_reviews: number;
  destinations: string[];
  shadow_price: string;
  discount_percentage: string;
  departure_date_us: string;
  adventure_style: string;
  start_city: string;
  end_city: string;
}

export interface ToursResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Tour[];
}