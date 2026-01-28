import { useState } from 'react';
import { LogIn } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - no validation required
    onLogin();
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#016649' }}>
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="mb-2">Bank Appointment System</h1>
          <p className="text-gray-600">Sign in to schedule your appointment</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#74BE42' } as React.CSSProperties}
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#74BE42' } as React.CSSProperties}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 text-white rounded-lg transition-colors font-medium"
              style={{ backgroundColor: '#016649' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#014d37'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#016649'}
            >
              Sign In
            </button>
          </form>

          {/* Mock Login Notice */}
          <div className="mt-6 p-4 rounded-lg border" style={{ backgroundColor: '#ffd10020', borderColor: '#ffd100' }}>
            <p className="text-sm text-center" style={{ color: '#016649' }}>
              <strong>Demo Mode:</strong> Enter any username and password to continue
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>Need help? Contact support at (555) 123-4567</p>
        </div>
      </div>
    </div>
  );
}