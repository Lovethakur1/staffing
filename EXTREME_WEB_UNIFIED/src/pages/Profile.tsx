import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Star,
  Award,
  Save,
  Edit,
  Camera,
  Shield,
  CheckCircle,
  AlertCircle,
  Globe
} from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

interface ProfileProps {
  userRole: string;
  userId: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  avatar: string;
  dob: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
  staffProfile?: {
    rating: number;
    totalEvents: number;
    hourlyRate: number;
    emergencyContact: string;
    emergencyPhone: string;
    skills: string[];
    availability: string[];
    availabilityStatus: string;
  };
}

export function Profile({ userRole, userId }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/users/${userId}`);
        const u = res.data;
        const mapped: UserProfile = {
          id: u.id,
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          bio: u.bio || '',
          avatar: u.avatar || '',
          dob: u.dob ? u.dob.split('T')[0] : '',
          gender: u.gender || '',
          address: u.address || '',
          city: u.city || '',
          state: u.state || '',
          zipCode: u.zipCode || '',
          country: u.country || '',
          role: u.role || '',
          isActive: u.isActive ?? true,
          createdAt: u.createdAt || '',
          lastLogin: u.lastLogin || '',
          staffProfile: u.staffProfile || undefined,
        };
        setProfile(mapped);
        setFormData(mapped);
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    if (userId) fetchProfile();
  }, [userId]);

  const handleSave = async () => {
    if (!formData) return;
    setIsSaving(true);
    try {
      const res = await api.put(`/users/${formData.id}`, {
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
        avatar: formData.avatar,
        dob: formData.dob || null,
        gender: formData.gender || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zipCode: formData.zipCode || null,
        country: formData.country || null,
      });
      const u = res.data;
      const updated: UserProfile = {
        ...formData,
        ...u,
        dob: u.dob ? u.dob.split('T')[0] : '',
      };
      setProfile(updated);
      setFormData(updated);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => prev ? ({ ...prev, avatar: imageUrl }) : null);
    }
  };

  if (isLoading || !profile || !formData) {
    return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;
  }

  const displayName = profile.name || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleImageUpload}
      />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">Profile</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Manage your personal information and professional details
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          {profile.staffProfile && <TabsTrigger value="professional">Professional</TabsTrigger>}
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* ── Personal Info Tab ── */}
        <TabsContent value="personal" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Avatar Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-border">
                      <AvatarImage src={formData.avatar} className="object-cover" />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button 
                        size="sm" 
                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-medium">{profile.name}</h3>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                    <Badge className="mt-2 bg-success text-success-foreground">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {profile.role}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Info Form */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Update your personal details and contact information
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dob}
                      onChange={(e) => handleInputChange('dob', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  {isEditing ? (
                    <Select
                      value={formData.gender}
                      onValueChange={(val) => handleInputChange('gender', val)}
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Non-binary">Non-binary</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="gender"
                      value={formData.gender || '—'}
                      disabled
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Address Tab ── */}
        <TabsContent value="address" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Address & Location
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Your home address and location details
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  placeholder="123 Main Street"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="New York"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State / Province</Label>
                  <Input
                    id="state"
                    placeholder="NY"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zipCode">Zip / Postal Code</Label>
                  <Input
                    id="zipCode"
                    placeholder="10001"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="United States"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* Display formatted full address when not editing */}
              {!isEditing && (profile.address || profile.city) && (
                <div className="mt-2 p-3 bg-muted/50 rounded-lg flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    {[profile.address, profile.city, profile.state, profile.zipCode, profile.country].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Professional Tab (Staff only) ── */}
        {profile.staffProfile && (
          <TabsContent value="professional" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Skills & Expertise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(profile.staffProfile.skills || []).map((skill, index) => (
                      <Badge key={index} variant="outline">{skill}</Badge>
                    ))}
                    {(profile.staffProfile.skills || []).length === 0 && (
                      <p className="text-sm text-muted-foreground">No skills added yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Professional Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{profile.staffProfile.totalEvents}</div>
                      <p className="text-xs text-muted-foreground">Events Completed</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold flex items-center justify-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        {profile.staffProfile.rating.toFixed(1)}
                      </div>
                      <p className="text-xs text-muted-foreground">Average Rating</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {(profile.staffProfile.emergencyContact || profile.staffProfile.emergencyPhone) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <p className="mt-1 text-sm">{profile.staffProfile.emergencyContact || '—'}</p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className="mt-1 text-sm">{profile.staffProfile.emergencyPhone || '—'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {/* ── Account Tab ── */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Account Status</Label>
                  <div className="mt-1">
                    {profile.isActive ? (
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />Active
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label>Role</Label>
                  <p className="mt-1 text-sm font-medium">{profile.role}</p>
                </div>
                <div>
                  <Label>Member Since</Label>
                  <p className="mt-1 text-sm flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div>
                  <Label>Last Login</Label>
                  <p className="mt-1 text-sm flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
