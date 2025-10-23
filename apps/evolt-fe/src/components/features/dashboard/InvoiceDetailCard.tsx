"use client";
import { Badge } from "@evolt/components/ui/badge";
import { Button } from "@evolt/components/ui/button";
import { ExternalLink, Info } from "lucide-react";

interface InvoiceCardProps {
  invoiceNumber: string;

  logoUrl?: string;
  smeVendorDescription: string;
  corporatePayerDescription: string;
  numberOfStakers: number;
  expectedAPY: number;
  amountFunded: number;
  currency?: string;
  duration: number;
  durationUnit?: string;
  verifiedBy: string;
  verifierTitle: string;
  verificationDate: string;
  blockchainExplorerUrl: string;
}

const BadgeCheck: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#clip0_1019_3229)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.66906 1.16933C8.56501 1.00307 8.41172 0.873391 8.23051 0.79834C8.04931 0.723289 7.84921 0.706601 7.65808 0.750598L6.30155 1.06219C6.16253 1.09414 6.01807 1.09414 5.87905 1.06219L4.52253 0.750598C4.33139 0.706601 4.1313 0.723289 3.9501 0.79834C3.76889 0.873391 3.61559 1.00307 3.51154 1.16933L2.77217 2.34931C2.69672 2.47002 2.59487 2.57187 2.47416 2.64808L1.29417 3.38745C1.12821 3.49141 0.998717 3.64446 0.923682 3.82535C0.848647 4.00625 0.831789 4.20601 0.875446 4.39692L1.18704 5.75496C1.21888 5.89374 1.21888 6.03793 1.18704 6.1767L0.875446 7.53399C0.831619 7.72501 0.848393 7.92494 0.923435 8.10599C0.998478 8.28704 1.12806 8.44021 1.29417 8.54421L2.47416 9.28359C2.59487 9.35904 2.69672 9.46089 2.77292 9.5816L3.5123 10.7616C3.72506 11.1018 4.13096 11.2701 4.52253 11.1803L5.87905 10.8687C6.01807 10.8368 6.16253 10.8368 6.30155 10.8687L7.65883 11.1803C7.84986 11.2241 8.04979 11.2074 8.23084 11.1323C8.41189 11.0573 8.56506 10.9277 8.66906 10.7616L9.40844 9.5816C9.48388 9.46089 9.58574 9.35904 9.70645 9.28359L10.8872 8.54421C11.0533 8.44006 11.1828 8.28672 11.2577 8.10552C11.3327 7.92432 11.3492 7.72429 11.3052 7.53323L10.9943 6.1767C10.9624 6.03768 10.9624 5.89323 10.9943 5.7542L11.3059 4.39692C11.3498 4.20598 11.3332 4.0061 11.2583 3.82506C11.1833 3.64402 11.0539 3.49081 10.8879 3.3867L9.70721 2.64732C9.58666 2.57174 9.48478 2.46985 9.40919 2.34931L8.66906 1.16933ZM8.28957 4.283C8.33623 4.19719 8.34779 4.09663 8.32182 4.00247C8.29585 3.90831 8.23436 3.82789 8.15031 3.77814C8.06625 3.72839 7.96617 3.71319 7.87113 3.73572C7.77609 3.75826 7.6935 3.81678 7.64073 3.89898L5.6678 7.23824L4.4765 6.09749C4.44116 6.0612 4.39887 6.0324 4.35216 6.01281C4.30545 5.99321 4.25527 5.98323 4.20461 5.98345C4.15396 5.98367 4.10387 5.99409 4.05733 6.01409C4.01079 6.03409 3.96875 6.06326 3.93373 6.09985C3.89871 6.13645 3.87141 6.17972 3.85347 6.22709C3.83553 6.27447 3.82732 6.32497 3.82932 6.37558C3.83132 6.4262 3.8435 6.47589 3.86512 6.5217C3.88674 6.56751 3.91737 6.60849 3.95517 6.64221L5.48975 8.11266C5.53082 8.15193 5.58024 8.18142 5.6343 8.19892C5.68837 8.21641 5.74569 8.22147 5.80198 8.21371C5.85827 8.20594 5.91209 8.18556 5.9594 8.15409C6.00671 8.12261 6.0463 8.08085 6.07521 8.03193L8.28957 4.283Z"
        fill="#555CE4"
      />
    </g>
    <defs>
      <clipPath id="clip0_1019_3229">
        <rect
          width="10.5625"
          height="10.5625"
          fill="white"
          transform="translate(0.8125 0.6875)"
        />
      </clipPath>
    </defs>
  </svg>
);

export const InvoiceCard = ({
  invoiceNumber,

  logoUrl,
  smeVendorDescription,
  corporatePayerDescription,
  numberOfStakers,
  expectedAPY,
  amountFunded,
  currency = "USDT",
  duration,
  durationUnit = "days",
  verifiedBy,
  verifierTitle,
  verificationDate,
  blockchainExplorerUrl,
}: InvoiceCardProps) => {
  return (
    <div className="w-full mx-auto bg-black p-5 rounded-2xl shadow-2xl">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        {logoUrl && (
          <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-card">
            <img
              src={logoUrl}
              alt="Company Logo"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-invoice-text mb-1">
            Invoice {invoiceNumber}
          </h1>
        </div>
      </div>

      <div className="h-px bg-invoice-divider mb-8" />

      {/* About SME Vendor */}
      <section className="mb-8">
        <h2 className="text-base sm:text-lg font-semibold text-invoice-text mb-3">
          About SME Vendor
        </h2>
        <p className="text-sm sm:text-base text-invoice-text-muted leading-relaxed">
          {smeVendorDescription}
        </p>
      </section>

      {/* About Corporate Payer */}
      <section className="mb-8">
        <h2 className="text-base sm:text-lg font-semibold text-invoice-text mb-3">
          About Corporate Payer
        </h2>
        <p className="text-sm sm:text-base text-invoice-text-muted leading-relaxed">
          {corporatePayerDescription}
        </p>
      </section>

      <div className="h-px bg-invoice-divider mb-8" />

      {/* Investment Details */}
      <div className="flex flex-wrap gap-4 items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-invoice-text-muted mb-1">
            <span>Number Of Investors In The Pool</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-invoice-text">
            {numberOfStakers} Stakers
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-sm text-invoice-text-muted mb-1 justify-end">
            <span>Expected Yield</span>
            <Info className="w-4 h-4" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-invoice-text">
            {expectedAPY}%
          </p>
        </div>
      </div>

      {/* Amount Section */}
      <div className="flex flex-wrap gap-4 items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl sm:text-3xl font-bold text-invoice-text">
              {amountFunded.toFixed(2)} {currency}
            </span>
            <Badge className="bg-primary text-invoice-badge border-0 text-xs sm:text-sm px-3 py-1 rounded-full">
              Amount Funded
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-invoice-text-muted mb-1">Duration:</p>
          <p className="text-xl sm:text-2xl font-bold text-invoice-text">
            {duration}
            {durationUnit}
          </p>
        </div>
      </div>

      <div className="h-px bg-invoice-divider mb-8" />

      {/* Verification Section */}
      <div className="mb-6">
        <p className="text-sm text-invoice-text-muted mb-2">
          Invoice Verified By :
        </p>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-xl sm:text-2xl font-bold text-invoice-text">
            {verifiedBy}
          </p>
          <BadgeCheck />
        </div>
        <p className="text-sm text-invoice-text-muted">({verifierTitle})</p>
      </div>

      {/* On-Chain Verification */}
      <div className="mb-8">
        <p className="text-sm text-invoice-text-muted mb-2">
          On-Chain Verification
        </p>
        <div className="flex items-center gap-2 mb-4">
          <p className="text-lg sm:text-xl font-semibold text-invoice-text">
            {verificationDate}
          </p>
          <BadgeCheck />
        </div>
      </div>

      {/* Blockchain Explorer Button */}
      <Button
        size="sm"
        variant="secondary"
        className="w-full bg-secondary hover:bg-secondary/80 text-[#B7BAF5] font-medium py-6 text-sm sm:text-base transition-all duration-200 hover:scale-[1.02] rounded-full max-w-md"
        onClick={() => window.open(blockchainExplorerUrl, "_blank")}
      >
        <span>View Verification On Hedera Explorer</span>
        <ExternalLink className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
      </Button>
    </div>
  );
};
