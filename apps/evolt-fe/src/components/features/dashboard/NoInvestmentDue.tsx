import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

const NoInvestmentDue = () => {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-[1.5rem] opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

      <div className="relative bg-card border border-border rounded-[1.5rem] p-6 md:p-8 overflow-hidden transition-all duration-300 hover:border-primary/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative flex flex-row items-center justify-between gap-4 md:gap-8">
          <div className="flex-1 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-primary" />
                <h2 className="text-sm md:text-2xl font-bold text-foreground tracking-tight">
                  Closed Assets
                </h2>
              </div>
              <p className="text-xs md:text-lg text-muted-foreground">
                Your fully withdrawn assets will appear here.
              </p>
            </div>
          </div>

          <div className="flex-shrink-0 w-[100px] md:w-[150px]">
            <Image
              src="/vusd.png"
              alt="Illustration of a person relaxed with completed investment"
              width={150}
              height={90}
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoInvestmentDue;
