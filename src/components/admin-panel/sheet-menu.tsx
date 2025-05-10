"use client"; // Marquer ce composant comme un composant client

import Link from "next/link";
import { MenuIcon, PanelsTopLeft } from "lucide-react";
import { useTheme } from "next-themes"; // Importer useTheme

import { Button } from "@/components/ui/button";
import { Menu } from "@/components/admin-panel/menu";
import {
  Sheet,
  SheetHeader,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

export function SheetMenu() {
  const { theme } = useTheme(); // Détecter le thème actuel (light/dark)

  // Déterminer le logo en fonction du thème
  const logo = theme === "dark" ? "/img/Logo-COFICAB-white.png" : "/img/Logo-COFICAB-black.png";

  return (
    <Sheet>
      <SheetTrigger className="lg:hidden" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:w-72 px-3 h-full flex flex-col" side="left">
        <SheetHeader>
          <Button
            className="flex justify-center items-center pb-2 pt-1"
            variant="link"
            asChild
          >
            <Link href="/dashboard" className="flex items-center gap-2">
              {/* Afficher le logo */}
              <img
                src={logo}
                alt="COFICAB Logo"
                width={80} // Ajustez la largeur selon vos besoins
                height={80} // Ajustez la hauteur selon vos besoins
              />
              {/* Masquer le texte "Brand" */}
              <SheetTitle className="font-bold text-lg sr-only">Brand</SheetTitle>
            </Link>
          </Button>
        </SheetHeader>
        <Menu isOpen />
      </SheetContent>
    </Sheet>
  );
}