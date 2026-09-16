export interface MegaMenuColumn {
  heading: string;
  links: { label: string; href: string }[];
}

export interface MegaMenuConfig {
  label: string;
  href: string;
  columns: MegaMenuColumn[];
  viewAllLabel: string;
  viewAllHref: string;
}

export const megaMenus: MegaMenuConfig[] = [
  {
    label: "3D Printing",
    href: "/category/3d-printers",
    viewAllLabel: "View all 3D printers",
    viewAllHref: "/category/3d-printers",
    columns: [
      {
        heading: "3D Printers",
        links: [
          { label: "FDM / FFF", href: "/category/3d-printers?tech=FDM" },
          { label: "Resin", href: "/category/3d-printers?tech=Resin" },
          { label: "CoreXY", href: "/category/3d-printers?tech=CoreXY" },
          { label: "Large Format", href: "/category/3d-printers?tech=Large+Format" },
          { label: "Industrial", href: "/category/3d-printers?tech=Industrial" },
          { label: "Educational", href: "/category/3d-printers?tech=Educational" },
          { label: "DIY", href: "/category/3d-printers?tech=DIY" },
        ],
      },
      {
        heading: "Shop by Experience",
        links: [
          { label: "Beginner", href: "/category/3d-printers?level=Beginner" },
          { label: "Intermediate", href: "/category/3d-printers?level=Intermediate" },
          { label: "Professional", href: "/category/3d-printers?level=Professional" },
          { label: "Industrial", href: "/category/3d-printers?level=Industrial" },
        ],
      },
      {
        heading: "Shop by Use",
        links: [
          { label: "Hobby", href: "/category/3d-printers?use=Hobby" },
          { label: "Engineering", href: "/category/3d-printers?use=Engineering" },
          { label: "Prototyping", href: "/category/3d-printers?use=Prototyping" },
          { label: "Education", href: "/category/3d-printers?use=Education" },
          { label: "Business", href: "/category/3d-printers?use=Business" },
        ],
      },
      {
        heading: "Brands",
        links: [
          { label: "Bambu Lab", href: "/category/3d-printers?brand=bambu-lab" },
          { label: "Creality", href: "/category/3d-printers?brand=creality" },
          { label: "Prusa Research", href: "/category/3d-printers?brand=prusa-research" },
          { label: "Elegoo", href: "/category/3d-printers?brand=elegoo" },
        ],
      },
    ],
  },
  {
    label: "Materials",
    href: "/category/filament",
    viewAllLabel: "View all materials",
    viewAllHref: "/category/filament",
    columns: [
      {
        heading: "Filament",
        links: [
          { label: "PLA", href: "/category/filament?sub=PLA" },
          { label: "PETG", href: "/category/filament?sub=PETG" },
          { label: "ABS", href: "/category/filament?sub=ABS" },
          { label: "ASA", href: "/category/filament?sub=ASA" },
          { label: "TPU", href: "/category/filament?sub=TPU" },
          { label: "Nylon", href: "/category/filament?sub=Nylon" },
        ],
      },
      {
        heading: "Resin",
        links: [
          { label: "Standard", href: "/category/resin?sub=Standard" },
          { label: "Engineering", href: "/category/resin?sub=Engineering" },
        ],
      },
      {
        heading: "Filament Brands",
        links: [
          { label: "Bambu Lab", href: "/category/filament?brand=bambu-lab" },
          { label: "Polymaker", href: "/category/filament?brand=polymaker" },
          { label: "eSUN", href: "/category/filament?brand=esun" },
          { label: "Overture", href: "/category/filament?brand=overture" },
        ],
      },
      {
        heading: "INFiLL Filament",
        links: [{ label: "Coming soon — our own filament line", href: "/about" }],
      },
    ],
  },
  {
    label: "Parts & Accessories",
    href: "/category/parts-accessories",
    viewAllLabel: "View all parts",
    viewAllHref: "/category/parts-accessories",
    columns: [
      {
        heading: "Categories",
        links: [
          { label: "Nozzles", href: "/category/parts-accessories?sub=Nozzles" },
          { label: "Hotends", href: "/category/parts-accessories?sub=Hotends" },
          { label: "Build Plates", href: "/category/parts-accessories?sub=Build+Plates" },
          { label: "Extruders", href: "/category/parts-accessories?sub=Extruders" },
        ],
      },
    ],
  },
  {
    label: "Machines",
    href: "/category/machines",
    viewAllLabel: "View all machines",
    viewAllHref: "/category/machines",
    columns: [
      {
        heading: "Digital Fabrication",
        links: [
          { label: "3D Printing (primary)", href: "/category/3d-printers" },
          { label: "CNC", href: "/category/machines?sub=CNC" },
          { label: "UV Printing", href: "/category/machines?sub=UV+Printing" },
          { label: "Laser", href: "/category/machines?sub=Laser" },
        ],
      },
    ],
  },
];

export const simpleNavLinks = [
  { label: "Instant Quote", href: "/print-price-calculator" },
  { label: "Services", href: "/services" },
  { label: "Learn", href: "/lab" },
];
