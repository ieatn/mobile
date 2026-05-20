export type TestingMobileRow = {
  id: string;
  title: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type TestingMobileInsert = Pick<TestingMobileRow, 'title' | 'notes'>;
