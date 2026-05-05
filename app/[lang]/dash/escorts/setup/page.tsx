"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Save, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { useSupabaseSession } from "@/lib/supabase/client";

const SERVICE_CATEGORIES = [
  { value: "MODELLING", label: "Modelling" },
  { value: "VIDEO_CHAT", label: "Video Chat" },
  { value: "MEET_AND_GREET", label: "Meet & Greet" },
  { value: "MASSAGE", label: "Massage" },
  { value: "IN_CALL", label: "In-Call" },
  { value: "OUT_CALL", label: "Out-Call" },
];

const EXTRA_TYPES = [
  { value: "FILMING", label: "Filming" },
  { value: "BJ", label: "BJ" },
  { value: "ANAL", label: "Anal" },
  { value: "BDSM", label: "BDSM" },
  { value: "NATURAL", label: "Natural" },
  { value: "EXTRA_PERSON", label: "Extra Person" },
  { value: "OUTSIDE_LOCATION", label: "Outside Location" },
  { value: "COSTUME", label: "Costume" },
  { value: "ROLEPLAY", label: "Roleplay" },
  { value: "TOY_USE", label: "Toy Use" },
  { value: "CREAMPIE", label: "Creampie" },
  { value: "GOLDEN_SHOWER", label: "Golden Shower" },
  { value: "LIVE_STREAM", label: "Live Stream" },
];

const DAYS = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
];

interface ServiceOption {
  durationMin: string;
  price: string;
}

interface Service {
  category: string;
  label: string;
  options: ServiceOption[];
}

interface Extra {
  name: string;
  price: string;
}

export default function CreateEscortAdPage() {
  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();
  const { data: session, status, user } = useSupabaseSession();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [services, setServices] = useState<Service[]>([
    { category: "IN_CALL", label: "", options: [{ durationMin: "60", price: "" }] }
  ]);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [daysAvailable, setDaysAvailable] = useState<string[]>([]);
  const [active, setActive] = useState(true);
  const [isFetchingExistingAd, setIsFetchingExistingAd] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchExistingAd();
    }
  }, [status]);

  const fetchExistingAd = async () => {
    setIsFetchingExistingAd(true);
    try {
      const response = await fetch("/api/escorts/my-ad");
      if (response.ok) {
        const { ad } = await response.json();
        if (ad) {
          setTitle(ad.title);
          setDescription(ad.description);
          setActive(ad.active);
          setDaysAvailable(ad.daysAvailable);
          
          // Map services
          if (ad.services && ad.services.length > 0) {
            setServices(ad.services.map((s: any) => ({
              category: s.category,
              label: s.label || "",
              options: s.options.map((o: any) => ({
                durationMin: o.durationMin.toString(),
                price: o.price.toString(),
              })),
            })));
          }
          
          // Map extras
          if (ad.extras && ad.extras.length > 0) {
            setExtras(ad.extras.map((e: any) => ({
              name: e.name,
              price: e.price.toString(),
            })));
          }
        }
      }
    } catch (error) {
      console.error("Error fetching ad:", error);
    } finally {
      setIsFetchingExistingAd(false);
    }
  };

  const addService = () => {
    // Find the first available category that hasn't been used
    const usedCategories = services.map(s => s.category);
    const availableCategory = SERVICE_CATEGORIES.find(
      cat => !usedCategories.includes(cat.value)
    );
    
    if (availableCategory) {
      setServices([...services, { 
        category: availableCategory.value, 
        label: "", 
        options: [{ durationMin: "60", price: "" }] 
      }]);
    }
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: keyof Service, value: any) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  // Get available categories for a specific service (excluding already used ones)
  const getAvailableCategories = (currentServiceIndex: number) => {
    const usedCategories = services
      .map((s, idx) => idx !== currentServiceIndex ? s.category : null)
      .filter(Boolean);
    return SERVICE_CATEGORIES.filter(cat => !usedCategories.includes(cat.value));
  };

  // Check if we can add more services
  const canAddMoreServices = () => {
    return services.length < SERVICE_CATEGORIES.length;
  };

  const addServiceOption = (serviceIndex: number) => {
    const updated = [...services];
    updated[serviceIndex].options.push({ durationMin: "60", price: "" });
    setServices(updated);
  };

  const removeServiceOption = (serviceIndex: number, optionIndex: number) => {
    const updated = [...services];
    updated[serviceIndex].options = updated[serviceIndex].options.filter((_, i) => i !== optionIndex);
    setServices(updated);
  };

  const updateServiceOption = (serviceIndex: number, optionIndex: number, field: keyof ServiceOption, value: string) => {
    const updated = [...services];
    updated[serviceIndex].options[optionIndex] = {
      ...updated[serviceIndex].options[optionIndex],
      [field]: value,
    };
    setServices(updated);
  };

  const addExtra = () => {
    setExtras([...extras, { name: "FILMING", price: "" }]);
  };

  const removeExtra = (index: number) => {
    setExtras(extras.filter((_, i) => i !== index));
  };

  const updateExtra = (index: number, field: keyof Extra, value: string) => {
    const updated = [...extras];
    updated[index] = { ...updated[index], [field]: value };
    setExtras(updated);
  };

  const toggleDay = (day: string) => {
    if (daysAvailable.includes(day)) {
      setDaysAvailable(daysAvailable.filter(d => d !== day));
    } else {
      setDaysAvailable([...daysAvailable, day]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/escorts/ad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          services,
          extras: extras.filter(e => e.price), // Only include extras with prices
          daysAvailable,
          active,
          acceptsGender: [], // Can be added later
          acceptsRace: [],
          acceptsBodyType: [],
          acceptsAgeRange: [18, 100],
        }),
      });

      if (response.ok) {
        router.push(`/${lang}/dash/escorts`);
        return;
      } else {
        alert("Failed to save ad. Please try again.");
      }
    } catch (error) {
      console.error("Error saving ad:", error);
      alert("Failed to save ad. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-16rem)] min-h-52">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/${lang}/dash/escorts`}>
                <Button variant="ghost" size="lg">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-3xl font-bold tracking-tight">
                Create/Edit Private Ad
              </h1>
            </div>
          </div>
        </div>
      </div>

      {isFetchingExistingAd && (
        <div className="flex items-center justify-center h-[calc(100vh-16rem)] min-h-52">
          <Spinner className="size-8 text-muted-foreground" />
        </div>
      )}

      {!isFetchingExistingAd && (
      <form onSubmit={handleSubmit} className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Basic Info */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Exclusive Escort Services"
                required
                maxLength={200}
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your services, personality, and what makes you unique..."
                required
                maxLength={3000}
                rows={6}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {description.length}/3000 characters
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Ad Status</Label>
                <p className="text-sm text-muted-foreground">
                  {active ? "Your ad is visible to potential clients" : "Your ad is hidden"}
                </p>
              </div>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>
          </div>
        </Card>

        {/* Services */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Services *</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Add one service for each type you offer
              </p>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addService}
              disabled={!canAddMoreServices()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </div>

          <div className="space-y-4">
            {services.map((service, sIdx) => (
              <Card key={sIdx} className="p-4 border-2">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium">Service {sIdx + 1}</h3>
                  {services.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeService(sIdx)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>Service Type</Label>
                    <select
                      className="w-full mt-1 p-2 border rounded-md"
                      value={service.category}
                      onChange={(e) => updateService(sIdx, "category", e.target.value)}
                    >
                      {getAvailableCategories(sIdx).map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Each service type can only be added once
                    </p>
                  </div>

                  <div>
                    <Label>Label (optional)</Label>
                    <Input
                      value={service.label}
                      onChange={(e) => updateService(sIdx, "label", e.target.value)}
                      placeholder="e.g., Sensual massage"
                    />
                  </div>

                  {/* Duration & Price Options */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Duration & Pricing</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addServiceOption(sIdx)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Option
                      </Button>
                    </div>

                    {service.options.map((option, oIdx) => (
                      <div key={oIdx} className="flex gap-2 mb-2">
                        <Input
                          type="number"
                          placeholder="Duration (min)"
                          value={option.durationMin}
                          onChange={(e) => updateServiceOption(sIdx, oIdx, "durationMin", e.target.value)}
                          className="flex-1"
                          required
                        />
                        <Input
                          type="number"
                          placeholder="Price ($)"
                          value={option.price}
                          onChange={(e) => updateServiceOption(sIdx, oIdx, "price", e.target.value)}
                          className="flex-1"
                          required
                        />
                        {service.options.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeServiceOption(sIdx, oIdx)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Extras */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Extra Services (Optional)</h2>
            <Button type="button" variant="outline" size="sm" onClick={addExtra}>
              <Plus className="w-4 h-4 mr-2" />
              Add Extra
            </Button>
          </div>

          {extras.length > 0 ? (
            <div className="space-y-2">
              {extras.map((extra, idx) => (
                <div key={idx} className="flex gap-2">
                  <select
                    className="flex-1 p-2 border rounded-md"
                    value={extra.name}
                    onChange={(e) => updateExtra(idx, "name", e.target.value)}
                  >
                    {EXTRA_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    placeholder="Price ($)"
                    value={extra.price}
                    onChange={(e) => updateExtra(idx, "price", e.target.value)}
                    className="w-32"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExtra(idx)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No extra services added. Click "Add Extra" to offer additional services.
            </p>
          )}
        </Card>

        {/* Availability */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Availability</h2>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(day => (
              <Badge
                key={day.value}
                variant={daysAvailable.includes(day.value) ? "default" : "outline"}
                className={"cursor-pointer px-4 py-2 " + (daysAvailable.includes(day.value) ? "bg-green-500/10 border border-green-500/20 text-black" : "bg-red-500/10 border text-black")}
                onClick={() => toggleDay(day.value)}
              >
                {day.label}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Submit */}
        <div className="flex gap-4 justify-end">
          <Link href={`/${lang}/dash/escorts`}>
            <Button type="button" variant="outline" size="lg">
              Cancel
            </Button>
          </Link>
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Ad
              </>
            )}
          </Button>
        </div>
      </form>
      )}
    </div>
  );
}
