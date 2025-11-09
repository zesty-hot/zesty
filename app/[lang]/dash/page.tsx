"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Camera, 
  Sparkles, 
  TvMinimalPlay, 
  Calendar, 
  Briefcase, 
  Heart, 
  Settings,
  ArrowRight,
  Coffee,
  CreditCard
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const dashboardOptions = [
  {
    title: "Post a Private Ad",
    description: "Create, edit, or manage your escort profile and advertisements",
    icon: Coffee,
    href: "/dash/escorts",
    color: "from-rose-500 to-pink-500",
  },
  {
    title: "Join a Studio or Post a Job",
    description: "Manage studio applications, job postings, and recruitment",
    icon: Briefcase,
    href: "/dash/jobs",
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Go Live",
    description: "Set up and manage your live streaming page and sessions",
    icon: TvMinimalPlay,
    href: "/dash/live",
    color: "from-purple-500 to-indigo-500",
  },
  {
    title: "Start a Fans Only Page",
    description: "Create and manage your VIP content subscription page",
    icon: Camera,
    href: "/dash/vip",
    color: "from-orange-500 to-amber-500",
  },
  {
    title: "Make an Event",
    description: "Create and organize events for your community",
    icon: Calendar,
    href: "/dash/events",
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Get Started with Dating",
    description: "Set up your dating profile and find your match",
    icon: Heart,
    href: "/dash/dating",
    color: "from-red-500 to-rose-500",
  },
];

export default function DashboardPage() {
  const { lang } = useParams<{ lang: string }>();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Welcome! Choose an option below to get started
              </p>
            </div>
            <div className="flex gap-3">
              <Link href={`/${lang}/dash/billing`}>
                <Button variant="outline" size="lg">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Billing
                </Button>
              </Link>
              <Link href={`/${lang}/dash/settings`}>
                <Button variant="outline" size="lg">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Link key={option.href} href={`/${lang}${option.href}`}>
                <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg cursor-pointer h-full">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <div className="relative p-6 flex flex-col h-full">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {option.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {option.description}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center justify-end mt-4">
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats or Tips Section */}
        <div className="mt-12 p-6 rounded-lg border bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-start gap-4">
            <Sparkles className="w-6 h-6 text-primary shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Getting Started Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Complete your profile to increase visibility across all pages</li>
                <li>• Upload quality photos and verify your account for better engagement</li>
                <li>• Each page can be managed independently and toggled on or off</li>
                <li>• Check your messages regularly to respond to inquiries</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
