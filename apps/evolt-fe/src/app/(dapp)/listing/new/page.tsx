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

const rwaCategories = [
  {
    title: "Real Estate",
    type: "real_estate",
  },
  {
    title: "Agriculture",
    type: "agriculture",
  },
  {
    title: "Creator IP",
    type: "creator_ip",
  },
  {
    title: "Receivables Factoring",
    type: "receivable",
  },
  {
    title: "Automotive & Equipment",
    type: "automotive_equipment",
  },
];

export default function NewListingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [category, setCategory] = useState("");
  const [proofOfOwnershipFile, setProofOfOwnershipFile] = useState<File | null>(
    null
  );
  const [isPublishing, setIsPublishing] = useState(false); // Loading state for API call

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size exceeds 50 MB limit.");
        setProofOfOwnershipFile(null);
        event.target.value = "";
        return;
      }
      setProofOfOwnershipFile(file);
      toast.success(`${file.name} selected.`);
    } else {
      setProofOfOwnershipFile(null);
    }
  };

  // Updated publish logic with API call
  const handlePublish = async () => {
    if (!name || !symbol || !category || !proofOfOwnershipFile) {
      toast.error("Please fill all fields and upload proof of ownership.");
      return;
    }

    setIsPublishing(true);
    const loadingToastId = toast.loading("Publishing contract...");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("symbol", symbol);
      formData.append("category", category);
      formData.append("files", proofOfOwnershipFile);
      formData.append("corporateId", "68f6f0f85a2f445265e64cc0")
      const response = await apiClient.post("/asset/", formData, {
        headers: {
          // Axios usually sets this automatically for FormData,
          // but explicitly setting it can sometimes help.
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response, 'response')
      toast.success("Contract published successfully!", { id: loadingToastId });
      // Optional: Reset form or redirect
      // setName(''); setSymbol(''); setCategory(''); setProofOfOwnershipFile(null);
      router.push("/listing"); // Redirect to the listing page on success
    } catch (error: any) {
      console.error("Publishing failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to publish contract.",
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
        {/* Left Column: Proof of Ownership Uploader */}
        <div className="md:col-span-1 space-y-4">
          <Label className="flex items-center gap-1.5" htmlFor="proof-upload">
            Proof of Ownership{" "}
            <Info className="w-3.5 h-3.5 text-muted-foreground" />
          </Label>
          <div
            className={`relative flex flex-col items-center justify-center w-full h-80 rounded-lg border-2 border-dashed border-border bg-muted/20 text-center p-6 cursor-pointer hover:border-primary transition-colors ${proofOfOwnershipFile ? "border-primary bg-primary/10" : ""
              }`}
            onClick={() => document.getElementById("proof-upload")?.click()}
          >
            <input
              type="file"
              id="proof-upload"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.svg"
              disabled={isPublishing} // Disable during upload
            />
            {proofOfOwnershipFile ? (
              <>
                <CheckCircle2 className="w-12 h-12 text-primary mb-4" />
                <p className="text-foreground font-semibold">File Selected:</p>
                <p className="text-sm text-muted-foreground break-all">
                  {proofOfOwnershipFile.name}
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
                  PDF, DOC, DOCX, JPG, PNG, etc. (max 50 MB)
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
              {`Provide the details for your asset collection and upload proof of
              ownership. We'll help deploy a contract to represent it on-chain.`}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Collection Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Lekki Phase 1 Apartments"
                className="h-11 bg-muted/20 border-border"
                disabled={isPublishing} // Disable during upload
              />
              <p className="text-xs text-muted-foreground">
                {` This will also be the name of your smart contract. You won't be
                able to update later.`}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="symbol">Token Symbol</Label>
              <Input
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())} // Ensure uppercase
                placeholder="e.g., LKP1"
                maxLength={10}
                className="h-11 bg-muted/20 border-border uppercase"
                disabled={isPublishing} // Disable during upload
              />
              <p className="text-xs text-muted-foreground">
                {` A short ticker for your token (e.g., 3-5 letters). Can't be
                changed after deployment.`}
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={setCategory}
                disabled={isPublishing} // Disable during upload
              >
                <SelectTrigger className="h-11 bg-muted/20 border-border w-full">
                  <SelectValue placeholder="Select an RWA category" />
                </SelectTrigger>
                <SelectContent>
                  {rwaCategories.map((cat) => (
                    <SelectItem key={cat.type} value={cat.type}>
                      {cat.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select the Real World Asset category this collection belongs to.
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
              disabled={isPublishing} // Disable during upload
            >
              Cancel
            </Button>
            <Button
              size="lg"
              onClick={handlePublish}
              loading={isPublishing} // Show loading state on button
              disabled={isPublishing} // Disable button during upload
            >
              {isPublishing ? "Publishing..." : "Publish Contract"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
