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
import { format } from "date-fns";
import { Textarea } from "@evolt/components/ui/textarea";
import { Upload, Info, HardDrive, CheckCircle2, Calendar } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@evolt/lib/apiClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@evolt/components/ui/form";
import { cn } from "@evolt/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@evolt/components/ui/popover";
import { Calendar as CalendarComponent } from "@evolt/components/ui/calendar";
const assetTypes = [
  { title: "Invoice", type: "invoice" },
  { title: "Real Estate", type: "real_estate" },
  { title: "Agriculture", type: "agriculture" },
  { title: "Creator IP", type: "creator_ip" },
  { title: "Receivables Factoring", type: "receivable" },
  { title: "Automotive & Equipment", type: "automotive_equipment" },
];

const currencies = [{ title: "USD", value: "USD" }];

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const today = new Date(new Date().setHours(0, 0, 0, 0));

const assetFormSchema = z
  .object({
    assetType: z.string().min(1, { message: "Please select an asset type." }),
    title: z
      .string()
      .min(3, { message: "Title must be at least 3 characters." }),
    description: z
      .string()
      .min(10, { message: "Description must be at least 10 characters." }),
    symbol: z
      .string()
      .min(3, { message: "Symbol must be 3-10 characters." })
      .max(10, { message: "Symbol must be 3-10 characters." })
      .regex(/^[A-Z0-9]+$/, {
        message: "Symbol must be uppercase letters and numbers.",
      })
      .transform((val) => val.toUpperCase()),

    yieldRate: z.coerce
      .number()
      .positive({ message: "Yield must be a positive percentage." })
      .refine((val) => !isNaN(val), { message: "Yield rate is required." }),

    durationDays: z.coerce
      .number()
      .int({ message: "Duration must be an integer." })
      .positive({ message: "Duration must be a positive number of days." })
      .refine((val) => !isNaN(val), { message: "Duration is required." }),

    totalTarget: z.coerce
      .number()
      .positive({ message: "Total target must be a positive amount." })
      .refine((val) => !isNaN(val), { message: "Total target is required." }),

    minInvestment: z.coerce
      .number()
      .positive({ message: "Min. investment must be a positive amount." })
      .refine((val) => !isNaN(val), {
        message: "Min. investment is required.",
      }),

    maxInvestment: z.coerce
      .number()
      .positive({ message: "Max. investment must be a positive amount." })
      .refine((val) => !isNaN(val), {
        message: "Max. investment is required.",
      }),

    expiryDate: z.coerce.date().refine((val) => val >= today, {
      message: "Expiry date must be today or in the future.",
    }),

    proofFile: z
      .instanceof(File, { message: "A proof document is required." })
      .refine((file) => file.size <= MAX_FILE_SIZE, {
        message: "File size must be 50MB or less.",
      }),
  })
  .refine((data) => data.maxInvestment >= data.minInvestment, {
    message:
      "Max. investment must be greater than or equal to min. investment.",
    path: ["maxInvestment"],
  })
  .refine((data) => data.totalTarget >= data.maxInvestment, {
    message: "Total target must be greater than or equal to max. investment.",
    path: ["totalTarget"],
  });

type AssetFormData = z.infer<typeof assetFormSchema>;

export default function NewListingPage() {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      assetType: "invoice",
      title: "",
      description: "",
      symbol: "",
      yieldRate: undefined,
      durationDays: undefined,
      totalTarget: undefined,
      minInvestment: undefined,
      maxInvestment: undefined,
      expiryDate: undefined,
      proofFile: undefined,
    },
  });

  const onSubmit = async (data: AssetFormData) => {
    setIsPublishing(true);
    const loadingToastId = toast.loading("Creating listing...");

    try {
      const formData = new FormData();
      formData.append("assetType", data.assetType);
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("symbol", data.symbol.toUpperCase());
      formData.append("amount", String(data.totalTarget));
      formData.append("currency", "USD"); // Hardcoded as before
      formData.append("yieldRate", String(data.yieldRate / 100)); // Convert percentage to decimal
      formData.append("durationDays", String(data.durationDays));
      formData.append("totalTarget", String(data.totalTarget));
      formData.append("minInvestment", String(data.minInvestment));
      formData.append("maxInvestment", String(data.maxInvestment));
      formData.append("expiryDate", data.expiryDate.toISOString());
      formData.append("corporateId", "68f6f0f85a2f445265e64cc0"); // Hardcoded as before
      formData.append("files", data.proofFile);

      const response = await apiClient.post("/asset", formData);

      toast.success("Listing created successfully!", { id: loadingToastId });
      router.push("/listing");
      form.reset();
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

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 bg-black p-5 rounded-lg border border-border"
        >
          {/* Left Column: Proof Uploader */}
          <div className="md:col-span-1 space-y-4">
            <FormField
              control={form.control}
              name="proofFile"
              render={({ field: { onChange, onBlur, name, ref } }) => (
                <FormItem>
                  <FormLabel
                    htmlFor="proof-upload"
                    className="flex items-center gap-1.5 cursor-pointer"
                  >
                    Supporting Document{" "}
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                  </FormLabel>
                  <FormControl>
                    <div
                      className={cn(
                        "relative flex flex-col items-center justify-center w-full min-h-[20rem] h-auto rounded-lg border-2 border-dashed border-border bg-muted/20 text-center p-6 cursor-pointer hover:border-primary transition-colors",
                        form.watch("proofFile") &&
                          !form.formState.errors.proofFile &&
                          "border-primary bg-primary/10",
                        form.formState.errors.proofFile && "border-destructive"
                      )}
                      onClick={() =>
                        document.getElementById("proof-upload")?.click()
                      }
                    >
                      <input
                        type="file"
                        id="proof-upload"
                        className="hidden"
                        onBlur={onBlur}
                        name={name}
                        ref={ref}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > MAX_FILE_SIZE) {
                              form.setError("proofFile", {
                                type: "manual",
                                message: "File size exceeds 50 MB limit.",
                              });
                              e.target.value = "";
                            } else {
                              onChange(file); // Set file in react-hook-form
                              form.clearErrors("proofFile");
                              toast.success(`${file.name} selected.`);
                            }
                          } else {
                            onChange(undefined); // Handle file removal
                          }
                        }}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.svg"
                        disabled={isPublishing}
                      />
                      {form.watch("proofFile") &&
                      !form.formState.errors.proofFile ? (
                        <>
                          <CheckCircle2 className="w-12 h-12 text-primary mb-4" />
                          <p className="text-foreground font-semibold">
                            File Selected:
                          </p>
                          <p className="text-sm text-muted-foreground break-all">
                            {form.watch("proofFile")?.name}
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
                  </FormControl>
                  <FormMessage className="text-center" />
                </FormItem>
              )}
            />
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
              <FormField
                control={form.control}
                name="assetType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isPublishing}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 bg-muted/20 border-border w-full">
                          <SelectValue placeholder="Select asset type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assetTypes.map((cat) => (
                          <SelectItem key={cat.type} value={cat.type}>
                            {cat.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Office Equipment Purchase Invoice #123"
                        className="h-11 bg-muted/20 border-border"
                        disabled={isPublishing}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A descriptive title for this asset listing.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide details about the asset or invoice..."
                        className="bg-muted/20 border-border min-h-[80px]"
                        disabled={isPublishing}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Token Symbol */}
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token Symbol</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., INV123"
                        maxLength={10}
                        className="h-11 bg-muted/20 border-border uppercase"
                        disabled={isPublishing}
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Unique ticker for the pool token (3-10 chars, A-Z, 0-9).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Yield Rate & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="yieldRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yield Rate (APY %)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 12.5"
                          className="h-11 bg-muted/20 border-border"
                          disabled={isPublishing}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : e.target.valueAsNumber
                            )
                          }
                          onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Annual yield. Enter 12.5 for 12.5%.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="durationDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (Days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 90"
                          className="h-11 bg-muted/20 border-border"
                          disabled={isPublishing}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : e.target.valueAsNumber
                            )
                          }
                          onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Investment lock-up period.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Total Target */}
              <FormField
                control={form.control}
                name="totalTarget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Funding Target (USD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 25000"
                        className="h-11 bg-muted/20 border-border"
                        disabled={isPublishing}
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : e.target.valueAsNumber
                          )
                        }
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Total capital to be raised.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Min & Max Investment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minInvestment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Investment (USD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 100"
                          className="h-11 bg-muted/20 border-border"
                          disabled={isPublishing}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : e.target.valueAsNumber
                            )
                          }
                          onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxInvestment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Investment (USD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 5000"
                          className="h-11 bg-muted/20 border-border"
                          disabled={isPublishing}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : e.target.valueAsNumber
                            )
                          }
                          onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Funding Expiry Date</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-11 w-full justify-start text-left font-normal bg-muted/20 border-border",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isPublishing}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormDescription>
                      Date when the funding period for this pool ends.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => router.back()}
                className="text-muted-foreground"
                disabled={isPublishing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                loading={isPublishing}
                disabled={isPublishing}
              >
                {isPublishing ? "Creating..." : "Create Listing"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
