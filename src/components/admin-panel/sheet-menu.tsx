import Link from "next/link";
import { MenuIcon, PanelsTopLeft } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes"; // Pour détecter le thème actuel

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
              <Image
                src={logo}
                alt="COFICAB Logo"
                width={100} // Ajustez la largeur selon vos besoins
                height={100} // Ajustez la hauteur selon vos besoins
                className="transition-all ease-in-out duration-300"
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