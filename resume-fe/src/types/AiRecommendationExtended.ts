import { AiRecommendation } from "@/client";

export type AiRecommendationExtended = AiRecommendation & {
  included: boolean;
};
