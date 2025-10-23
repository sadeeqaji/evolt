"use client";

import { Card } from "@evolt/components/ui/card";

interface CategoryCardProps {
  title: string;
  image: string;
  colorClass: string;
}

const CategoryCard = ({ title, image, colorClass }: CategoryCardProps) => {
  return (
    <Card
      className={`${colorClass} overflow-hidden border-none cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl group w-full h-[220px] flex flex-col p-4`}
    >
      {/* Title */}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full h-[120px] rounded-xl overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      </div>
    </Card>
  );
};

export default CategoryCard;
