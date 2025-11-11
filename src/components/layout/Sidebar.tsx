import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../ui/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  FileText,
  Library,
  MessageSquare,
  Settings,
  BarChart3,
  UserCog,
  ClipboardList,
  Building2,
} from "lucide-react";
import CediGlyph from "../icons/CediGlyph";
import { useAuth } from "../../contexts/AuthContext";

interface NavItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    href: "/dashboard",
    roles: ["admin", "teacher", "student", "parent"],
  },
  {
    title: "Students",
    icon: <Users className="h-5 w-5" />,
    href: "/students",
    roles: ["admin", "teacher"],
  },
  {
    title: "Teachers",
    icon: <GraduationCap className="h-5 w-5" />,
    href: "/teachers",
    roles: ["admin"],
  },
  {
    title: "Classes",
    icon: <Building2 className="h-5 w-5" />,
    href: "/classes",
    roles: ["admin", "teacher"],
  },
  {
    title: "Subjects",
    icon: <BookOpen className="h-5 w-5" />,
    href: "/subjects",
    roles: ["admin", "teacher"],
  },
  {
    title: "Attendance",
    icon: <ClipboardList className="h-5 w-5" />,
    href: "/attendance",
    roles: ["admin", "teacher", "student"],
  },
  {
    title: "Exams",
    icon: <FileText className="h-5 w-5" />,
    href: "/exams",
    roles: ["admin", "teacher", "student"],
  },
  {
    title: "Results",
    icon: <BarChart3 className="h-5 w-5" />,
    href: "/results",
    roles: ["admin", "teacher", "student", "parent"],
  },
  {
    title: "Fees",
    icon: <CediGlyph className="h-5 w-5" />,
    href: "/fees",
    roles: ["admin", "student", "parent"],
  },
  {
    title: "Library",
    icon: <Library className="h-5 w-5" />,
    href: "/library",
    roles: ["admin", "teacher", "student"],
  },
  {
    title: "Messages",
    icon: <MessageSquare className="h-5 w-5" />,
    href: "/messages",
    roles: ["admin", "teacher", "student", "parent"],
  },
  {
    title: "Timetable",
    icon: <Calendar className="h-5 w-5" />,
    href: "/timetable",
    roles: ["admin", "teacher", "student"],
  },
  {
    title: "Settings",
    icon: <Settings className="h-5 w-5" />,
    href: "/settings",
    roles: ["admin", "teacher", "student", "parent"],
  },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role || "")
  );

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r bg-sidebar">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <GraduationCap className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-sidebar-foreground">Alpha Montessori Pro</h1>
          <p className="text-xs text-muted-foreground">
            School Management System
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {filteredNavItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
              location.pathname === item.href
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            {item.icon}
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};
