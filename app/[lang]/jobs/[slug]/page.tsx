"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Briefcase,
  MapPin,
  Users,
  Clock,
  Loader2,
  ArrowLeft,
  Share2,
  DollarSign,
  Calendar,
  Star,
  Building2,
  Send,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface JobData {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: 'ACTOR' | 'DIRECTOR' | 'CAMERA_OPERATOR' | 'EDITOR' | 'PRODUCTION_STAFF' | 'MODEL' | 'OTHER';
  payAmount: number;
  payType: string;
  lengthHours: number | null;
  lengthDays: number | null;
  location: string | null;
  suburb: string | null;
  venue: string | null;
  startDate: Date | string;
  endDate?: Date | string | null;
  requirements: string | null;
  coverImage: string | null;
  status: 'OPEN' | 'CLOSED' | 'FILLED' | 'CANCELLED';
  maxApplicants: number | null;
  applicationCount: number;
  studio: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    logo: string | null;
    coverImage: string | null;
    location: string | null;
    suburb: string | null;
    website: string | null;
    verified: boolean;
    reviewCount: number;
    averageRating: number;
    wouldWorkAgainPercentage: number;
    reviews: StudioReview[];
  };
  userApplication: {
    id: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
    coverLetter: string | null;
    createdAt: Date | string;
  } | null;
  isStudioAdmin: boolean;
}

interface StudioReview {
  id: string;
  rating: number;
  comment: string | null;
  wouldWorkAgain: boolean;
  reviewer: {
    id: string;
    slug: string | null;
  };
  createdAt: Date | string;
}

export default function JobPage() {
  const { slug, lang } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [job, setJob] = useState<JobData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetchJobData();
  }, [slug]);

  const fetchJobData = async () => {
    try {
      const response = await fetch(`/api/jobs/${slug}`);
      
      if (response.ok) {
        const data = await response.json();
        setJob(data);
      } else if (response.status === 404) {
        router.push(`/${lang}/jobs`);
      }
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async () => {
    if (!session) {
      router.push(`/${lang}/auth/signin`);
      return;
    }

    setIsApplying(true);
    try {
      const response = await fetch(`/api/jobs/${slug}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverLetter }),
      });

      if (response.ok) {
        await fetchJobData(); // Refresh data
        setShowApplicationForm(false);
        setCoverLetter("");
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to apply');
      }
    } catch (error) {
      console.error('Error applying to job:', error);
      alert('Failed to apply to job');
    } finally {
      setIsApplying(false);
    }
  };

  const handleWithdraw = async () => {
    if (!confirm('Are you sure you want to withdraw your application?')) return;

    try {
      const response = await fetch(`/api/jobs/${slug}/apply`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchJobData();
      }
    } catch (error) {
      console.error('Error withdrawing application:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Job not found</h2>
          <p className="text-muted-foreground mb-6">
            This job doesn't exist or has been removed
          </p>
          <Link href={`/${lang}/jobs`}>
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const startDate = new Date(job.startDate);
  const endDate = job.endDate ? new Date(job.endDate) : null;
  const duration = job.lengthDays 
    ? `${job.lengthDays} day${job.lengthDays > 1 ? 's' : ''}`
    : job.lengthHours
    ? `${job.lengthHours} hour${job.lengthHours > 1 ? 's' : ''}`
    : 'TBD';

  const hasApplied = !!job.userApplication;
  const applicationStatus = job.userApplication?.status;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/${lang}/jobs`}>
              <Button variant="ghost" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr_350px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Cover Image */}
            {job.coverImage && (
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <img
                  src={job.coverImage}
                  alt={job.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Job Header */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <JobTypeBadge type={job.type} />
                <JobStatusBadge status={job.status} />
              </div>
              <h1 className="text-3xl font-bold mb-3">{job.title}</h1>
              
              {/* Studio */}
              <a target="_blank" href={`${job.studio.website || '#'}`} className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity">
                {job.studio.logo && (
                  <img src={job.studio.logo} alt={job.studio.name} className="w-12 h-12 rounded" />
                )}
                <div>
                  <p className="font-semibold text-lg">{job.studio.name}</p>
                  <div className="flex items-center gap-2">
                    {job.studio.verified && (
                      <Badge variant="secondary" className="h-5 text-xs bg-blue-500 text-white">
                        ✓ Verified
                      </Badge>
                    )}
                    {job.studio.reviewCount > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span>{job.studio.averageRating}</span>
                        <span className="text-muted-foreground">({job.studio.reviewCount})</span>
                      </div>
                    )}
                  </div>
                </div>
              </a>

              <p className="text-muted-foreground whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div className="border rounded-xl p-4 bg-card">
                <h3 className="font-semibold mb-2">Requirements</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {job.requirements}
                </p>
              </div>
            )}

            {/* Application Status */}
            {hasApplied && (
              <div className={`border rounded-xl p-4 ${
                applicationStatus === 'ACCEPTED' ? 'bg-green-50 border-green-200' :
                applicationStatus === 'REJECTED' ? 'bg-red-50 border-red-200' :
                applicationStatus === 'WITHDRAWN' ? 'bg-gray-50 border-gray-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start gap-3">
                  {applicationStatus === 'ACCEPTED' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : applicationStatus === 'REJECTED' ? (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  ) : (
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold mb-1">
                      {applicationStatus === 'ACCEPTED' ? 'Application Accepted!' :
                       applicationStatus === 'REJECTED' ? 'Application Not Successful' :
                       applicationStatus === 'WITHDRAWN' ? 'Application Withdrawn' :
                       'Application Submitted'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {applicationStatus === 'ACCEPTED' ? 'The studio has accepted your application. They should contact you soon.' :
                       applicationStatus === 'REJECTED' ? 'Unfortunately, the studio has decided to move forward with other candidates.' :
                       applicationStatus === 'WITHDRAWN' ? 'You have withdrawn your application for this job.' :
                       'Your application is being reviewed by the studio.'}
                    </p>
                    {applicationStatus === 'PENDING' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2"
                        onClick={handleWithdraw}
                      >
                        Withdraw Application
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Application Form */}
            {!hasApplied && job.status === 'OPEN' && !showApplicationForm && (
              <Button 
                onClick={() => setShowApplicationForm(true)}
                size="lg"
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                Apply for this Job
              </Button>
            )}

            {showApplicationForm && !hasApplied && (
              <div className="border rounded-xl p-6 bg-card space-y-4">
                <h3 className="font-semibold text-lg">Apply for this Position</h3>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Cover Letter (Optional)
                  </label>
                  <Textarea
                    placeholder="Tell the studio why you're a great fit for this role..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={6}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleApply}
                    disabled={isApplying}
                    className="flex-1"
                  >
                    {isApplying ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowApplicationForm(false);
                      setCoverLetter("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your profile information will be shared with the studio along with your application.
                </p>
              </div>
            )}

            {/* Studio Reviews */}
            {job.studio.reviews.length > 0 && (
              <div className="border rounded-xl p-6 bg-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Studio Reviews</h3>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold">{job.studio.averageRating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({job.studio.reviewCount} review{job.studio.reviewCount !== 1 ? 's' : ''})
                    </span>
                  </div>
                </div>

                {job.studio.wouldWorkAgainPercentage > 0 && (
                  <div className="mb-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <span className="font-semibold text-green-600">
                        {job.studio.wouldWorkAgainPercentage}%
                      </span>
                      {' '}of reviewers would work with this studio again
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {job.studio.reviews.map((review) => (
                    <div key={review.id} className="border-t pt-4 first:border-t-0 first:pt-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-yellow-500 text-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {review.comment}
                        </p>
                      )}
                      {review.wouldWorkAgain && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Would work again
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Details */}
            <div className="border rounded-xl p-4 bg-card space-y-4">
              <h3 className="font-semibold">Job Details</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Pay</p>
                    <p className="text-muted-foreground">
                      ${(job.payAmount / 100).toFixed(0)} ({job.payType})
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Duration</p>
                    <p className="text-muted-foreground">{duration}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Start Date</p>
                    <p className="text-muted-foreground">
                      {startDate.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {job.venue && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">Location</p>
                      <p className="text-muted-foreground">{job.venue}</p>
                      {job.suburb && (
                        <p className="text-muted-foreground">{job.suburb}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Applicants</p>
                    <p className="text-muted-foreground">
                      {job.applicationCount} applicant{job.applicationCount !== 1 ? 's' : ''}
                      {job.maxApplicants && ` / ${job.maxApplicants} max`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Studio Info */}
            <div className="border rounded-xl p-4 bg-card">
              <h3 className="font-semibold mb-3">About the Studio</h3>
              <a href={`${job.studio.website || '#'}`} target="_blank" className="block hover:opacity-80 transition-opacity">
                {job.studio.coverImage && (
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                    <img
                      src={job.studio.coverImage}
                      alt={job.studio.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-3 mb-2">
                  {job.studio.logo && (
                    <img src={job.studio.logo} alt={job.studio.name} className="w-10 h-10 rounded" />
                  )}
                  <div>
                    <p className="font-semibold">{job.studio.name}</p>
                    {job.studio.verified && (
                      <Badge variant="secondary" className="h-5 text-xs bg-blue-500 text-white">
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                </div>
                {job.studio.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {job.studio.description}
                  </p>
                )}
                {job.studio.website && (
                  <p className="text-sm text-primary mt-2 hover:underline">
                    Visit website →
                  </p>
                )}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function JobTypeBadge({ type }: { type: string }) {
  const badges: Record<string, React.ReactNode> = {
    ACTOR: <Badge className="bg-purple-600 hover:bg-purple-700">Actor</Badge>,
    DIRECTOR: <Badge className="bg-orange-600 hover:bg-orange-700">Director</Badge>,
    CAMERA_OPERATOR: <Badge className="bg-blue-600 hover:bg-blue-700">Camera Operator</Badge>,
    EDITOR: <Badge className="bg-green-600 hover:bg-green-700">Editor</Badge>,
    PRODUCTION_STAFF: <Badge className="bg-yellow-600 hover:bg-yellow-700">Production Staff</Badge>,
    MODEL: <Badge className="bg-pink-600 hover:bg-pink-700">Model</Badge>,
    OTHER: <Badge className="bg-gray-600 hover:bg-gray-700">Other</Badge>,
  };

  return badges[type] || null;
}

function JobStatusBadge({ status }: { status: string }) {
  const badges: Record<string, React.ReactNode> = {
    OPEN: <Badge className="bg-green-600 hover:bg-green-700">Open</Badge>,
    CLOSED: <Badge className="bg-gray-600 hover:bg-gray-700">Closed</Badge>,
    FILLED: <Badge className="bg-blue-600 hover:bg-blue-700">Filled</Badge>,
    CANCELLED: <Badge className="bg-red-600 hover:bg-red-700">Cancelled</Badge>,
  };
  
  return badges[status] || null;
}
