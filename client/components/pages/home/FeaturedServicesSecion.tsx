"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import { services, stats } from "@/constants/data";

const FeaturedServicesSection = () => {
  return (
    <div className="py-12 bg-babyshopWhite p-5 mt-5 rounded-md border">
      <div className="text-center mb-8">
        <Badge
          variant="outline"
          className="text-babyshopSky border-babyshopSky mb-4"
        >
          Why Choose Us
        </Badge>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          What Makes Us Special
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We&apos;re committed to providing the best experience for you and your
          baby
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {services.map((service, index) => (
          <Card
            key={index}
            className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-babyshopSky"
          >
            <CardContent className="p-6 text-center">
              <div
                className={`${service.bgColor} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
              >
                <div className={service.color}>{service.icon}</div>
              </div>
              <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
              <p className="text-gray-600 text-sm">{service.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-babyshopSky to-blue-600 rounded-2xl p-8 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center">
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold mb-1">
                {stat.number}
              </div>
              <div className="text-blue-100 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Ready to Start Shopping?
        </h3>
        <p className="text-gray-600 mb-6">
          Join thousands of happy parents who trust us with their baby&apos;s
          needs
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/shop">
            <Button
              size="lg"
              className="bg-babyshopSky hover:bg-babyshopSky/90 text-white"
            >
              Start Shopping
            </Button>
          </Link>
          <Link href="/about">
            <Button
              size="lg"
              variant="outline"
              className="hover:bg-babyshopSky hover:text-white hover:border-babyshopSky transition-colors"
            >
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeaturedServicesSection;