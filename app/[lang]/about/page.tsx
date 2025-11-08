import { Heart, Shield, Users, Clock, MapPin, Star, TrendingUp, Calendar } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-linear-to-br from-rose-500/10 via-pink-500/10 to-purple-500/10 border-b">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              About Zesty
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              The premier platform connecting people with authentic experiences
            </p>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-rose-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-10 md:px-6 2xl:max-w-[1400px]">
        {/* Statistics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 mb-16">
          <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm pt-0">
            <div className="px-6 pt-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">Active Members</p>
                </div>
                <div className="mt-1 flex items-center gap-x-2">
                  <h3 className="text-xl font-medium sm:text-2xl">12,500+</h3>
                  <span className="flex items-center gap-x-1 text-green-700 dark:text-green-400">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">Growing</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm pt-0">
            <div className="px-6 pt-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">Cities Covered</p>
                </div>
                <div className="mt-1 flex items-center gap-x-2">
                  <h3 className="text-xl font-medium sm:text-2xl">50+</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm pt-0">
            <div className="px-6 pt-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-muted-foreground" />
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">Average Rating</p>
                </div>
                <div className="mt-1 flex items-center gap-x-2">
                  <h3 className="text-xl font-medium sm:text-2xl">4.8/5.0</h3>
                  <span className="flex items-center gap-x-1 text-yellow-600 dark:text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm pt-0">
            <div className="px-6 pt-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">Monthly Bookings</p>
                </div>
                <div className="mt-1 flex items-center gap-x-2">
                  <h3 className="text-xl font-medium sm:text-2xl">8,400+</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Our Story Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Our Story</h2>
          <div className="prose prose-lg dark:prose-invert mx-auto">
            <p className="text-muted-foreground leading-relaxed mb-4">
              Zesty was founded with a simple mission: to create a safe, authentic, and inclusive platform 
              that connects people. We recognized the need for a trusted space where 
              individuals could discover genuine connections, exclusive content, and memorable experiences—whether 
              they're looking for dating, entertainment, or professional services.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Since our launch, we've grown into the most comprehensive lifestyle platform, offering 
              everything from a modern dating app and escort services to VIP content creators, live streaming, 
              social events, and job opportunities. Our commitment to safety, privacy, and authenticity 
              has made us the preferred choice for thousands of members across the country.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Today, Zesty serves over 12,000 active members in 50+ cities nationwide, facilitating meaningful 
              connections, supporting content creators, and empowering individuals to explore their interests 
              with confidence and discretion.
            </p>
          </div>
        </div>

        {/* Our Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-rose-500/10 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-semibold">Safety First</h3>
              <p className="text-muted-foreground">
                We prioritize the safety and security of all our members with verified profiles, 
                secure payments, and robust privacy controls.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-purple-500/10 rounded-2xl flex items-center justify-center">
                <Heart className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold">Authenticity</h3>
              <p className="text-muted-foreground">
                We promote genuine connections and authentic experiences by verifying profiles 
                and maintaining high standards for our community.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-pink-500/10 rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold">Inclusivity</h3>
              <p className="text-muted-foreground">
                We celebrate diversity and create a welcoming space for all individuals, 
                regardless of background, identity, or preferences.
              </p>
            </div>
          </div>
        </div>

        {/* What We Offer Section */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">What We Offer</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="bg-card border rounded-xl p-6 space-y-3">
              <h3 className="text-xl font-semibold">Dating Platform</h3>
              <p className="text-muted-foreground">
                Swipe to meet genuine people in your area. Our dating app helps you 
                discover meaningful connections, casual dates, or new friendships with verified profiles.
              </p>
            </div>

            <div className="bg-card border rounded-xl p-6 space-y-3">
              <h3 className="text-xl font-semibold">Escort Services</h3>
              <p className="text-muted-foreground">
                Browse verified escort profiles. Connect with professional companions 
                for dates, events, or private encounters with complete discretion and safety.
              </p>
            </div>

            <div className="bg-card border rounded-xl p-6 space-y-3">
              <h3 className="text-xl font-semibold">VIP Content</h3>
              <p className="text-muted-foreground">
                Subscribe to exclusive content from your favorite creators. Support independent creators 
                and access premium photos, videos, and personalized interactions.
              </p>
            </div>

            <div className="bg-card border rounded-xl p-6 space-y-3">
              <h3 className="text-xl font-semibold">Live Streaming</h3>
              <p className="text-muted-foreground">
                Watch live streams from creators in real-time. Interact, tip, and engage with performers 
                broadcasting from across the country.
              </p>
            </div>

            <div className="bg-card border rounded-xl p-6 space-y-3">
              <h3 className="text-xl font-semibold">Social Events</h3>
              <p className="text-muted-foreground">
                Discover and attend exclusive events, parties, and social gatherings. Connect with 
                like-minded individuals in your area.
              </p>
            </div>

            <div className="bg-card border rounded-xl p-6 space-y-3">
              <h3 className="text-xl font-semibold">Jobs & Opportunities</h3>
              <p className="text-muted-foreground">
                Find work opportunities in the adult industry. Studios post positions for performers, 
                escorts, and content creators.
              </p>
            </div>
          </div>
        </div>

        {/* Trust & Safety Section */}
        <div className="max-w-4xl mx-auto mb-16 bg-muted/30 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Trust & Safety</h2>
          <div className="space-y-4 text-muted-foreground">
            <p className="leading-relaxed">
              At Zesty, your safety and privacy are our top priorities. We employ industry-leading 
              security measures to protect your personal information and ensure a safe environment for all members.
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Profile verification and identity checks for service providers</li>
              <li>Secure payment processing with encrypted transactions</li>
              <li>24/7 customer support and moderation team</li>
              <li>Strict privacy controls and data protection</li>
              <li>Community guidelines and reporting system</li>
              <li>Age verification for all users (18+ only)</li>
            </ul>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
          <p className="text-muted-foreground mb-6">
            Have questions or feedback? We'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:support@zesty.hot" 
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}