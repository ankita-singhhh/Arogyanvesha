
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { PageContainer } from "@/components/layout/PageContainer";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  gender: z
    .enum(["male", "female", "other", "prefer_not_to_say"])
    .optional(),
});

type FormData = z.infer<typeof schema>;

const passSchema = z
  .object({
    currentPassword: z.string().min(8, "Required"),
    newPassword: z.string().min(8, "Must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PassFormData = z.infer<typeof passSchema>;

export default function AccountSettingsPage() {
  const { user, updateUser } = useAuthStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    },
  });

  const {
    register: registerPass,
    handleSubmit: handleSubmitPass,
    formState: {
      errors: passErrors,
      isSubmitting: isPassSubmitting,
    },
    reset: resetPass,
  } = useForm<PassFormData>({
    resolver: zodResolver(passSchema),
  });

  const onSubmit = async (data: FormData) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    updateUser(data);
    toast({ type: "success", title: "Profile updated" });
  };

  const onSubmitPass = async (_data: PassFormData) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    toast({ type: "success", title: "Password changed" });
    resetPass();
  };

  return (
    <PageContainer className="py-8 max-w-2xl mx-auto">
      <motion.div
        className="flex flex-col gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-h1 font-display font-bold text-text-heading">
          Account Settings
        </h1>

        {/* Avatar */}
        <div className="flex items-center gap-4 p-5 rounded-xl bg-surface-card border border-border-default">
          <Avatar
            name={user?.name ?? "User"}
            src={user?.avatarUrl}
            size="xl"
          />
          <div>
            <Button variant="secondary" size="sm">
              Change photo
            </Button>
            <p className="text-label text-text-muted mt-1.5">
              JPG, PNG. Max 2MB.
            </p>
          </div>
        </div>

        {/* Personal information */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 p-6 rounded-xl bg-surface-card border border-border-default"
        >
          <h3 className="text-h4 font-semibold text-text-heading mb-1">
            Personal Information
          </h3>

          <Input
            label="Full name"
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            label="Email address"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Phone number"
            type="tel"
            error={errors.phone?.message}
            {...register("phone")}
          />

          <Select
            label="Gender"
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
              { value: "prefer_not_to_say", label: "Prefer not to say" },
            ]}
            placeholder="Select gender"
            {...register("gender")}
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="self-start mt-2"
          >
            Save changes
          </Button>
        </form>

        {/* Password form */}
        <form
          onSubmit={handleSubmitPass(onSubmitPass)}
          className="flex flex-col gap-4 p-6 rounded-xl bg-surface-card border border-border-default"
        >
          <h3 className="text-h4 font-semibold text-text-heading mb-1">
            Change Password
          </h3>

          <Input
            label="Current password"
            type="password"
            error={passErrors.currentPassword?.message}
            {...registerPass("currentPassword")}
          />
          <Input
            label="New password"
            type="password"
            error={passErrors.newPassword?.message}
            {...registerPass("newPassword")}
          />
          <Input
            label="Confirm new password"
            type="password"
            error={passErrors.confirmPassword?.message}
            {...registerPass("confirmPassword")}
          />

          <Button
            type="submit"
            variant="secondary"
            isLoading={isPassSubmitting}
            className="self-start mt-2"
          >
            Update password
          </Button>
        </form>
      </motion.div>
    </PageContainer>
  );
}
