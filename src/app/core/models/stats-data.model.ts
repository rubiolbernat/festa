export interface StatsData {
  total_litres: number;
  total_preu: number;
  dies_beguts: number;
  begudes_totals: number;
  top_day_date: string;
  top_day_quantitat_litres: number;
  top_day_preu_total: number;
  top_spending_day_date: string;
  top_spending_day_sum_preu: number;
  top_spending_day_sum_quantitat: number;
  top_location_by_quantity_location: string;
  top_location_by_quantity_sum_quantitat: number;
  top_location_by_quantity_sum_preu: number;
  top_location_by_spending_location: string;
  top_location_by_spending_sum_preu: number;
  top_location_by_spending_sum_quantitat: number;
  top_drink_by_quantity_drink: string;
  top_drink_by_quantity_sum_preu: number;
  top_drink_by_quantity_sum_quantitat: number;
  top_drink_by_average_price_drink: string;
  top_drink_by_average_price_average_price: number;
  weekly_stats: any[]; // Ajusta el tipus segons la teva estructura de dades
  monthly_summary: any[]; // Ajusta el tipus segons la teva estructura de dades
  top_drinker: any[];
}
