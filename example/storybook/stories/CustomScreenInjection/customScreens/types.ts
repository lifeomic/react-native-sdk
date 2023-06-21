import { HomeStackParamList } from '../../../../../src';

export type CustomHomeStackParamsList = HomeStackParamList & {
  'CustomHomeScreen/Users': undefined;
  'CustomHomeScreen/UserDetails': { userId: string; name: string };
};
