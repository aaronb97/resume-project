import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  getResumesByIdOptions,
  getResumesByIdQueryKey,
} from "../client/@tanstack/react-query.gen";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getResumesByIdRecommendations,
  postResumesProcessRecommendations,
} from "@/client";
import { ReccCard } from "@/components/ReccCard";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Download, FileText, RefreshCw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobDescriptionUserNotesDialog } from "@/components/JobDescriptionUserNotesDialog";
import { IconTooltipButton } from "@/components/IconTooltipButton";
import { useStream } from "@/hooks/useStream";
import { Options } from "@hey-api/client-fetch";

export const Route = createFileRoute("/resume/$resumeId")({
  component: RouteComponent,
});

interface AiRecommendation {
  lineNum: number;
  text: string;
  rationale: string;
}

interface AiRecommendationParsed extends AiRecommendation {
  included: boolean;
}

interface StreamResult {
  recommendations: AiRecommendation[];
}

function RouteComponent() {
  const queryClient = useQueryClient();
  const { resumeId } = Route.useParams();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const { useMockData, viewer } = useSettingsStore();

  const [recommendations, setRecommendations] =
    useState<AiRecommendationParsed[]>();

  const [isStale, setIsStale] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const { data: docData } = useQuery(
    getResumesByIdOptions({ path: { id: resumeId } })
  );

  const streamFn = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (options: Options<any>) =>
      getResumesByIdRecommendations({
        ...options,
        path: { id: resumeId },
        query: { mockData: useMockData },
      }),
    [resumeId, useMockData]
  );

  const { data: _data, loading, refetch } = useStream(streamFn);

  const [previousLoading, setPreviousLoading] = useState(false);

  const data = _data as StreamResult;

  useEffect(() => {
    if (!data) return;

    setRecommendations(
      data.recommendations?.map((recc) => ({
        included: true,
        ...recc,
      }))
    );
  }, [data]);

  const applyRecommendations = useCallback(
    async (recommendations: AiRecommendationParsed[]) => {
      setIsLoadingPreview(true);

      await postResumesProcessRecommendations({
        body: {
          id: resumeId,
          recommendations,
        },
      });

      await queryClient.invalidateQueries({
        queryKey: getResumesByIdQueryKey({ path: { id: resumeId } }),
      });

      setIsLoadingPreview(false);
      setIsStale(false);
    },
    [queryClient, resumeId]
  );

  if (!loading && previousLoading && recommendations) {
    applyRecommendations(recommendations.filter((recc) => recc.included));
    setPreviousLoading(false);
  }

  if (loading != previousLoading) {
    setPreviousLoading(loading);
  }

  async function getRecommendations() {
    refetch();
  }

  if (!docData) return null;

  const iframeUrl =
    viewer === "microsoft"
      ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
          docData.signedUrl
        )}`
      : `https://docs.google.com/gview?url=${encodeURIComponent(
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
        <div className="flex-1 flex flex-col gap-2 items-center bg-stone-900/50 rounded-lg p-4 border">
          {recommendations && (
            <>
              {isLoadingPreview || loading ? (
                <div className="h-full">Loading preview...</div>
              ) : (
                <iframe
                  ref={iframeRef}
                  className="w-full h-full"
                  src={iframeUrl}
                />
              )}

              {isStale ? (
                <Button
                  variant="secondary"
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
                <Button asChild className="w-36" variant="secondary">
                  <a href={docData.signedUrl} download="Your Optimized Resume">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </Button>
              )}
            </>
          )}
        </div>

        <div className="flex-1 flex flex-col gap-1 bg-stone-900/50 rounded-2xl px-4 py-2 border-1">
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
                .map((recc) => (
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
                    key={recc.lineNum}
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
