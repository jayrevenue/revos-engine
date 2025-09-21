import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Clock, Users, Target, Plus } from "lucide-react";
import Page from "@/components/layout/Page";
import { format } from "date-fns";

const Scheduling = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', user?.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'session': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'sprint': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'deliverable': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/10 text-green-600';
      case 'pending': return 'bg-yellow-500/10 text-yellow-600';
      case 'cancelled': return 'bg-red-500/10 text-red-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <Page
      title="Scheduling"
      description="Manage engagement sessions, sprints, and deliverables"
      actions={
        <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Schedule Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Schedule New Event</DialogTitle>
                  <DialogDescription>
                    Create a new engagement session, sprint, or deliverable review.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Event Title</Label>
                    <Input id="title" placeholder="Enter event title" />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Event Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="session">Engagement Session</SelectItem>
                        <SelectItem value="sprint">Sprint Planning</SelectItem>
                        <SelectItem value="deliverable">Deliverable Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="engagement">Engagement</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select engagement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="techcorp">TechCorp Digital Transformation</SelectItem>
                        <SelectItem value="financeflow">FinanceFlow RevOS Implementation</SelectItem>
                        <SelectItem value="retailmax">RetailMax Optimization</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="time">Time</Label>
                      <Input id="time" type="time" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30min">30 minutes</SelectItem>
                        <SelectItem value="1hr">1 hour</SelectItem>
                        <SelectItem value="2hr">2 hours</SelectItem>
                        <SelectItem value="3hr">3 hours</SelectItem>
                        <SelectItem value="half-day">Half day</SelectItem>
                        <SelectItem value="full-day">Full day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" placeholder="Add any additional notes..." />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">Schedule Event</Button>
                    <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Main Content */}
      <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Calendar View
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Upcoming Events
            </TabsTrigger>
            <TabsTrigger value="engagements" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              By Engagement
            </TabsTrigger>
          </TabsList>

          {/* Calendar View */}
          <TabsContent value="calendar" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Calendar</CardTitle>
                    <CardDescription>Select a date to view events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Events for {selectedDate ? format(selectedDate, 'MMMM dd, yyyy') : 'Selected Date'}
                    </CardTitle>
                    <CardDescription>All scheduled events for the selected date</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        </div>
                      ) : events.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No events scheduled</p>
                          <p className="text-sm">Create your first event to get started</p>
                        </div>
                      ) : events.map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{event.title}</h4>
                                <Badge className={getEventTypeColor(event.type)}>
                                  {event.type}
                                </Badge>
                                <Badge className={getStatusColor(event.status)}>
                                  {event.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{event.engagement}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{event.time}</span>
                                <span>{event.duration}</span>
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <span>{event.participants.length} participants</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Upcoming Events */}
          <TabsContent value="upcoming" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>All scheduled events in chronological order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : events.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No upcoming events</p>
                      <p className="text-sm">Schedule your first event to see it here</p>
                    </div>
                  ) : events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{event.title}</h4>
                            <Badge className={getEventTypeColor(event.type)}>
                              {event.type}
                            </Badge>
                            <Badge className={getStatusColor(event.status)}>
                              {event.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{event.engagement}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{format(event.date, 'MMM dd, yyyy')}</span>
                            <span>{event.time}</span>
                            <span>{event.duration}</span>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{event.participants.join(', ')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Join
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* By Engagement */}
          <TabsContent value="engagements" className="space-y-6">
            <div className="grid gap-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No events by engagement</p>
                  <p className="text-sm">Events will be grouped by engagement once created</p>
                </div>
              ) : (
                // Group events by engagement
                Array.from(new Set(events.map(e => e.engagement_id).filter(Boolean))).map((engagementId) => (
                  <Card key={engagementId}>
                    <CardHeader>
                      <CardTitle>Engagement Events</CardTitle>
                      <CardDescription>Events for this engagement</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {events
                          .filter(event => event.engagement_id === engagementId)
                          .map((event) => (
                            <div key={event.id} className="flex items-center justify-between p-3 border rounded-md">
                              <div className="flex items-center gap-3">
                                <Badge className={getEventTypeColor(event.event_type)}>
                                  {event.event_type}
                                </Badge>
                                <div>
                                  <h5 className="font-medium">{event.title}</h5>
                                  <p className="text-sm text-muted-foreground">
                                    {format(new Date(event.start_time), 'MMM dd, h:mm a')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
    </Page>
  );
};

export default Scheduling;
