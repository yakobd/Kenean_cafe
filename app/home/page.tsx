'use client';

import { Coffee, Heart, Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const staffPicks = [
    {
      id: '2',
      name: 'Cappuccino',
      description: 'Our signature blend',
      image:
        'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop',
      badge: 'Most Popular',
    },
    {
      id: '8',
      name: 'Croissant',
      description: 'Freshly baked daily',
      image:
        'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop',
      badge: 'Chef\'s Choice',
    },
    {
      id: '5',
      name: 'Avocado Toast',
      description: 'Healthy & delicious',
      image:
        'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=400&h=400&fit=crop',
      badge: 'Trending',
    },
  ];

  return (
    <main className="min-h-screen pb-24">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&h=800&fit=crop"
          alt="ከነአን Café Interior"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal/40 to-cream" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <Coffee className="text-gold mb-4 animate-pulse" size={48} strokeWidth={1.5} />
          <h1 className="text-6xl md:text-7xl font-serif text-white mb-4 tracking-wide drop-shadow-lg">
            ከነአን
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-md">
            Where tradition meets excellence
          </p>
          <Link
            href="/"
            className="bg-gold text-white px-8 py-3 rounded-full font-semibold hover:bg-gold/90 transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl flex items-center gap-2"
          >
            Explore Menu
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif text-charcoal mb-4">Our Story</h2>
          <div className="w-20 h-1 bg-gold mx-auto mb-6" />
          <p className="text-lg text-charcoal/70 leading-relaxed max-w-2xl mx-auto">
            ከነአን Café was born from a passion for bringing people together over
            exceptional coffee and food. Every cup we serve, every dish we
            prepare, is crafted with care and dedication to quality.
          </p>
        </div>

        {/* Values */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: Coffee,
              title: 'Quality First',
              description: 'We source the finest beans and ingredients',
            },
            {
              icon: Heart,
              title: 'Made with Love',
              description: 'Every item is prepared with passion and care',
            },
            {
              icon: Award,
              title: 'Excellence',
              description: 'Committed to delivering the best experience',
            },
          ].map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <Icon className="text-gold mx-auto mb-4" size={40} strokeWidth={1.5} />
                <h3 className="text-xl font-semibold text-charcoal mb-2">
                  {value.title}
                </h3>
                <p className="text-charcoal/60">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Staff Picks Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif text-charcoal mb-4">
              Staff Picks
            </h2>
            <p className="text-charcoal/60">
              Our team's favorite items, handpicked just for you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {staffPicks.map((item, index) => (
              <Link
                key={item.id}
                href="/"
                className="group"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                <div className="bg-cream rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-gold text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {item.badge}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-semibold text-charcoal mb-2">
                      {item.name}
                    </h3>
                    <p className="text-charcoal/60 mb-4">{item.description}</p>
                    <div className="flex items-center text-gold font-semibold group-hover:gap-2 transition-all">
                      Order Now
                      <ArrowRight
                        size={18}
                        className="ml-1 group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-serif text-charcoal mb-4">
          Ready to Experience ከነአን?
        </h2>
        <p className="text-charcoal/60 mb-8">
          Start your journey with us today
        </p>
        <Link
          href="/"
          className="inline-block bg-charcoal text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-charcoal/90 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
        >
          View Full Menu
        </Link>
      </div>
    </main>
  );
}
