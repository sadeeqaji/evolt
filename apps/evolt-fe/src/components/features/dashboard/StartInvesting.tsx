import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@evolt/components/ui/button";
import { useRouter } from "next/navigation";

const StartInvestings = () => {
  const { push } = useRouter();
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-[1.5rem] opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

      <div className="relative bg-card border border-border rounded-[1.5rem] p-6 md:p-8 overflow-hidden transition-all duration-300 hover:border-primary/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative flex flex-row items-center justify-between gap-4 md:gap-8">
          <div className="flex-1 space-y-6">
            <div className="space-y-3">
              <h2 className="text-sm md:text-2xl font-bold text-foreground tracking-tight">
                Capital Pool Investments
              </h2>
              <p className="text-xs md:text-lg text-muted-foreground">
                Fund local businesses. Earn stable returns.
              </p>
            </div>

            <Button
              onClick={() => push("/dashboard/pools")}
              variant="link"
              style={{ padding: 0 }}
              className="text-primary hover:text-primary/80 h-auto md:text-lg text-base font-medium group/button p-0 m-0"
            >
              Start Investing
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover/button:translate-x-1" />
            </Button>
          </div>

          <div className="flex-shrink-0 w-[100px] md:w-[150px]">
            <Image
              src="/startInvesting.png"
              alt="Illustration of a money jar and a growing plant with a coin"
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

export default StartInvestings;
