import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { apiService } from '../services/api';

interface HomePageProps {
  onGetStarted: () => void;
}

export function HomePage({ onGetStarted }: HomePageProps) {
  const [topics, setTopics] = useState<{ id: string; name: string; description: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTopics = async () => {
      try {
        setLoading(true);
        const data = await apiService.getTopics();
        setTopics(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Unable to load topics right now.');
      } finally {
        setLoading(false);
      }
    };

    loadTopics();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{ backgroundColor: '#016649' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <div className="text-center">
            <h1 className="mb-4 text-white font-semibold" style={{ fontSize: '45px' }}>
              Welcome to Our Bank
            </h1>
            <p className="mb-6 text-white text-base md:text-lg max-w-xl mx-auto">
              Schedule appointments with our branch representatives quickly and easily.
              Book your visit online and skip the wait.
            </p>
            <button
              onClick={onGetStarted}
              className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium transition-all shadow-lg hover:shadow-xl"
              style={{ backgroundColor: '#ffd100', color: '#016649' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e6bc00';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffd100';
              }}
            >
              Get Started
            </button>
          </div>
        </div>
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0" style={{ transform: 'translateY(1px)' }}>
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <h2 className="text-center mb-10 text-sm font-medium" style={{ color: '#6b7280' }}>
          Why Book With Us?
        </h2>
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"
          style={{ rowGap: '3rem' }}
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#74BE42' }}>
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h3 className="mb-2 text-sm font-semibold" style={{ color: '#016649' }}>Easy Scheduling</h3>
            <p className="text-gray-600 text-xs leading-relaxed">
              Book appointments online at your convenience, 24/7
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#00B6E2' }}>
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h3 className="mb-2 text-sm font-semibold" style={{ color: '#016649' }}>Save Time</h3>
            <p className="text-gray-600 text-xs leading-relaxed">
              Skip the wait with pre-scheduled appointments
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#ffd100' }}>
              <MapPin className="w-8 h-8" style={{ color: '#016649' }} />
            </div>
            <h3 className="mb-2 text-sm font-semibold" style={{ color: '#016649' }}>Multiple Locations</h3>
            <p className="text-gray-600 text-xs leading-relaxed">
              Choose from our convenient branch locations
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#016649' }}>
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="mb-2 text-sm font-semibold" style={{ color: '#016649' }}>Expert Service</h3>
            <p className="text-gray-600 text-xs leading-relaxed">
              Meet with qualified representatives for all your banking needs
            </p>
          </div>
        </div>
      </div>

      <div className="h-10" />

      {/* Services Section */}
      <div className="pt-20" style={{ backgroundColor: '#ffffff', paddingBottom: '16px' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10">
          <h2 className="text-center mb-12 text-lg font-medium" style={{ color: '#016649', paddingBottom: '10px' }}>
            Available Services
          </h2>
          {loading ? (
            <div className="text-center text-gray-500 text-sm">Loading services...</div>
          ) : error ? (
            <div className="text-center text-red-600 text-sm">{error}</div>
          ) : (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto"
              style={{ rowGap: '16px', columnGap: '16px' }}
            >
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className="p-8 shadow-lg border border-gray-200"
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '28px',
                    boxShadow: '0 6px 14px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                  }}
                >
                  <h3 className="mb-3 text-lg font-medium" style={{ color: '#016649' }}>
                    {topic.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {topic.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA + Footer Wave */}
      <div className="relative overflow-hidden" style={{ backgroundColor: '#016649' }}>
        <div className="absolute top-0 left-0 right-0" style={{ transform: 'rotate(180deg) translateY(9px)' }}>
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ height: '120px' }}>
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="#ffffff"/>
          </svg>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
          <div className="text-center">
            <h2 className="mb-4 text-sm font-medium text-white">
              Ready to Get Started?
            </h2>
            <div style={{ marginTop: '-6px', marginBottom: '16px' }}>
              <button
                onClick={onGetStarted}
                className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium transition-all shadow-lg hover:shadow-xl"
                style={{ backgroundColor: '#ffd100', color: '#016649' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e6bc00';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffd100';
                }}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <p className="text-center text-white text-xs">
            © 2026 Bank Appointment System. UCM Spring 2026 Project.
          </p>
        </div>
      </div>
    </div>
  );
}
