"use client";

import { Calendar, Upload } from "lucide-react";
import { Button } from "@evolt/components/ui/button";
import { Input } from "@evolt/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@evolt/components/ui/select";
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

const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[0-9+\-\s()]+$/, "Please enter a valid phone number"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  phoneNumber2: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[0-9+\-\s()]+$/, "Please enter a valid phone number"),
  identification: z.string().min(1, "Please select a means of identification"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  document: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "Please upload a document")
    .refine(
      (files) => files[0]?.size <= 5000000,
      "File size must be less than 5MB"
    ),
});

type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

export const PersonalInformation = () => {
  const { push } = useRouter();
  const [fileName, setFileName] = useState<string>("");

  const form = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      dateOfBirth: "",
      phoneNumber2: "",
      identification: "",
      address: "",
    },
    mode: "onChange", // Validate on change for immediate feedback
  });

  const onSubmit = (data: PersonalInfoFormValues) => {
    console.log(data);
    push("/sme-portal/onboarding/kyb");
  };

  return (
    <div className="bg-background p-3 lg:p-6">
      <div className="mx-auto">
        <StepIndicator currentStep={1} />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-form-label text-base">
                      First Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g John"
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
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-form-label text-base">
                      Last Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g Doe"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-form-label text-base">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="e.g john.doe@example.com"
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
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-form-label text-base">
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g 09046637882"
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
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-form-label text-base">
                      Date of Birth
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="date"
                          {...field}
                          className="h-14 bg-input border-input-border rounded-xl text-base placeholder:text-form-placeholder"
                        />
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-form-label text-base">
                      Alternate Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g 09063528912"
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
                name="identification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-form-label text-base">
                      Mean of Identification
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-14 bg-input border-input-border rounded-xl text-base">
                          <SelectValue placeholder="-- Drivers License --" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border-input-border">
                        <SelectItem value="drivers-license">
                          Drivers License
                        </SelectItem>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="national-id">National ID</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="document"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel className="text-form-label text-base">
                      Upload Document
                    </FormLabel>
                    <FormControl>
                      <div className="relative h-14 bg-input border border-input-border rounded-xl flex items-center px-4 cursor-pointer hover:bg-secondary transition-colors">
                        <span className="text-form-placeholder text-base flex-1 truncate">
                          {fileName || "-- Choose File --"}
                        </span>
                        <Upload className="w-5 h-5 text-muted-foreground" />
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => {
                            onChange(e.target.files);
                            setFileName(e.target.files?.[0]?.name || "");
                          }}
                          {...fieldProps}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-form-label text-base">
                    Resident Address
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

            <div className="flex justify-center pt-8">
              <Button
                type="submit"
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
                }
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
