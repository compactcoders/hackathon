import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { PawPrint, Mic, Users, MessageSquare, CheckSquare, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="pt-20 pb-16 text-center">
          <div className="flex justify-center items-center space-x-4 mb-8">
            <PawPrint className="h-16 w-16 text-blue-600" />
            <h1 className="text-6xl font-bold text-gray-900">PANDA</h1>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-700 mb-4">
            Personalized AI for Notes, Discussion & Assistance
          </h2>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your classrooms, meetings, and presentations with AI-powered transcription, 
            smart Q&A, and automated task generation. Perfect for educators, managers, and presenters.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth?role=speaker">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                <Mic className="mr-2 h-5 w-5" />
                Join as Speaker
              </Button>
            </Link>
            <Link to="/auth?role=listener">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-4 text-lg border-blue-600 text-blue-600 hover:bg-blue-50">
                <Users className="mr-2 h-5 w-5" />
                Join as Listener
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Powerful Features for Modern Learning & Collaboration
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <Mic className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Live Transcription</CardTitle>
                <CardDescription>
                  Real-time speech-to-text with AI-powered accuracy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Capture every word automatically with intelligent voice recognition 
                  and instant transcript generation.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <MessageSquare className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Smart Q&A Assistant</CardTitle>
                <CardDescription>
                  AI chatbot answers questions from live content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Students and participants can ask questions about the session content 
                  and get instant AI-powered answers.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CheckSquare className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Auto Task Generation</CardTitle>
                <CardDescription>
                  Automatic checklists and action items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Generate actionable tasks and checklists automatically from 
                  session transcripts and discussions.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow-sm">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="text-gray-700 font-medium">
                AR Integration Ready • Resource Management • Multi-User Sessions
              </span>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Sessions?
          </h3>
          <p className="text-gray-600 mb-8">
            Get started with PANDA today and experience the future of interactive learning.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4">
              Get Started Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};