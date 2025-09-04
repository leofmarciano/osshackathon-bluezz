import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@clerk/clerk-react";
import CompanyProfile from "../companies/CompanyProfile";
import { Loader2 } from "lucide-react";
import { useBackend } from "../../lib/useBackend";

export function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userId } = useAuth();
  const backend = useBackend();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [userVote, setUserVote] = useState<any>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const companyId = parseInt(id, 10);
        
        // Check if ID is valid
        if (isNaN(companyId)) {
          console.error('Invalid company ID:', id);
          setCompany(null);
          setLoading(false);
          return;
        }
        
        console.log('Fetching company with ID:', companyId);
        
        // Fetch company data - pass just the ID number
        const response = await backend.companies.getCompany(companyId);
        
        // Transform data to match the expected format
        const transformedCompany = {
          ...response.company,
          logo: response.profile?.logo_url || `https://picsum.photos/150/150?random=${companyId}`,
          presentation: response.profile?.presentation || '',
          stats: response.profile?.statistics || {
            followers: 0,
            posts: 0,
            donations: 0
          },
          documents: response.documents?.map(doc => ({
            id: doc.id.toString(),
            name: doc.file_name,
            type: doc.mime_type || 'application/pdf',
            url: doc.file_url,
            uploadedAt: new Date(doc.uploaded_at),
            category: doc.document_type,
            isPublic: true
          })) || [],
          votes: {
            yes: response.company.votes_yes || 0,
            no: response.company.votes_no || 0,
            total: (response.company.votes_yes || 0) + (response.company.votes_no || 0)
          },
          isOwner: userId === response.company.owner_id,
          isFollowing: false, // TODO: implement following
          hasVoted: false,
          votingEndsAt: response.company.voting_end_date ? new Date(response.company.voting_end_date) : undefined,
          createdAt: new Date(response.company.created_at),
          approvedAt: response.company.approved_at ? new Date(response.company.approved_at) : undefined
        };
        
        setCompany(transformedCompany);
        
        // TODO: Check if user has voted (if company is pending)
        // Endpoint getUserVote needs to be implemented in backend
        // if (response.company.status === 'pending' && userId) {
        //   try {
        //     const voteResponse = await backend.companies.getUserVote({ company_id: companyId });
        //     if (voteResponse.vote) {
        //       setUserVote(voteResponse.vote.vote_type);
        //       setCompany(prev => ({ ...prev, hasVoted: true, userVote: voteResponse.vote.vote_type }));
        //     }
        //   } catch (error) {
        //     // User hasn't voted yet
        //     console.log('User has not voted yet');
        //   }
        // }
      } catch (error) {
        console.error('Error fetching company:', error);
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id, userId]);

  const handleUpdate = async (data: any) => {
    if (!id) return;
    
    try {
      const companyId = parseInt(id, 10);
      // updateCompany expects id as first param, then the data
      await backend.companies.updateCompany(companyId, data);
      
      // Update local state
      setCompany((prev: any) => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Error updating company:', error);
      // TODO: Show error toast
    }
  };

  const handleVote = async (vote: "yes" | "no") => {
    if (!id) return;
    
    try {
      const companyId = parseInt(id, 10);
      // voteOnCompany expects company_id as first param, then the vote data
      await backend.companies.voteOnCompany(companyId, {
        vote_type: vote
      });
      
      // Update local state
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
      setUserVote(vote);
    } catch (error) {
      console.error('Error voting:', error);
      // TODO: Show error toast
    }
  };

  const handleFollow = async () => {
    // TODO: Implement follow/unfollow functionality
    console.log("Follow functionality not yet implemented");
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
      isAuthenticated={!!userId}
    />
  );
}