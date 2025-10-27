"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@evolt/components/common/BackButton";
import { Button } from "@evolt/components/ui/button";
import { Input } from "@evolt/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@evolt/components/ui/select";
import { Label } from "@evolt/components/ui/label";
import { Upload, Info, HardDrive, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@evolt/lib/apiClient";
import { Textarea } from "@evolt/components/ui/textarea"; // Import Textarea

// Assuming 'invoice' is one of the valid AssetTypes, add others if needed
const assetTypes = [
  { title: "Invoice", type: "invoice" },
  { title: "Real Estate", type: "real_estate" },
  { title: "Agriculture", type: "agriculture" },
  { title: "Creator IP", type: "creator_ip" },
  { title: "Receivables Factoring", type: "receivable" },
  { title: "Automotive & Equipment", type: "automotive_equipment" },
];

const currencies = [{ title: "USD", value: "USD" }]; // Add more if needed

export default function NewListingPage() {
  const router = useRouter();

  // State for all form fields based on curl command
  const [assetType, setAssetType] = useState("invoice"); // Defaulting based on curl
  const [title, setTitle] = useState(""); // Replaces 'name'
  const [description, setDescription] = useState(""); // New field
  const [symbol, setSymbol] = useState(""); // Existing field
  const [amount, setAmount] = useState(""); // New field (might relate to totalTarget?)
  const [currency, setCurrency] = useState("USD"); // New field
  const [yieldRate, setYieldRate] = useState(""); // New field (e.g., "0.12")
  const [durationDays, setDurationDays] = useState(""); // New field
  const [totalTarget, setTotalTarget] = useState(""); // New field
  const [minInvestment, setMinInvestment] = useState(""); // New field
  const [maxInvestment, setMaxInvestment] = useState(""); // New field
  const [expiryDate, setExpiryDate] = useState(""); // New field (Type date for input)
  const [corporateId, setCorporateId] = useState(""); // New field (Assuming this might be needed)
  const [proofFile, setProofFile] = useState<File | null>(null); // Renamed for clarity
  const [isPublishing, setIsPublishing] = useState(false);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        // 50 MB limit
        toast.error("File size exceeds 50 MB limit.");
        setProofFile(null);
        event.target.value = "";
        return;
      }
      setProofFile(file);
      toast.success(`${file.name} selected.`);
    } else {
      setProofFile(null);
    }
  };

  // Format date to ISO string for the API
  const formatExpiryDate = () => {
    if (!expiryDate) return "";
    try {
      // Assuming expiryDate state holds 'YYYY-MM-DD' from the input type="date"
      const date = new Date(expiryDate);
      return date.toISOString(); // Converts to "YYYY-MM-DDTHH:mm:ss.sssZ"
    } catch (e) {
      console.error("Invalid date format:", expiryDate);
      return "";
    }
  };

  // Updated publish logic with API call including all fields
  const handlePublish = async () => {
    // Basic validation (add more specific checks as needed)
    if (
      !assetType ||
      !title ||
      !symbol ||
      !description ||
      !amount ||
      !currency ||
      !yieldRate ||
      !durationDays ||
      !totalTarget ||
      !minInvestment ||
      !maxInvestment ||
      !expiryDate ||
      !corporateId || // Assuming corporateId is required
      !proofFile
    ) {
      toast.error("Please fill all required fields and upload proof document.");
      return;
    }

    // Validate numeric fields
    const numericFields = {
      amount,
      yieldRate,
      durationDays,
      totalTarget,
      minInvestment,
      maxInvestment,
    };
    for (const [key, value] of Object.entries(numericFields)) {
      if (isNaN(Number(value))) {
        toast.error(`Invalid number entered for ${key}.`);
        return;
      }
    }

    const formattedExpiry = formatExpiryDate();
    if (!formattedExpiry) {
      toast.error("Invalid expiry date format.");
      return;
    }

    setIsPublishing(true);
    const loadingToastId = toast.loading("Creating listing...");

    try {
      const formData = new FormData();
      formData.append("assetType", assetType);
      formData.append("title", title); // Using 'title' instead of 'name'
      formData.append("description", description);
      formData.append("symbol", symbol.toUpperCase()); // Send symbol uppercase
      formData.append("amount", amount);
      formData.append("currency", currency);
      formData.append("yieldRate", yieldRate);
      formData.append("durationDays", durationDays);
      formData.append("totalTarget", totalTarget);
      formData.append("minInvestment", minInvestment);
      formData.append("maxInvestment", maxInvestment);
      formData.append("expiryDate", formattedExpiry);
      formData.append("corporateId", corporateId); // Add corporateId if needed
      formData.append("files", proofFile); // Changed key to 'files' as per curl

      // **IMPORTANT:** Replace '/pool' with your actual backend endpoint if different
      const response = await apiClient.post("/asset", formData); // Using /pool endpoint

      toast.success("Listing created successfully!", { id: loadingToastId });
      router.push("/listing"); // Redirect to the listing page on success
    } catch (error: any) {
      console.error("Listing creation failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to create listing.",
        { id: loadingToastId }
      );
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="mt-10 w-full max-w-6xl m-auto space-y-8 pb-20">
      <BackButton />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 bg-black p-5 rounded-lg border border-border">
        {/* Left Column: Proof Uploader */}
        <div className="md:col-span-1 space-y-4">
          <Label className="flex items-center gap-1.5" htmlFor="proof-upload">
            Supporting Document{" "}
            <Info className="w-3.5 h-3.5 text-muted-foreground" />
          </Label>
          <div
            className={`relative flex flex-col items-center justify-center w-full min-h-[20rem] h-auto rounded-lg border-2 border-dashed border-border bg-muted/20 text-center p-6 cursor-pointer hover:border-primary transition-colors ${
              proofFile ? "border-primary bg-primary/10" : ""
            }`}
            onClick={() => document.getElementById("proof-upload")?.click()}
          >
            <input
              type="file"
              id="proof-upload"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.svg" // Keep accepted types broad
              disabled={isPublishing}
            />
            {proofFile ? (
              <>
                <CheckCircle2 className="w-12 h-12 text-primary mb-4" />
                <p className="text-foreground font-semibold">File Selected:</p>
                <p className="text-sm text-muted-foreground break-all">
                  {proofFile.name}
                </p>
                <p className="mt-4 text-xs text-primary underline">
                  Click to change file
                </p>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-muted-foreground mb-4" />
                <p className="text-foreground mb-1">
                  <span className="font-semibold text-primary">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  Proof of Ownership, Invoice, etc. (max 50 MB)
                </p>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="md:col-span-2 space-y-8">
          <div>
            <div className="p-3 bg-muted/30 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <HardDrive className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-semibold mb-2">
              List your Real World Asset
            </h1>
            <p className="text-muted-foreground max-w-lg">
              Provide the details for your asset and upload supporting
              documents. This will create an investment pool.
            </p>
          </div>

          <div className="space-y-6">
            {/* Asset Type */}
            <div className="space-y-2">
              <Label htmlFor="assetType">Asset Type</Label>
              <Select
                value={assetType}
                onValueChange={setAssetType}
                disabled={isPublishing}
              >
                <SelectTrigger className="h-11 bg-muted/20 border-border w-full">
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map((cat) => (
                    <SelectItem key={cat.type} value={cat.type}>
                      {cat.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Office Equipment Purchase Invoice #123"
                className="h-11 bg-muted/20 border-border"
                disabled={isPublishing}
              />
              <p className="text-xs text-muted-foreground">
                A descriptive title for this asset listing.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e: any) => setDescription(e.target.value)}
                placeholder="Provide details about the asset or invoice..."
                className="bg-muted/20 border-border min-h-[80px]"
                disabled={isPublishing}
              />
            </div>

            {/* Token Symbol */}
            <div className="space-y-2">
              <Label htmlFor="symbol">Token Symbol</Label>
              <Input
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g., INV123"
                maxLength={10}
                className="h-11 bg-muted/20 border-border uppercase"
                disabled={isPublishing}
              />
              <p className="text-xs text-muted-foreground">
                A short, unique ticker for the investment pool token (3-10
                chars). Cannot be changed later.
              </p>
            </div>

            {/* Amount & Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g., 25000"
                  className="h-11 bg-muted/20 border-border"
                  disabled={isPublishing}
                />
                <p className="text-xs text-muted-foreground">
                  The primary value associated with the asset (e.g., invoice
                  total).
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={currency}
                  onValueChange={setCurrency}
                  disabled={isPublishing}
                >
                  <SelectTrigger className="h-11 bg-muted/20 border-border w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr.value} value={curr.value}>
                        {curr.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Yield Rate & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="yieldRate">Yield Rate (APY %)</Label>
                <Input
                  id="yieldRate"
                  type="number"
                  step="0.01" // Allow decimals
                  value={(parseFloat(yieldRate) * 100).toFixed(2)} // Display as percentage
                  onChange={(e) => {
                    const percentageValue = parseFloat(e.target.value);
                    if (!isNaN(percentageValue)) {
                      setYieldRate((percentageValue / 100).toString()); // Store as decimal
                    } else {
                      setYieldRate("");
                    }
                  }}
                  placeholder="e.g., 12.00"
                  className="h-11 bg-muted/20 border-border"
                  disabled={isPublishing}
                />
                <p className="text-xs text-muted-foreground">
                  Annual Percentage Yield offered to investors. Enter as
                  percentage (e.g., 12 for 12%).
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="durationDays">Duration (Days)</Label>
                <Input
                  id="durationDays"
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  placeholder="e.g., 90"
                  className="h-11 bg-muted/20 border-border"
                  disabled={isPublishing}
                />
                <p className="text-xs text-muted-foreground">
                  Investment lock-up period in days.
                </p>
              </div>
            </div>

            {/* Total Target */}
            <div className="space-y-2">
              <Label htmlFor="totalTarget">Total Funding Target</Label>
              <Input
                id="totalTarget"
                type="number"
                value={totalTarget}
                onChange={(e) => setTotalTarget(e.target.value)}
                placeholder="e.g., 25000"
                className="h-11 bg-muted/20 border-border"
                disabled={isPublishing}
              />
              <p className="text-xs text-muted-foreground">
                The total amount of capital to be raised for this pool (in USD).
              </p>
            </div>

            {/* Min & Max Investment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minInvestment">Min Investment (USD)</Label>
                <Input
                  id="minInvestment"
                  type="number"
                  value={minInvestment}
                  onChange={(e) => setMinInvestment(e.target.value)}
                  placeholder="e.g., 100"
                  className="h-11 bg-muted/20 border-border"
                  disabled={isPublishing}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum amount an investor can put in.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxInvestment">Max Investment (USD)</Label>
                <Input
                  id="maxInvestment"
                  type="number"
                  value={maxInvestment}
                  onChange={(e) => setMaxInvestment(e.target.value)}
                  placeholder="e.g., 5000"
                  className="h-11 bg-muted/20 border-border"
                  disabled={isPublishing}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum amount an investor can put in.
                </p>
              </div>
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Funding Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date" // Use date type for better UX
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="h-11 bg-muted/20 border-border"
                disabled={isPublishing}
              />
              <p className="text-xs text-muted-foreground">
                Date when the funding period for this pool ends.
              </p>
            </div>

            {/* Corporate ID (Optional?) */}
            <div className="space-y-2">
              <Label htmlFor="corporateId">Corporate ID</Label>
              <Input
                id="corporateId"
                value={corporateId}
                onChange={(e) => setCorporateId(e.target.value)}
                placeholder="Enter associated Corporate ID"
                className="h-11 bg-muted/20 border-border"
                disabled={isPublishing}
              />
              <p className="text-xs text-muted-foreground">
                Internal ID for the associated corporate entity (if applicable).
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => router.back()}
              className="text-muted-foreground"
              disabled={isPublishing}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              onClick={handlePublish}
              loading={isPublishing}
              disabled={isPublishing}
            >
              {isPublishing ? "Creating..." : "Create Listing"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
