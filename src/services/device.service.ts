import { Platform } from 'react-native';
import { API_ENDPOINTS } from '../config';
import apiService from './api.service';

class DeviceService {
  async saveFcmToken(userId: string, fcmToken: string, deviceId: string) {
    const response = await apiService.post(API_ENDPOINTS.DEVICES.REGISTER, {
      userId,
      fcmToken,
      deviceType: Platform.OS.toUpperCase(),
      deviceId,
    });
    return response;
  }

  async updateFcmToken(id: string, fcmToken: string, userId: string) {
    const response = await apiService.post(API_ENDPOINTS.DEVICES.UPDATE(id), {
      fcmToken,
      userId,
    });
    return response;
  }

  async deleteFcmToken(id: string, userId: string) {
    const response = await apiService.post(API_ENDPOINTS.DEVICES.DELETE(id), {
      userId,
    });
    return response;
  }
}

export const deviceService = new DeviceService();
export default deviceService;
