import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../lib/api";
import MemberDetailContent from "../../Components/MemberDetails/MemberDetailContent";
import { ErrorState, FullPageLoadingState } from "../../Components/App/AsyncState";
import { getDashboardPath, getDashboardPrefix } from "../../lib/auth";
import { useRefetchAwareLoading } from "../../lib/useRefetchAwareLoading";

function getActionRiskKey(primaryRiskSignal) {
  const key = primaryRiskSignal?.key;
  if (!key || key === "none" || key === "sleep") {
    return "other";
  }
  return key;
}

export default function UsersDetails() {
  const [params] = useSearchParams();
  const userId = params.get("userId");
  const company = params.get("company") || undefined;
  const source = params.get("source") || undefined;
  const range = params.get("range") || "30d";
  const startDate = params.get("start_date") || undefined;
  const endDate = params.get("end_date") || undefined;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const { loading, isRefreshing, beginLoading, finishLoading } = useRefetchAwareLoading();

  const isCompanyDrilldownView =
    getDashboardPrefix() === "superadmin" &&
    Boolean(company) &&
    source === "company-dashboard";

  const fetchUserDetails = useCallback(async () => {
    if (!userId) {
      return;
    }

    beginLoading();
    try {
      setError(null);
      const endpoint = isCompanyDrilldownView
        ? `/dashboard/superadmin/organizations/${encodeURIComponent(company)}/members/${userId}`
        : `${getDashboardPath("members")}/${userId}`;
      const response = await api.get(endpoint, {
        params: {
          company,
          range,
          start_date: startDate,
          end_date: endDate,
        },
      });
      setData(response.data.data);
      finishLoading(true);
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError("Failed to load user details.");
      finishLoading(false);
    }
  }, [
    beginLoading,
    company,
    endDate,
    finishLoading,
    isCompanyDrilldownView,
    range,
    startDate,
    userId,
  ]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const handleSubmitAction = useCallback(
    async ({ action, note, selectedFromRecommended }) => {
      if (!data) {
        return null;
      }

      setIsSubmittingAction(true);
      try {
        const response = await api.post(
          getDashboardPath("actions"),
          {
            action,
            note: note || undefined,
            selected_from_recommended: selectedFromRecommended,
            risk_key: getActionRiskKey(data.primary_risk_signal),
            department: data.member_summary?.department || undefined,
            team: data.member_summary?.team || undefined,
          },
          {
            params: company ? { company } : undefined,
          }
        );
        const createdAction = response.data.data;
        setData((previous) =>
          previous
            ? {
                ...previous,
                leadership_action_log: [
                  createdAction,
                  ...(previous.leadership_action_log || []),
                ].slice(0, 5),
              }
            : previous
        );
        return createdAction;
      } finally {
        setIsSubmittingAction(false);
      }
    },
    [company, data]
  );

  if (loading && !data) {
    return <FullPageLoadingState label="Loading User Details..." />;
  }

  if (!userId) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-20">
        <div className="w-full max-w-xl px-6">
          <ErrorState message="User ID not found." />
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-20">
        <div className="w-full max-w-xl px-6">
          <ErrorState message={error} onRetry={fetchUserDetails} />
        </div>
      </div>
    );
  }

  return (
    <MemberDetailContent
      data={data}
      isRefreshing={isRefreshing}
      refreshingLabel="Updating user details..."
      onSubmitAction={data?.read_only ? undefined : handleSubmitAction}
      isSubmittingAction={isSubmittingAction}
    />
  );
}
