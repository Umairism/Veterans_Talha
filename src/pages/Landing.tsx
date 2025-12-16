import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Heart, Users, Award, Calendar } from 'lucide-react';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-cream-50 to-teal-50">
      <nav className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Heart className="text-amber-600" size={36} />
            <h1 className="text-3xl font-serif font-bold text-gray-800">VeteranMeet</h1>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/register')}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-5xl md:text-6xl font-serif font-bold text-gray-800 mb-6 leading-tight">
            Connect Experience with Purpose
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
            A warm community where retired professionals find meaningful opportunities to serve, share wisdom, and stay engaged with their communities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          <div className="bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 border-4 border-amber-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-4 rounded-2xl">
                <Award size={32} />
              </div>
              <h3 className="text-3xl font-serif font-bold text-gray-800">For Veterans</h3>
            </div>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Share your lifetime of experience. Earn recognition for your service. Build connections with your community.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <div className="bg-amber-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                </div>
                <span className="text-gray-700 text-lg">Discover local service opportunities</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-amber-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                </div>
                <span className="text-gray-700 text-lg">Earn stars and climb the ranks</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-amber-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                </div>
                <span className="text-gray-700 text-lg">Connect with like-minded professionals</span>
              </li>
            </ul>
            <Button
              className="w-full"
              size="lg"
              onClick={() => navigate('/register?type=veteran')}
            >
              Join as a Veteran
            </Button>
          </div>

          <div className="bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 border-4 border-teal-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-4 rounded-2xl">
                <Users size={32} />
              </div>
              <h3 className="text-3xl font-serif font-bold text-gray-800">For Organizations</h3>
            </div>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Access a network of experienced professionals ready to contribute their skills and time to meaningful causes.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <div className="bg-teal-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                </div>
                <span className="text-gray-700 text-lg">Post community service events</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-teal-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                </div>
                <span className="text-gray-700 text-lg">Find skilled volunteers by interests</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-teal-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                </div>
                <span className="text-gray-700 text-lg">Build lasting partnerships</span>
              </li>
            </ul>
            <Button
              variant="secondary"
              className="w-full"
              size="lg"
              onClick={() => navigate('/register?type=organization')}
            >
              Join as an Organization
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-12 max-w-5xl mx-auto shadow-xl">
          <h3 className="text-4xl font-serif font-bold text-center text-gray-800 mb-12">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-amber-100 to-amber-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Calendar className="text-amber-700" size={36} />
              </div>
              <h4 className="text-2xl font-bold text-gray-800 mb-4">1. Find Events</h4>
              <p className="text-gray-600 text-lg leading-relaxed">
                Browse opportunities that match your interests and skills in your local area.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-teal-100 to-teal-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Heart className="text-teal-700" size={36} />
              </div>
              <h4 className="text-2xl font-bold text-gray-800 mb-4">2. Participate</h4>
              <p className="text-gray-600 text-lg leading-relaxed">
                Join events, contribute your expertise, and make a real difference.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-amber-100 to-amber-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Award className="text-amber-700" size={36} />
              </div>
              <h4 className="text-2xl font-bold text-gray-800 mb-4">3. Earn Recognition</h4>
              <p className="text-gray-600 text-lg leading-relaxed">
                Collect stars, climb ranks, and showcase your community impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-8 mt-20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-lg">Made with <Heart className="inline text-red-400" size={20} /> for our communities</p>
        </div>
      </footer>
    </div>
  );
}
