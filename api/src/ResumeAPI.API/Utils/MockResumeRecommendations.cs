namespace ResumeAPI.Utils;

using ResumeAPI.Models;

public static class MockResumeRecommendations
{
    public static readonly ResumeAiResponse Response = new ResumeAiResponse
    {
        Recommendations = new[]
        {
            new AiRecommendation
            {
                LineNum = 2,
                Text = "Optimized SQL queries reducing page‑load time by 35%.",
                Rationale = "Quantifies performance impact.",
            },
            new AiRecommendation
            {
                LineNum = 4,
                Text = "Integrated CI/CD pipeline with GitHub Actions.",
                Rationale = "Shows automation experience.",
            },
            new AiRecommendation
            {
                LineNum = 6,
                Text = "Migrated legacy APIs to .NET 8 increasing reliability.",
                Rationale = "Highlights modernization skills.",
            },
            new AiRecommendation
            {
                LineNum = 8,
                Text = "Implemented feature‑flag system enabling safe rollouts.",
                Rationale = "Demonstrates risk mitigation.",
            },
            new AiRecommendation
            {
                LineNum = 10,
                Text = "Reduced AWS costs by 28% via right‑sizing instances.",
                Rationale = "Displays cost awareness.",
            },
            new AiRecommendation
            {
                LineNum = 12,
                Text = "Built real‑time notifications with WebSockets.",
                Rationale = "Emphasizes user experience.",
            },
            new AiRecommendation
            {
                LineNum = 14,
                Text = "Added Sentry error tracking cutting mean‑time‑to‑detect.",
                Rationale = "Shows quality focus.",
            },
            new AiRecommendation
            {
                LineNum = 16,
                Text = "Refactored React codebase to TanStack Query.",
                Rationale = "Highlights modern front‑end patterns.",
            },
            new AiRecommendation
            {
                LineNum = 18,
                Text = "Led accessibility audit achieving WCAG 2.1 AA.",
                Rationale = "Illustrates inclusivity commitment.",
            },
            new AiRecommendation
            {
                LineNum = 20,
                Text = "Developed Slack bot to automate on‑call rotations.",
                Rationale = "Shows DevOps initiative.",
            },
            new AiRecommendation
            {
                LineNum = 22,
                Text = "Implemented domain‑driven design in new services.",
                Rationale = "Demonstrates architectural rigor.",
            },
            new AiRecommendation
            {
                LineNum = 24,
                Text = "Conducted load testing to 10k RPS with k6.",
                Rationale = "Indicates scalability validation.",
            },
            new AiRecommendation
            {
                LineNum = 26,
                Text = "Introduced GraphQL gateway unifying data access.",
                Rationale = "Shows API design expertise.",
            },
            new AiRecommendation
            {
                LineNum = 28,
                Text = "Created design‑system library with Storybook.",
                Rationale = "Highlights UI consistency.",
            },
            new AiRecommendation
            {
                LineNum = 30,
                Text = "Configured Azure AD SSO improving security posture.",
                Rationale = "Displays security knowledge.",
            },
            new AiRecommendation
            {
                LineNum = 32,
                Text = "Mentored three junior engineers through code reviews.",
                Rationale = "Shows leadership.",
            },
            new AiRecommendation
            {
                LineNum = 34,
                Text = "Implemented feature analytics with PostHog.",
                Rationale = "Demonstrates data‑driven approach.",
            },
            new AiRecommendation
            {
                LineNum = 36,
                Text = "Optimized images with AVIF reducing bundle size 15%.",
                Rationale = "Quantifies front‑end optimization.",
            },
            new AiRecommendation
            {
                LineNum = 38,
                Text = "Automated infra provisioning with Terraform.",
                Rationale = "Highlights IaC skills.",
            },
            new AiRecommendation
            {
                LineNum = 40,
                Text = "Wrote ADRs establishing decision‑making history.",
                Rationale = "Shows documentation discipline.",
            },
        },
    };
}
