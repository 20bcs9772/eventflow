import { Platform } from 'react-native';
import { API_ENDPOINTS } from '../config';
import apiService from './api.service';

class DeviceService {
  async saveFcmToken(userId: string, fcmToken: string) {
    const response = await apiService.post(API_ENDPOINTS.DEVICES.REGISTER, {
      userId,
      fcmToken,
      deviceType: Platform.OS.toUpperCase()
    });
    return response;
  }
}

export const deviceService = new DeviceService();
export default deviceService;
