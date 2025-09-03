import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CompanyProfile from "../companies/CompanyProfile";
import { Loader2 } from "lucide-react";

// Mock data - In a real app, this would come from an API
const mockCompany = {
  id: "1",
  name: "Ocean Cleanup Brasil",
  type: "ngo" as const,
  logo: "/logo.png",
  coverImage: "/cover.jpg",
  status: "active" as const,
  category: "ocean_cleanup",
  description: "Dedicated to removing plastic waste from Brazilian coastlines and educating communities about ocean conservation.",
  mission: "Our mission is to remove 1 million tons of plastic from Brazilian oceans by 2030 while educating 100,000 students about marine conservation.",
  impact: "We have already removed 50 tons of plastic, rescued 200+ marine animals, and educated 5,000 students in coastal communities.",
  presentation: "# Welcome to Ocean Cleanup Brasil\n\n## Our Story\n\nWe started in 2020 with a simple mission: clean our oceans, one beach at a time...\n\n## Our Impact\n\n- **50 tons** of plastic removed\n- **200+** marine animals rescued\n- **5,000** students educated\n\n## Join Us\n\nTogether, we can make a difference!",
  website: "https://oceancleanup.br",
  email: "contact@oceancleanup.br",
  phone: "+55 11 98765-4321",
  address: "Av. Paulista, 1000",
  city: "São Paulo",
  state: "SP",
  country: "Brasil",
  createdAt: new Date(2023, 0, 15),
  approvedAt: new Date(2023, 1, 15),
  votes: {
    yes: 450,
    no: 50,
    total: 500
  },
  documents: [
    {
      id: "1",
      name: "Estatuto Social",
      type: "application/pdf",
      url: "/docs/estatuto.pdf",
      uploadedAt: new Date(2023, 0, 10),
      category: "legal",
      isPublic: true
    },
    {
      id: "2",
      name: "Relatório Anual 2023",
      type: "application/pdf",
      url: "/docs/relatorio2023.pdf",
      uploadedAt: new Date(2024, 0, 15),
      category: "reports",
      isPublic: true
    }
  ],
  stats: {
    followers: 12500,
    posts: 145,
    donations: 450000
  },
  isOwner: false, // This would be determined by auth
  isFollowing: false,
  hasVoted: false
};

const mockPendingCompany = {
  ...mockCompany,
  id: "2",
  name: "Marine Tech Solutions",
  status: "pending" as const,
  approvedAt: undefined,
  votingEndsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
  votes: {
    yes: 234,
    no: 56,
    total: 290
  }
};

export function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Mock: return pending company for id "2", active for others
      if (id === "2") {
        setCompany(mockPendingCompany);
      } else {
        setCompany({ ...mockCompany, id });
      }
      setLoading(false);
    }, 500);
  }, [id]);

  const handleUpdate = async (presentation: string) => {
    console.log("Updating presentation:", presentation);
    // API call to update presentation
    setCompany((prev: any) => ({ ...prev, presentation }));
  };

  const handleVote = async (vote: "yes" | "no") => {
    console.log("Voting:", vote);
    // API call to submit vote
    setCompany((prev: any) => ({
      ...prev,
      hasVoted: true,
      userVote: vote,
      votes: {
        ...prev.votes,
        [vote]: prev.votes[vote] + 1,
        total: prev.votes.total + 1
      }
    }));
  };

  const handleFollow = async () => {
    console.log("Toggle follow");
    // API call to follow/unfollow
    setCompany((prev: any) => ({
      ...prev,
      isFollowing: !prev.isFollowing,
      stats: {
        ...prev.stats,
        followers: prev.isFollowing 
          ? prev.stats.followers - 1 
          : prev.stats.followers + 1
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {t("companies.notFound.title", "Organization not found")}
        </h2>
        <p className="mt-2 text-gray-600">
          {t("companies.notFound.subtitle", "The organization you're looking for doesn't exist.")}
        </p>
        <button
          onClick={() => navigate("/companies")}
          className="mt-4 text-blue-600 hover:underline"
        >
          {t("companies.notFound.back", "Back to organizations")}
        </button>
      </div>
    );
  }

  return (
    <CompanyProfile
      company={company}
      onUpdate={handleUpdate}
      onVote={handleVote}
      onFollow={handleFollow}
    />
  );
}