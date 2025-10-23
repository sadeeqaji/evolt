"use client";

import { Upload, UserPlus, Trash2 } from "lucide-react";
import { Button } from "@evolt/components/ui/button";
import { Input } from "@evolt/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@evolt/components/ui/form";
import { StepIndicator } from "./StepIndicator";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";

interface Signatory {
  id: string;
  name: string;
  phone: string;
  email: string;
  document: File | null;
}

const kybSchema = z.object({
  rcNumber: z
    .string()
    .min(1, "RC Number is required")
    .regex(/^[0-9]+$/, "RC Number must contain only numbers"),
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters"),
  businessAddress: z
    .string()
    .min(5, "Business address must be at least 5 characters"),
  ownershipDocument: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "Please upload ownership document")
    .refine(
      (files) => files[0]?.size <= 10000000,
      "File size must be less than 10MB"
    ),
});

type KYBFormValues = z.infer<typeof kybSchema>;

export const CompleteKYB = () => {
  const { push } = useRouter();
  const [ownershipFileName, setOwnershipFileName] = useState<string>("");
  const [signatories, setSignatories] = useState<Signatory[]>([]);

  const [newSignatory, setNewSignatory] = useState({
    name: "",
    email: "",
    phone: "",
    document: null as File | null,
  });
  const [signatoryErrors, setSignatoryErrors] = useState({
    name: "",
    email: "",
    phone: "",
    document: "",
  });

  const form = useForm<KYBFormValues>({
    resolver: zodResolver(kybSchema),
    defaultValues: {
      rcNumber: "",
      businessName: "",
      businessAddress: "",
    },
    mode: "onChange",
  });

  const validateSignatory = () => {
    const errors = {
      name: "",
      email: "",
      phone: "",
      document: "",
    };
    let isValid = true;

    if (!newSignatory.name || newSignatory.name.length < 2) {
      errors.name = "Name must be at least 2 characters";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newSignatory.email || !emailRegex.test(newSignatory.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (
      !newSignatory.phone ||
      newSignatory.phone.length < 10 ||
      !phoneRegex.test(newSignatory.phone)
    ) {
      errors.phone = "Please enter a valid phone number (at least 10 digits)";
      isValid = false;
    }

    if (!newSignatory.document) {
      errors.document = "Please upload identification document";
      isValid = false;
    }

    setSignatoryErrors(errors);
    return isValid;
  };

  const handleAddSignatory = () => {
    if (validateSignatory()) {
      const signatory: Signatory = {
        id: Date.now().toString(),
        name: newSignatory.name,
        phone: newSignatory.phone,
        email: newSignatory.email,
        document: newSignatory.document,
      };
      setSignatories([...signatories, signatory]);
      setNewSignatory({
        name: "",
        email: "",
        phone: "",
        document: null,
      });
      setSignatoryErrors({
        name: "",
        email: "",
        phone: "",
        document: "",
      });
    }
  };

  const handleRemoveSignatory = (id: string) => {
    setSignatories(signatories.filter((s) => s.id !== id));
  };

  const onSubmit = (data: KYBFormValues) => {
    if (signatories.length === 0) {
      alert("Please add at least one authorized signatory");
      return;
    }

    console.log({ formData: data, signatories });
    push("/sme-portal");
  };

  const isFormComplete = form.formState.isValid && signatories.length > 0;

  return (
    <div className="bg-background p-3 lg:p-6">
      <div className="">
        <StepIndicator currentStep={2} />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="rcNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-form-label text-base">
                      RC Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g 34746034"
                        {...field}
                        className="h-14 bg-input border-input-border rounded-xl text-base placeholder:text-form-placeholder"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-form-label text-base">
                      Business Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g Acme Corporation"
                        {...field}
                        className="h-14 bg-input border-input-border rounded-xl text-base placeholder:text-form-placeholder"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="businessAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-form-label text-base">
                    Business Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Address"
                      {...field}
                      className="h-14 bg-input border-input-border rounded-xl text-base placeholder:text-form-placeholder"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ownershipDocument"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel className="text-form-label text-base">
                    Ownership/Shareholding
                  </FormLabel>
                  <FormControl>
                    <div className="relative h-14 bg-input border border-input-border rounded-xl flex items-center px-4 cursor-pointer hover:bg-secondary transition-colors">
                      <span className="text-form-placeholder text-base flex-1 truncate">
                        {ownershipFileName ||
                          "Upload CAC Form 1.1 (for RC) or BN form (for business name)"}
                      </span>
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          onChange(e.target.files);
                          setOwnershipFileName(e.target.files?.[0]?.name || "");
                        }}
                        {...fieldProps}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-6 bg-card p-6 rounded-xl border border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-foreground">
                  Authorized Signatories
                </h3>
                {signatories.length === 0 && (
                  <span className="text-sm text-destructive">
                    * At least one signatory required
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FormLabel className="text-form-label text-sm">
                    Full Name
                  </FormLabel>
                  <Input
                    placeholder="e.g Johnson Maxwell"
                    value={newSignatory.name}
                    onChange={(e) =>
                      setNewSignatory({ ...newSignatory, name: e.target.value })
                    }
                    className="h-12 bg-background border-input-border rounded-lg text-base placeholder:text-form-placeholder"
                  />
                  {signatoryErrors.name && (
                    <p className="text-sm text-destructive">
                      {signatoryErrors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <FormLabel className="text-form-label text-sm">
                    Email
                  </FormLabel>
                  <Input
                    type="email"
                    placeholder="e.g m.johnson@gmail.com"
                    value={newSignatory.email}
                    onChange={(e) =>
                      setNewSignatory({
                        ...newSignatory,
                        email: e.target.value,
                      })
                    }
                    className="h-12 bg-background border-input-border rounded-lg text-base placeholder:text-form-placeholder"
                  />
                  {signatoryErrors.email && (
                    <p className="text-sm text-destructive">
                      {signatoryErrors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <FormLabel className="text-form-label text-sm">
                    Phone Number
                  </FormLabel>
                  <Input
                    placeholder="e.g 09046637882"
                    value={newSignatory.phone}
                    onChange={(e) =>
                      setNewSignatory({
                        ...newSignatory,
                        phone: e.target.value,
                      })
                    }
                    className="h-12 bg-background border-input-border rounded-lg text-base placeholder:text-form-placeholder"
                  />
                  {signatoryErrors.phone && (
                    <p className="text-sm text-destructive">
                      {signatoryErrors.phone}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <FormLabel className="text-form-label text-sm">
                    Upload Means of Identification
                  </FormLabel>
                  <div className="relative h-12 bg-background border border-input-border rounded-lg flex items-center px-4 cursor-pointer hover:bg-secondary transition-colors">
                    <span className="text-form-placeholder text-sm flex-1 truncate">
                      {newSignatory.document?.name || "-- Choose File --"}
                    </span>
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) =>
                        setNewSignatory({
                          ...newSignatory,
                          document: e.target.files?.[0] || null,
                        })
                      }
                    />
                  </div>
                  {signatoryErrors.document && (
                    <p className="text-sm text-destructive">
                      {signatoryErrors.document}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="button"
                onClick={handleAddSignatory}
                className="bg-primary/20 hover:bg-primary/30 text-primary border-none h-11 px-6 rounded-lg font-medium transition-colors"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                ADD Signatory
              </Button>

              {/* Signatories Table */}
              {signatories.length > 0 && (
                <div className="overflow-x-auto border border-border rounded-lg">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left p-4 text-sm font-medium text-form-label">
                          Signatory Name
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-form-label">
                          Phone Number
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-form-label">
                          Email Address
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-form-label">
                          ID
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-form-label">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {signatories.map((signatory) => (
                        <tr
                          key={signatory.id}
                          className="border-b border-border last:border-0 hover:bg-muted/30"
                        >
                          <td className="p-4 text-sm text-muted-foreground">
                            {signatory.name}
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {signatory.phone}
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {signatory.email}
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-primary font-medium">
                              {signatory.document?.name || "File Uploaded"}
                            </span>
                          </td>
                          <td className="p-4">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRemoveSignatory(signatory.id)
                              }
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-center pt-8">
              <Button
                type="submit"
                disabled={!isFormComplete || form.formState.isSubmitting}
                className="w-full max-w-md h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-medium rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {form.formState.isSubmitting ? "Processing..." : "Continue"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
