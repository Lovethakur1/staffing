import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  Alert, Linking, Platform, Vibration,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import api, { API_BASE_URL } from '../config/api';
import { getDeviceInfo } from '../utils/deviceInfo';
import { startBackgroundLocationTracking } from '../services/backgroundLocation';
import { RootStackParamList } from '../types';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme';

type RouteType = RouteProp<RootStackParamList, 'LiveMap'>;

const ARRIVAL_THRESHOLD_METERS = 100; // Auto-arrive when within 100m

interface Coords {
  latitude: number;
  longitude: number;
}

/** Haversine formula — returns distance in meters between two lat/lng points */
function getDistanceMeters(a: Coords, b: Coords): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export default function LiveMapScreen() {
  const route = useRoute<RouteType>();
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const { shiftId, eventLat, eventLng, eventTitle, eventAddress } = route.params;
  
  const mapRef = useRef<MapView>(null);
  const locationSub = useRef<Location.LocationSubscription | null>(null);
  const arrivedRef = useRef(false); // prevent duplicate arrive calls

  const [userLocation, setUserLocation] = useState<Coords | null>(null);
  const [loading, setLoading] = useState(true);
  const [distanceToEvent, setDistanceToEvent] = useState<number | null>(null);
  const [arrived, setArrived] = useState(false);

  const destination: Coords | null = eventLat && eventLng
    ? { latitude: eventLat, longitude: eventLng }
    : null;

  useEffect(() => {
    startTracking();
    return () => {
      if (locationSub.current) locationSub.current.remove();
    };
  }, []);

  async function startTracking() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required for live tracking.');
      setLoading(false);
      return;
    }

    // Start background location tracking (works even when app is minimized)
    startBackgroundLocationTracking(shiftId, API_BASE_URL).catch(() => {});

    // Get initial position
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
    setUserLocation(coords);
    setLoading(false);

    // Fit map to show both points
    if (destination && mapRef.current) {
      mapRef.current.fitToCoordinates([coords, destination], {
        edgePadding: { top: 100, right: 60, bottom: 200, left: 60 },
        animated: true,
      });
    }

    // Watch position for real-time movement
    locationSub.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 10, timeInterval: 5000 },
      (position) => {
        const newCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserLocation(newCoords);

        // Update backend with live location
        api.post(`/shifts/${shiftId}/update-location`, {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }).catch(() => {});

        // Check distance to event and auto-arrive if close enough
        if (destination && !arrivedRef.current) {
          const dist = getDistanceMeters(newCoords, destination);
          setDistanceToEvent(dist);

          if (dist <= ARRIVAL_THRESHOLD_METERS) {
            arrivedRef.current = true;
            setArrived(true);
            Vibration.vibrate([0, 200, 100, 200]); // double buzz

            // Auto-mark arrived on backend
            getDeviceInfo().then(device =>
              api.post(`/shifts/${shiftId}/arrive`, {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                ...device,
              })
            ).then(() => {
              Alert.alert(
                'Arrived!',
                `You are within ${Math.round(dist)}m of the event location. You have been marked as arrived.`,
                [{ text: 'OK', onPress: () => nav.goBack() }]
              );
            }).catch(() => {
              // Even if backend fails, show arrived locally
              Alert.alert('Arrived!', 'You have reached the event location.', [
                { text: 'OK', onPress: () => nav.goBack() },
              ]);
            });
          }
        }
      }
    );
  }

  function openDirections() {
    if (!destination) return;
    const { latitude, longitude } = destination;
    const label = encodeURIComponent(eventTitle || 'Event Location');

    const url = Platform.select({
      ios: `http://maps.apple.com/?daddr=${latitude},${longitude}&q=${label}`,
      android: `google.navigation:q=${latitude},${longitude}`,
    });

    if (url) {
      Linking.openURL(url).catch(() => {
        // Fallback to Google Maps web
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`);
      });
    }
  }

  function recenterMap() {
    if (!mapRef.current) return;
    if (userLocation && destination) {
      mapRef.current.fitToCoordinates([userLocation, destination], {
        edgePadding: { top: 100, right: 60, bottom: 200, left: 60 },
        animated: true,
      });
    } else if (userLocation) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  }

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={s.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={s.map}
        showsUserLocation
        showsMyLocationButton={false}
        initialRegion={
          userLocation
            ? { ...userLocation, latitudeDelta: 0.05, longitudeDelta: 0.05 }
            : destination
              ? { ...destination, latitudeDelta: 0.05, longitudeDelta: 0.05 }
              : { latitude: 0, longitude: 0, latitudeDelta: 90, longitudeDelta: 90 }
        }
      >
        {/* Destination marker */}
        {destination && (
          <Marker coordinate={destination} title={eventTitle || 'Event'} description={eventAddress}>
            <View style={s.destMarker}>
              <Ionicons name="location" size={28} color={Colors.white} />
            </View>
          </Marker>
        )}

        {/* Route line */}
        {userLocation && destination && (
          <Polyline
            coordinates={[userLocation, destination]}
            strokeColor={Colors.primary}
            strokeWidth={3}
            lineDashPattern={[10, 5]}
          />
        )}
      </MapView>

      {/* Header overlay */}
      <View style={[s.headerOverlay, { paddingTop: insets.top + Spacing.xs }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={s.headerInfo}>
          <Text style={s.headerTitle} numberOfLines={1}>{eventTitle || 'Navigation'}</Text>
          {eventAddress && <Text style={s.headerAddr} numberOfLines={1}>{eventAddress}</Text>}
        </View>
      </View>

      {/* Controls overlay */}
      <View style={[s.controlsOverlay, { bottom: insets.bottom + 100 }]}>
        <TouchableOpacity style={s.controlBtn} onPress={recenterMap}>
          <Ionicons name="locate" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Bottom card */}
      <View style={[s.bottomCard, { paddingBottom: insets.bottom || Spacing.lg }]}>
        {arrived ? (
          <View style={s.arrivedBanner}>
            <Ionicons name="checkmark-circle" size={28} color={Colors.success} />
            <Text style={s.arrivedText}>You have arrived!</Text>
          </View>
        ) : destination ? (
          <View>
            {/* Distance indicator */}
            {distanceToEvent !== null && (
              <View style={s.distanceRow}>
                <Ionicons name="navigate-circle" size={20} color={Colors.primary} />
                <Text style={s.distanceText}>
                  {distanceToEvent >= 1000
                    ? `${(distanceToEvent / 1000).toFixed(1)} km away`
                    : `${Math.round(distanceToEvent)} m away`}
                </Text>
                {distanceToEvent <= 300 && (
                  <View style={s.nearbyBadge}>
                    <Text style={s.nearbyText}>Almost there!</Text>
                  </View>
                )}
              </View>
            )}
            <TouchableOpacity style={s.directionsBtn} onPress={openDirections}>
              <Ionicons name="navigate" size={22} color={Colors.white} />
              <Text style={s.directionsBtnText}>Get Directions</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.noDestination}>
            <Ionicons name="warning" size={20} color={Colors.warning} />
            <Text style={s.noDestText}>No event coordinates available. Your live location is being tracked.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  loadingText: { marginTop: Spacing.md, color: Colors.textSecondary, fontSize: FontSize.md },
  map: { flex: 1 },

  // Destination marker
  destMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  // Header
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerInfo: { flex: 1, marginLeft: Spacing.sm },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  headerAddr: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },

  // Controls
  controlsOverlay: {
    position: 'absolute',
    right: Spacing.md,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  // Bottom card
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  directionsBtnText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  noDestination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
  },
  noDestText: { flex: 1, fontSize: FontSize.md, color: Colors.textSecondary },

  // Distance & arrival
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.infoLight,
    borderRadius: BorderRadius.md,
  },
  distanceText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.info },
  nearbyBadge: {
    marginLeft: 'auto' as any,
    backgroundColor: Colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  nearbyText: { fontSize: 11, fontWeight: '700', color: Colors.success },
  arrivedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.successLight,
    borderRadius: BorderRadius.md,
  },
  arrivedText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.success },
});
