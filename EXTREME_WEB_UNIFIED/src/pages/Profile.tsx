import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
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
  AlertCircle
} from "lucide-react";

interface ProfileProps {
  userRole: string;
  userId: string;
}

export function Profile({ userRole }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    firstName: "Emma",
    lastName: "Williams",
    email: "emma.williams@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street, New York, NY 10001",
    dateOfBirth: "1995-03-15",
    emergencyContactName: "John Williams",
    emergencyContactPhone: "+1 (555) 987-6543",
    emergencyContactRelation: "Father",
    bio: "Experienced bartender and server with 5+ years in event hospitality. Specialized in corporate events and wedding receptions.",
    skills: ["Bartending", "Wine Service", "Customer Service", "Event Setup"],
    certifications: ["Food Safety Certification", "Responsible Beverage Service", "CPR Certified"],
    profileImage: ""
  });

  // Mock profile stats
  const profileStats = {
    totalShifts: 157,
    totalHours: 628,
    averageRating: 4.8,
    totalEarnings: 15700,
    completionRate: 98,
    punctualityRate: 96,
    clientRatings: [
      { rating: 5, count: 89 },
      { rating: 4, count: 12 },
      { rating: 3, count: 3 },
      { rating: 2, count: 1 },
      { rating: 1, count: 0 }
    ],
    recentReviews: [
      {
        id: 1,
        eventName: "Corporate Gala 2024",
        rating: 5,
        comment: "Emma was exceptional! Professional, friendly, and went above and beyond.",
        date: "2024-10-20",
        client: "Tech Solutions Inc."
      },
      {
        id: 2,
        eventName: "Wedding Reception",
        rating: 5,
        comment: "Perfect service throughout the evening. Highly recommend!",
        date: "2024-10-15",
        client: "Johnson Family"
      },
      {
        id: 3,
        eventName: "Business Conference",
        rating: 4,
        comment: "Great work, arrived on time and handled everything professionally.",
        date: "2024-10-08",
        client: "Conference Center LLC"
      }
    ]
  };

  const handleSave = () => {
    console.log('Saving profile data:', formData);
    setIsEditing(false);
    // In real app, this would save to backend
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values could be implemented here if needed
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        profileImage: imageUrl
      }));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Hidden File Input */}
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
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Picture and Basic Info */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-border">
                      <AvatarImage src={formData.profileImage} className="object-cover" />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                        {formData.firstName[0]}{formData.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button 
                        size="sm" 
                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                        onClick={triggerFileInput}
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-medium">{formData.firstName} {formData.lastName}</h3>
                    <p className="text-sm text-muted-foreground">{formData.email}</p>
                    <Badge className="mt-2 bg-success text-success-foreground">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified Staff
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information Form */}
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
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                  />
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
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={!isEditing}
                  />
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

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Emergency Contact
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                This information is kept confidential and used only in emergencies
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="emergencyContactName">Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContactRelation">Relationship</Label>
                  <Input
                    id="emergencyContactRelation"
                    value={formData.emergencyContactRelation}
                    onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professional" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Skills & Expertise</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your professional skills and areas of expertise
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                  {isEditing && (
                    <Button variant="outline" size="sm">
                      + Add Skill
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your professional certifications and qualifications
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {formData.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary" />
                      <span className="text-sm">{cert}</span>
                    </div>
                  ))}
                  {isEditing && (
                    <Button variant="outline" size="sm">
                      + Add Certification
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Professional Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Statistics</CardTitle>
              <p className="text-sm text-muted-foreground">
                Your work history and performance metrics
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-foreground">{profileStats.totalShifts}</div>
                  <p className="text-sm text-muted-foreground">Total Shifts</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-foreground">{profileStats.totalHours}</div>
                  <p className="text-sm text-muted-foreground">Hours Worked</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-foreground">${profileStats.totalEarnings.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-foreground">{profileStats.averageRating}</div>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your key performance indicators
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Completion Rate</span>
                    <span className="text-sm font-medium">{profileStats.completionRate}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-success h-2 rounded-full" 
                      style={{ width: `${profileStats.completionRate}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Punctuality Rate</span>
                    <span className="text-sm font-medium">{profileStats.punctualityRate}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-info h-2 rounded-full" 
                      style={{ width: `${profileStats.punctualityRate}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Client Satisfaction</span>
                    <span className="text-sm font-medium">{profileStats.averageRating}/5.0</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-warning h-2 rounded-full" 
                      style={{ width: `${(profileStats.averageRating / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your latest accomplishments and recognitions
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
                    <Award className="w-8 h-8 text-success" />
                    <div>
                      <h4 className="font-medium text-success">Top Performer</h4>
                      <p className="text-xs text-muted-foreground">October 2024</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-info/10 rounded-lg">
                    <Clock className="w-8 h-8 text-info" />
                    <div>
                      <h4 className="font-medium text-info">Perfect Attendance</h4>
                      <p className="text-xs text-muted-foreground">Last 3 months</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-warning/10 rounded-lg">
                    <Star className="w-8 h-8 text-warning" />
                    <div>
                      <h4 className="font-medium text-warning">5-Star Service</h4>
                      <p className="text-xs text-muted-foreground">15 consecutive ratings</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          {/* Rating Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
              <p className="text-sm text-muted-foreground">
                How clients have rated your service
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profileStats.clientRatings.map((rating, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-sm">{rating.rating}</span>
                      <Star className="w-3 h-3 fill-warning text-warning" />
                    </div>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-warning h-2 rounded-full" 
                        style={{ 
                          width: `${(rating.count / profileStats.clientRatings.reduce((sum, r) => sum + r.count, 0)) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-8">{rating.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
              <p className="text-sm text-muted-foreground">
                Latest feedback from clients
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {profileStats.recentReviews.map((review) => (
                  <div key={review.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{review.eventName}</h4>
                        <p className="text-sm text-muted-foreground">{review.client}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-warning fill-warning' : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground italic">"{review.comment}"</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
