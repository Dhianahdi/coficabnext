// src/lib/menu-list.ts
import {
  Tag,
  Users,
  Settings,
  Bookmark,
  SquarePen,
  LayoutGrid,
  Book,
  FileText,
  LucideIcon,
} from "lucide-react";

export type ModuleItem = {
  id: string;
  name: string;
  route: string;
  icon?: LucideIcon;
};

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

/**
 * Returns the list of menu groups.
 */
export function getMenuList(
  pathname: string,
  userRole?: string,
  
): Group[] {
  const groups: Group[] = [
    {
      groupLabel: "",
      menus: [
        {
          href: "/recruiter",
          label: "Dashboard",
          icon: LayoutGrid,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Contents",
      menus: [
        {
          href: "",
          label: "Jobs",
          icon: SquarePen,
          submenus: [
            { href: "/Recruiterjobs", label: "All Jobs" },
            { href: "/Recruiterjobs/add", label: "New Jobs" },
          ],
        },
        {
          href: "/offers",
          label: "Offers",
          icon: FileText,
        },
        {
          href: "",
          label: "Forms and Tests",
          icon: SquarePen,
          submenus: [
            { href: "/form", label: "All Forms" },
            { href: "/form/add", label: "New Forms" },
          ],
        },
        {
          href: "/RecMeetings",
          label: "My Meetings",
          icon: Book,
        },
        {
          href: "/messages",
          label: "My messages",
          icon: FileText,
        },
      ],
   
    },
    {
      groupLabel: "Settings",
      menus: [
       
        {
          href: "/Profile",
          label: "Account",
          icon: Settings,
        },
      ],
    },
  ];

  const groupscolab: Group[] = [
   
    {
      groupLabel: "Contents",
      menus: [
        {
          href: "",
          label: "Jobs",
          icon: SquarePen,
          submenus: [
            { href: "/Recruiterjobs", label: "All Jobs" },
          ],
        },
        {
          href: "/offers",
          label: "Offers",
          icon: FileText,
        },

        {
          href: "/RecMeetings",
          label: "My Meetings",
          icon: Book,
        },
        {
          href: "/messages",
          label: "My messages",
          icon: FileText,
        },
      ],
   
    },
    {
      groupLabel: "Settings",
      menus: [
       
        {
          href: "/Profile",
          label: "Account",
          icon: Settings,
        },
      ],
    },
  ];
  const groupsGeust: Group[] = [
    {
      groupLabel: "",
      menus: [
        {
          href: "/candidate",
          label: "Dashboard",
          icon: LayoutGrid,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Contents",
      menus: [
    
        {
          href: "/Condidatjobs",
          label: "Jobs",
          icon: SquarePen,
        },

        {
          href: "/MyMeetings",
          label: "My Meetings",
          icon: Book,
        },
        {
          href: "/test/Mytests",
          label: "My tests",
          icon: FileText,
        },
        {
          href: "/messages",
          label: "My messages",
          icon: FileText,
        },
      ],
    },
    {
      groupLabel: "Settings",
      menus: [
        
        {
          href: "/Profile",
          label: "Account",
          icon: Settings,
        },
      ],
    },
  ];
 
  if (userRole === "RH") {
    groups.push({
      groupLabel: " Administration",
      menus: [
      
        {
          href: "/departments",
          label: "departments",
          icon: Users,
        },
        {
          href: "/roles",
          label: "Roles & Users",
          icon: Users,
        },
      
      ],
    });
  }

  if (userRole === "RH") {
    return groups;
  } else if (userRole != null) {
    return groupscolab;
  } else {
    return groupsGeust;
  }}
