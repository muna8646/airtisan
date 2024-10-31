import React from 'react';
import { Palette, Gem, Scissors, Coffee, Shirt, Camera } from 'lucide-react';

const categories = [
  { name: 'Art & Paintings', icon: Palette, count: 245 },
  { name: 'Jewelry', icon: Gem, count: 189 },
  { name: 'Crafts', icon: Scissors, count: 324 },
  { name: 'Home & Living', icon: Coffee, count: 156 },
  { name: 'Fashion', icon: Shirt, count: 278 },
  { name: 'Photography', icon: Camera, count: 143 },
];

export default function Categories() {
  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <div
              key={category.name}
              className="relative group bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex flex-col items-center text-center">
                <category.icon className="h-8 w-8 text-indigo-600 mb-3" />
                <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                <p className="mt-1 text-xs text-gray-500">{category.count} items</p>
              </div>
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-200 group-hover:ring-indigo-600 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}