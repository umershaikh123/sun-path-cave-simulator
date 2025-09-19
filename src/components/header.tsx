import { Sun, Mountain } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="relative p-2 border border-gray-200 rounded-lg">
              <Sun className="h-6 w-6 text-black" />
              <Mountain className="h-3 w-3 text-black absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">
                Sun-Path + Cave Geometry Simulator
              </h1>
              <p className="text-gray-600">
                Exploring solar trajectories inspired by Surah Al-Kahf (18:17-18)
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <blockquote className="text-gray-700 leading-relaxed italic">
            "And you would have seen the sun, when it rose, inclining away from their cave to the right,
            and when it set, declining away from them to the left, while they lay in its open space…
            That is one of the signs of Allah."
          </blockquote>
          <cite className="text-gray-500 mt-2 block text-sm">— Qur'an 18:17</cite>
        </div>
      </div>
    </header>
  );
}