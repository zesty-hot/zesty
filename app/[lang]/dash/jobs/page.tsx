"use client";

import { redirect, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Briefcase, Building, FileText, Users, ChevronDown, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Menu, MenuTrigger, MenuPopup, MenuItem } from "@/components/ui/menu";
import { useSession } from "next-auth/react";
import { Spinner } from "@/components/ui/spinner";

export default function JobsManagementPage() {
  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [studios, setStudios] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    if (status === "authenticated") {
      setLoading(false);
      // TODO: Fetch studios and applications
    } else {
      setLoading(false);
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-16rem)] min-h-52">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect(`/${lang}`);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href={`/${lang}/dash`}>
              <Button variant="ghost" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Briefcase className="w-8 h-8 text-blue-500" />
                Studios & Jobs
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your studios, job postings, and applications
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="studios" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="studios">My Studios</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          {/* My Studios Tab */}
          <TabsContent value="studios" className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Your Studios</h2>
              <Menu>
                <MenuTrigger render={<Button>
                    <Building className="w-4 h-4 mr-2" />
                    Studio Options
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>}>
                </MenuTrigger>
                <MenuPopup>
                  <Link href={`/${lang}/jobs/create-studio`}>
                    <MenuItem className="cursor-pointer">
                      <Building className="w-4 h-4 mr-2" />
                      Create Studio
                    </MenuItem>
                  </Link>
                  <Link href={`/${lang}/jobs/join-studio`}>
                    <MenuItem className="cursor-pointer">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Join Studio as Staff
                    </MenuItem>
                  </Link>
                </MenuPopup>
              </Menu>
            </div>

            {studios.length === 0 ? (
              <Card className="p-12 text-center">
                <Building className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">No Studios Yet</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  You haven't created any studios yet. Create a studio to start posting job opportunities and building your team.
                </p>
                <div className="flex gap-3 justify-center">
                  <Link href={`/${lang}/jobs/create-studio`}>
                    <Button size="lg">
                      <Building className="w-4 h-4 mr-2" />
                      Create Studio
                    </Button>
                  </Link>
                  <Link href={`/${lang}/jobs/join-studio`}>
                    <Button size="lg" variant="outline">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Join Studio
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4">
                {studios.map((studio) => (
                  <Card key={studio.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{studio.name}</h3>
                        <p className="text-muted-foreground mb-3">{studio.description}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>👥 {studio.memberCount || 0} members</span>
                          <span>📋 {studio.jobCount || 0} active jobs</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/${lang}/jobs/studio/${studio.id}/manage`}>
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-2" />
                            Manage
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            <h2 className="text-2xl font-semibold mb-6">Your Applications</h2>

            {applications.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">No Applications</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  You haven't applied to any jobs yet. Browse available opportunities in the jobs section.
                </p>
                <Link href={`/${lang}/jobs`}>
                  <Button size="lg">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Browse Jobs
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="grid gap-4">
                {applications.map((app) => (
                  <Card key={app.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{app.job.title}</h3>
                        <p className="text-muted-foreground mb-3">{app.studio.name}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>📅 Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                          <span className={`font-medium ${
                            app.status === 'ACCEPTED' ? 'text-green-500' :
                            app.status === 'REJECTED' ? 'text-red-500' :
                            'text-yellow-500'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Tips */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-blue-500/5 to-cyan-500/10 border-blue-500/20">
          <h3 className="font-semibold text-lg mb-3">Studio Management Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Create clear job descriptions with specific requirements</li>
            <li>✓ Set competitive compensation to attract quality talent</li>
            <li>✓ Respond to applications promptly to maintain professionalism</li>
            <li>✓ Build a strong studio profile with testimonials and portfolio</li>
            <li>✓ Keep your team updated with regular communication</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
