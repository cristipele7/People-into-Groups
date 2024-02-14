export interface IGroup {
  id: number;
  name: string;
  date_created: Date;
  date_updated: Date;
  parent_group_id: number;
  level?: number;
  children: (IGroup | IPeople)[];
}

export interface IPeople {
  id: number;
  first_name: string;
  last_name: string;
  job: string;
  date_created: Date;
  date_updated: Date;
  parent_group_id: number;
  level?: number;
}
