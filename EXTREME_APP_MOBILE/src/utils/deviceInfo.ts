import * as Device from 'expo-device';
import * as Network from 'expo-network';
import { Platform } from 'react-native';

export interface DevicePayload {
  deviceId: string;
  deviceName: string;
  deviceModel: string;
  deviceBrand: string;
  deviceOS: string;
}

let cached: DevicePayload | null = null;

/**
 * Collects device info using expo-device.
 * Generates a fingerprint deviceId from brand+model+deviceName.
 * Result is cached for the session.
 */
export async function getDeviceInfo(): Promise<DevicePayload> {
  if (cached) return cached;

  const brand = Device.brand ?? 'Unknown';
  const model = Device.modelName ?? Device.modelId ?? 'Unknown';
  const name = Device.deviceName ?? 'Unknown';
  const os = `${Platform.OS} ${Device.osVersion ?? ''}`.trim();

  // Create a stable fingerprint from hardware properties
  const deviceId = `${brand}-${model}-${name}`.replace(/\s+/g, '_');

  cached = { deviceId, deviceName: name, deviceModel: model, deviceBrand: brand, deviceOS: os };
  return cached;
}
