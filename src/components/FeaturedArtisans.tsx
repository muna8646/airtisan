import React from 'react';
import { Star } from 'lucide-react';

const artisans = [
  {
    id: 1,
    name: 'Sarah Chen',
    craft: 'Ceramic Artist',
    rating: 4.9,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1556760544-74068565f05c?auto=format&fit=crop&q=80&w=400&h=400',
    featured: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 2,
    name: 'Marcus Wood',
    craft: 'Woodworker',
    rating: 4.8,
    reviews: 93,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=400',
    featured: 'https://images.unsplash.com/photo-1611486212557-88be5ff6f941?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 3,
    name: 'Emma Silver',
    craft: 'Jewelry Designer',
    rating: 5.0,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400',
    featured: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=400',
  }
];

export default function FeaturedArtisans() {
  return (
    <div className="py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Artisans</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {artisans.map((artisan) => (
          <div key={artisan.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-48">
              <img
                src={artisan.featured}
                alt={`${artisan.name}'s work`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <img
                  src={artisan.image}
                  alt={artisan.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{artisan.name}</h3>
                  <p className="text-sm text-gray-600">{artisan.craft}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="ml-1 text-sm font-medium text-gray-900">{artisan.rating}</span>
                <span className="ml-1 text-sm text-gray-500">({artisan.reviews} reviews)</span>
              </div>
              <button className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                Visit Shop
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}