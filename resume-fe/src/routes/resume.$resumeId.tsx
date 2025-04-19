import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getResumesByIdOptions } from "../client/@tanstack/react-query.gen";
import { useRef, useState } from "react";
import {
  AiRecommendation,
  postResumesProcessRecommendations,
  postResumesRecommend,
} from "@/client";
import { ReccCard } from "@/components/ReccCard";
import { AiRecommendationExtended } from "@/types/AiRecommendationExtended";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Download, FileText, RefreshCw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobDescriptionUserNotesDialog } from "@/components/JobDescriptionUserNotesDialog";
import { IconTooltipButton } from "@/components/IconTooltipButton";

export const Route = createFileRoute("/resume/$resumeId")({
  component: RouteComponent,
});

let initialProcessed = false;

function RouteComponent() {
  const { resumeId } = Route.useParams();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const { useMockData } = useSettingsStore();

  const [recommendations, setRecommendations] =
    useState<AiRecommendationExtended[]>();
  const [activeCard, setActiveCard] = useState(0);
  const [isStale, setIsStale] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const { data: docData } = useQuery(
    getResumesByIdOptions({ path: { id: resumeId } })
  );

  async function applyRecommendations(recommendations: AiRecommendation[]) {
    setIsLoadingPreview(true);

    await postResumesProcessRecommendations({
      body: {
        id: resumeId,
        recommendations,
      },
    });

    setIsLoadingPreview(false);
    setIsStale(false);
  }

  async function getRecommendations() {
    setRecommendations(undefined);

    const response = await postResumesRecommend({
      body: {
        id: resumeId,
        mockData: useMockData,
      },
    });

    const recommendationsResponse = response.data;

    if (!recommendationsResponse) {
      alert("failed to get recs");
      return;
    }

    await applyRecommendations(recommendationsResponse.recommendations);

    setRecommendations(
      recommendationsResponse.recommendations.map((recc) => ({
        ...recc,
        included: true,
      }))
    );
  }

  if (!docData) return null;

  if (!initialProcessed) {
    initialProcessed = true;
    getRecommendations();
  }

  const iframeUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
    docData.signedUrl
  )}&embedded=true`;

  const actions = [
    {
      label: "Upload Another Resume",
      icon: Upload,
      to: "/upload",
    },
    {
      label: "Regenerate Recommendations",
      icon: RefreshCw,
      onClick: () => getRecommendations(),
    },
    {
      label: "Update Job Description / User Notes",
      icon: FileText,
      onClick: () => setOpenDialog(true),
    },
  ] as const;

  return (
    <div className="flex-1 flex flex-col gap-2">
      <div className="w-full flex gap-4 flex-1">
        <div className="flex-1 flex flex-col gap-2 items-center">
          {recommendations && (
            <>
              {isLoadingPreview ? (
                <div className="h-full">Loading preview...</div>
              ) : (
                <iframe
                  ref={iframeRef}
                  className="w-full h-full"
                  src={iframeUrl}
                ></iframe>
              )}

              {isStale ? (
                <Button
                  onClick={() =>
                    applyRecommendations(
                      recommendations.filter((recc) => recc.included)
                    )
                  }
                  disabled={isLoadingPreview}
                >
                  <RefreshCw /> Regenerate Preview
                </Button>
              ) : (
                <Button asChild className="w-36">
                  <a href={docData.signedUrl} download="Your Optimized Resume">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </Button>
              )}
            </>
          )}
        </div>

        <div className="flex-1 flex flex-col gap-1">
          <div className="flex gap-2">
            {actions.map(({ label, icon, ...rest }) => (
              <IconTooltipButton
                key={label}
                label={label}
                icon={icon}
                {...rest}
              />
            ))}
          </div>

          <div className="relative w-full flex-1">
            <div className="overflow-y-auto absolute top-0 bottom-0 flex flex-col gap-2 w-full">
              {recommendations
                ?.filter((recc) => recc.text)
                .map((recc, i) => (
                  <ReccCard
                    onClick={() => {
                      setIsStale(true);

                      setRecommendations(
                        recommendations.map((nextRecc) => {
                          if (nextRecc.lineNum !== recc.lineNum)
                            return nextRecc;

                          return {
                            ...nextRecc,
                            included: !nextRecc.included,
                          };
                        })
                      );
                    }}
                    included={recc.included}
                    recc={recc}
                    key={recc.text}
                    active={activeCard === i}
                    onMouseEnter={() => setActiveCard(i)}
                  />
                )) ?? <>Loading your recommendations...</>}
            </div>
          </div>
        </div>
      </div>

      <JobDescriptionUserNotesDialog
        open={openDialog}
        onOpenChange={() => setOpenDialog(false)}
        onSave={() => {
          setOpenDialog(false);
          getRecommendations();
        }}
      />
    </div>
  );
}
