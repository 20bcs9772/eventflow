import { NavigatorScreenParams } from '@react-navigation/native';
import { MainTabParamList, RootStackParamList } from './index';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type { RootStackParamList, MainTabParamList };

