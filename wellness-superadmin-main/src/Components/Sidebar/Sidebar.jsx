import { FiLogOut } from "react-icons/fi";
import { BiChevronDown } from "react-icons/bi";
import { Link, useLocation } from "react-router-dom";
import brandlogo from "../../assets/image/dwslogo.png";

import {
  AlignCenterVertical,
  ChartColumnIncreasing,
  Crown,
  Settings,
  Users,
  FileText,
  AlertTriangle,
} from "lucide-react";

import { BsBadgeAd } from "react-icons/bs";
import { RiDashboardHorizontalLine } from "react-icons/ri";
import { IoIosArrowDown } from "react-icons/io";

const Sidebar = ({ closeDrawer }) => {
  const location = useLocation();
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const rawRole = (userData.role || "").trim().toLowerCase();

  const isSuperAdmin = 
    rawRole === "superadmin" || 
    rawRole === "super admin" || 
    rawRole === "platform admin";

  const isLeader = 
    isSuperAdmin || 
    rawRole === "leader" || 
    rawRole.includes("lead") || 
    rawRole.includes("manager");

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    // navigate isn't available outside component body usually, but 
    // we can use window.location or pass it from parent.
    window.location.href = "/sign-in";
  };

  const menuItems = [
    {
      icon: <RiDashboardHorizontalLine className="w-5 h-5" />,
      label: "Dashboard",
      link: "/",
      visible: true, // Everyone can see some dashboard
    },
    {
      icon: <AlignCenterVertical className="w-5 h-5" />,
      label: "Organization",
      link: "/organization",
      visible: isSuperAdmin,
    },
    {
      icon: <Crown className="w-5 h-5" />,
      label: "Users",
      link: "/users",
      visible: isSuperAdmin,
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Team Members",
      link: "/team-members",
      visible: isLeader,
    },
    {
      icon: <ChartColumnIncreasing className="w-5 h-5" />,
      label: "AI Insights",
      link: "/ai-insights",
      visible: isLeader,
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: "Report",
      link: "/report",
      visible: isLeader,
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      label: "Risk & Alerts",
      link: "/risk-alerts",
      visible: isLeader,
    },
    {
      icon: <BsBadgeAd className="w-5 h-5" />,
      label: "Audit Logs",
      link: "/audit-logs",
      visible: isSuperAdmin,
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: "Settings",
      link: "/settings",
      visible: true,
    },
  ];

  const filteredMenu = menuItems.filter((item) => item.visible);

  return (
    <div className="w-72 bg-[#012B5D] h-full flex flex-col">
      
      {/* Logo */}
      <div className="px-8 py-5">
        <img src={brandlogo} alt="logo" className="w-auto" />
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto">
        {filteredMenu.map((item) => {
          const isActive = location.pathname === item.link;

          return (
            <div key={item.label}>
              <Link
                to={item.link}
                onClick={closeDrawer}
                className={`flex w-4/5 mx-auto rounded-lg items-center gap-3 px-5 py-2 my-3 cursor-pointer transition-all
                ${
                  isActive
                    ? "bg-[#1A406D] text-white font-semibold"
                    : "text-white hover:bg-[#1A406D] hover:font-semibold"
                }`}
              >
                {item.icon}
                <p>{item.label}</p>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Profile / Logout */}
      <div className="p-4 border-t border-[#1A406D]">
        <div 
          onClick={handleLogout}
          className="flex items-center justify-between w-full px-4 py-3 bg-[#0e3665] text-white rounded-lg cursor-pointer hover:bg-rose-900/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#f3ddc6] rounded-full flex items-center justify-center text-[#012B5D] font-bold">
              {userData.full_name?.charAt(0) || "U"}
            </div>
            <div className="text-sm overflow-hidden">
              <p className="truncate font-medium">{userData.full_name || "User"}</p>
              <span className="text-[10px] text-gray-300 block truncate">
                {userData.role || "Member"}
              </span>
            </div>
          </div>
          <FiLogOut className="text-rose-400" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
