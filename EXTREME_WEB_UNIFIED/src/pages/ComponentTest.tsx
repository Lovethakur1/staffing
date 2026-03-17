import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { LiveTrackingMap } from "../components/dashboards/LiveTrackingMap";
import { Shield, MapPin } from "lucide-react";

export function ComponentTest() {
  const testStaff = {
    name: "John Martinez",
    role: "Event Staff",
    image: undefined
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Component Testing</h1>
          <p className="text-slate-600">Test the BiometricScanner and LiveTrackingMap components</p>
        </div>

        {/* Live Tracking Map Test */}
        <Card className="border-sangria/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-sangria" />
              Live Tracking Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Light-mode professional street map with clear blue route lines and distinct markers
            </p>
            <div className="h-[600px] w-full rounded-lg overflow-hidden border-2 border-slate-200">
              <LiveTrackingMap
                staff={testStaff}
                destinationName="Downtown Event Center"
                eta="12 mins"
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Test Cases */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Map Test - Arrived Status */}
          <Card className="border-sangria/20">
            <CardHeader>
              <CardTitle className="text-base">Map: Arrived Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full rounded-lg overflow-hidden">
                <LiveTrackingMap
                  staff={{ name: "Sarah Chen", role: "Manager" }}
                  destinationName="Conference Hall"
                  eta="Arrived"
                />
              </div>
            </CardContent>
          </Card>

          {/* Map Test - Different Staff */}
          <Card className="border-sangria/20">
            <CardHeader>
              <CardTitle className="text-base">Map: En Route</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full rounded-lg overflow-hidden">
                <LiveTrackingMap
                  staff={{ name: "Michael Rodriguez", role: "Staff" }}
                  destinationName="Stadium Entrance"
                  eta="8 mins"
                />
              </div>
            </CardContent>
          </Card>

        </div>

      </div>


    </div>
  );
}
