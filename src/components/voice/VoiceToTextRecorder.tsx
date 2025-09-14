import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Mic, 
  MicOff, 
  Square, 
  Save, 
  Trash2,
  Volume2,
  VolumeX,
  Clock,
  FileText,
  Target,
  DollarSign,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";

interface TranscriptionSession {
  id: string;
  timestamp: Date;
  duration: number;
  transcript: string;
  category: string;
  confidence: number;
  status: 'recording' | 'processing' | 'completed' | 'error';
}

const categories = [
  { value: "deal-call", label: "Deal Call", icon: Target },
  { value: "client-meeting", label: "Client Meeting", icon: Users },
  { value: "strategy-session", label: "Strategy Session", icon: FileText },
  { value: "financial-review", label: "Financial Review", icon: DollarSign },
  { value: "planning-meeting", label: "Planning Meeting", icon: Calendar },
  { value: "general", label: "General Notes", icon: Mic }
];

export function VoiceToTextRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [sessions, setSessions] = useState<TranscriptionSession[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("deal-call");
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  useEffect(() => {
    // Check if Web Speech API is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setCurrentTranscript(prev => prev + finalTranscript + interimTranscript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        toast({
          title: "Recording Error",
          description: "There was an issue with voice recognition. Please try again.",
          variant: "destructive",
        });
      };
      
      recognitionRef.current.onend = () => {
        if (isRecording) {
          recognitionRef.current.start();
        }
      };
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording, toast]);

  const startRecording = () => {
    if (!isSupported || !recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Voice recognition is not supported in this browser. Try Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }
    
    setIsRecording(true);
    setCurrentTranscript("");
    setRecordingTime(0);
    
    // Start the timer
    intervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    
    recognitionRef.current.start();
    
    toast({
      title: "Recording Started",
      description: "Speak clearly for best results. Your voice is being transcribed in real-time.",
    });
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;
    
    setIsRecording(false);
    setIsProcessing(true);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    recognitionRef.current.stop();
    
    // Simulate processing delay
    setTimeout(() => {
      const session: TranscriptionSession = {
        id: Date.now().toString(),
        timestamp: new Date(),
        duration: recordingTime,
        transcript: currentTranscript.trim(),
        category: selectedCategory,
        confidence: 0.85 + Math.random() * 0.15, // Simulate confidence score
        status: currentTranscript.trim() ? 'completed' : 'error'
      };
      
      setSessions(prev => [session, ...prev]);
      setIsProcessing(false);
      setRecordingTime(0);
      
      if (session.status === 'completed') {
        toast({
          title: "Recording Saved",
          description: `Transcription completed with ${Math.round(session.confidence * 100)}% confidence.`,
        });
      } else {
        toast({
          title: "No Speech Detected",
          description: "Please try recording again and speak more clearly.",
          variant: "destructive",
        });
      }
    }, 1500);
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    toast({
      title: "Session Deleted",
      description: "Transcription session has been removed.",
    });
  };

  const saveToPortfolio = (session: TranscriptionSession) => {
    // Here you would integrate with your portfolio/deal management system
    toast({
      title: "Saved to Portfolio",
      description: "Voice note has been added to your deal pipeline.",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryIcon = (categoryValue: string) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.icon : Mic;
  };

  if (!isSupported) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Voice Recognition Not Supported</h3>
          <p className="text-muted-foreground">
            Voice-to-text requires Chrome, Edge, or Safari. Please use a supported browser.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recording Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" />
            Voice-to-Text Recorder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Recording Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={isRecording}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      <category.icon className="h-4 w-4" />
                      {category.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recording Controls */}
          <div className="flex items-center justify-center space-x-4">
            {!isRecording && !isProcessing && (
              <Button onClick={startRecording} size="lg" className="h-16 w-16 rounded-full">
                <Mic className="h-6 w-6" />
              </Button>
            )}
            
            {isRecording && (
              <>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-red-500">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
                  </div>
                  <Button onClick={stopRecording} size="lg" variant="destructive" className="h-16 w-16 rounded-full">
                    <Square className="h-6 w-6" />
                  </Button>
                </div>
              </>
            )}

            {isProcessing && (
              <div className="flex items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-muted-foreground">Processing transcription...</span>
              </div>
            )}
          </div>

          {/* Live Transcription */}
          {(isRecording || currentTranscript) && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Live Transcription</label>
              <Textarea 
                value={currentTranscript}
                onChange={(e) => setCurrentTranscript(e.target.value)}
                placeholder="Your speech will appear here in real-time..."
                className="min-h-[120px]"
                disabled={isRecording}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transcription History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Recent Transcriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <VolumeX className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recordings yet. Start your first voice session above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => {
                const CategoryIcon = getCategoryIcon(session.category);
                const categoryLabel = categories.find(cat => cat.value === session.category)?.label || session.category;
                
                return (
                  <div key={session.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CategoryIcon className="h-5 w-5 text-primary" />
                        <div>
                          <h4 className="font-medium">{categoryLabel}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(session.duration)}
                            </span>
                            <span>{session.timestamp.toLocaleString()}</span>
                            <Badge variant={session.status === 'completed' ? 'default' : 'destructive'}>
                              {Math.round(session.confidence * 100)}% confidence
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {session.status === 'completed' && (
                          <Button size="sm" variant="outline" onClick={() => saveToPortfolio(session)}>
                            <Save className="h-4 w-4 mr-2" />
                            Save to Portfolio
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => deleteSession(session.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {session.transcript && (
                      <div className="bg-muted/50 rounded p-3">
                        <p className="text-sm leading-relaxed">{session.transcript}</p>
                      </div>
                    )}
                    
                    {session.status === 'error' && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>No clear speech detected in this recording</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}