import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../Layout/Main/Main";
import SignIn from "../Pages/Auth/SignIn/SignIn";
import ForgatePassword from "../Pages/Auth/ForgatePassword/ForgatePassword";
import PrivateRoute from "./PrivateRoute";
import Dashboard from "../Pages/Dashboard/Dashboard";
import VerifyCode from "../Pages/Auth/VerifyCode/VerifyCode";
import NewPass from "../Pages/Auth/NewPass/NewPass";
import SignUp from "../Pages/Auth/SignUp/SignUp";
import TeamMembers from "../Pages/TeamMembers/TeamMembers";
import TeamProfileView from "../Pages/TeamMembers/TeamProfileView";
import AiInsights from "../Pages/AiInsights/AiInsights";
import Settings from "../Pages/settings/Settings";
import Report from "../Pages/Report/Report";
import RiskAlerts from "../Pages/RiskAlerts/RiskAlerts";
import ActionHistory from "../Pages/RiskAlerts/ActionHistory";
import BurnoutRecommendations from "../Pages/Dashboard/BurnoutRecommendations";
import BurnoutRiskDetails from "../Pages/Dashboard/BurnoutRiskDetails";
import Organizations from "../Pages/Organizations/Organizations";
import Users from "../Pages/Users/Users";
import UsersDetails from "../Pages/Users/UsersDetails";
import AuditLogs from "../Pages/AuditLogs/AuditLogs";
import CompanyDashboard from "../Pages/CompanyDashboard/CompanyDashboard";

export const router = createBrowserRouter([
  {
    path: "/sign-in",
    element: <SignIn />,
  },
  {
    path: "/sign-up",
    element: <SignUp />,
  },
  {
    path: "/forgate-password",
    element: <ForgatePassword />,
  },
  {
    path: "/verify-code",
    element: <VerifyCode />,
  },
  {
    path: "/new-password",
    element: <NewPass />,
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          { path: "/", element: <Dashboard /> },
          { path: "/dashboard", element: <Dashboard /> },
          {
            path: "/dashboard/burnout-recommendations",
            element: <BurnoutRecommendations />,
          },
          {
            path: "/dashboard/burnout-risk-details",
            element: <BurnoutRiskDetails />,
          },
          { path: "/team-members", element: <TeamMembers /> },
          { path: "/team-profile", element: <TeamProfileView /> },
          { path: "/organization", element: <Organizations /> },
          { path: "/users", element: <Users /> },
          { path: "/user-details", element: <UsersDetails /> },
          { path: "/audit-logs", element: <AuditLogs /> },
          { path: "/ai-insights", element: <AiInsights /> },
          { path: "/company-dashboard", element: <CompanyDashboard /> },
          { path: "/report", element: <Report /> },
          { path: "/risk-alerts", element: <RiskAlerts /> },
          { path: "/action-history", element: <ActionHistory /> },
          { path: "/settings", element: <Settings /> },
        ],
      },
    ],
  },
]);
