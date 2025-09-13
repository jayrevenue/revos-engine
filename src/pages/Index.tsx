import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { TrendingUp, ArrowRight } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center px-8">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white"></div>
      
      {/* Main content container */}
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        
        {/* Simple icon */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Clean typography */}
        <h1 className="text-5xl md:text-6xl font-light text-slate-900 mb-6 tracking-tight">
          Chief Revenue
          <br />
          <span className="font-normal">Science</span>
        </h1>
        
        {/* Simple subtitle */}
        <p className="text-lg text-slate-600 mb-12 leading-relaxed max-w-lg mx-auto">
          Data-driven revenue optimization platform for modern businesses
        </p>

        {/* Minimal CTA button */}
        <button
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => navigate('/auth')}
          className="group inline-flex items-center px-8 py-4 bg-slate-900 text-white rounded-lg font-medium transition-all duration-200 hover:bg-slate-800 hover:shadow-lg"
        >
          <span>Get Started</span>
          <ArrowRight 
            className={`w-4 h-4 ml-2 transition-transform duration-200 ${
              isHovered ? 'translate-x-1' : ''
            }`} 
          />
        </button>

        {/* Clean stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 pt-8 border-t border-slate-200">
          {[
            { value: "500+", label: "Companies" },
            { value: "$2.3B", label: "Revenue" },
            { value: "94%", label: "Growth" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-semibold text-slate-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-slate-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
