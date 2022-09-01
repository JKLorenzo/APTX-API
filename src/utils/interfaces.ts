export interface IAccessTokenDB {
  id: number;
  user_id: number;
  token: string;
}

export interface IUserDB {
  id: number;
  name: string;
  email: string;
  password: string;
}

export interface IUserUpdate {
  name?: string;
  email?: string;
  password?: string;
}
