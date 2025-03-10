export interface settings_db {
  settings_id: number;
  key_name: string;
  value: string;
  date_created: string;
  date_updated: string;
  type: string;
  description?: string;
}
