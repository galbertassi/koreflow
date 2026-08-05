export type PlanType = "Free" | "Pro" | "Business";

export interface PlanLimits {
  name: PlanType;
  maxUsers: number;
  maxDemandsPerMonth: number;
  hasUnlimitedDemands: boolean;
  aiFeatures: "Limited" | "Full";
  canExportPDF: boolean;
  hasAdvancedReports: boolean;
  canUseTags: boolean;
  canUploadAttachments: boolean;
  customBranding: boolean;
}

export const PLANS: Record<PlanType, PlanLimits> = {
  Free: {
    name: "Free",
    maxUsers: 1,
    maxDemandsPerMonth: 50,
    hasUnlimitedDemands: false,
    aiFeatures: "Limited",
    canExportPDF: false,
    hasAdvancedReports: false,
    canUseTags: false, // Historicamente liberado, deixarei como true por enquanto caso quebre algo ou false se o design demandar
    canUploadAttachments: false,
    customBranding: false,
  },
  Pro: {
    name: "Pro",
    maxUsers: 1, // ou número acordado (pode ser ilimitado, mas business é multi-user)
    maxDemandsPerMonth: 999999,
    hasUnlimitedDemands: true,
    aiFeatures: "Full",
    canExportPDF: true,
    hasAdvancedReports: false,
    canUseTags: true,
    canUploadAttachments: true,
    customBranding: false,
  },
  Business: {
    name: "Business",
    maxUsers: 999999, // Múltiplos usuários
    maxDemandsPerMonth: 999999,
    hasUnlimitedDemands: true,
    aiFeatures: "Full",
    canExportPDF: true,
    hasAdvancedReports: true,
    canUseTags: true,
    canUploadAttachments: true,
    customBranding: true,
  },
};
