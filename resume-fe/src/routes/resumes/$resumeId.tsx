import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, LinkProps } from "@tanstack/react-router";
import {
  getResumesByIdOptions,
  getResumesByIdQueryKey,
} from "../../client/@tanstack/react-query.gen";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getResumesByIdRecommendations,
  postResumesProcessRecommendations,
} from "@/client";
import { useSettingsStore } from "@/store/useSettingsStore";
import {
  Download,
  FileText,
  LucideIcon,
  RefreshCw,
  Strikethrough,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobDescriptionUserNotesDialog } from "@/components/JobDescriptionUserNotesDialog";
import { IconTooltipButton } from "@/components/IconTooltipButton";
import { useStream } from "@/hooks/useStream";
import { Options } from "@hey-api/client-fetch";
import { Skeleton } from "@/components/ui/skeleton";
import { ReccCard } from "@/components/ReccCard";

export const Route = createFileRoute("/resumes/$resumeId")({
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

  const { useMockData, viewer, toggleShowRemovedText, showRemovedText } =
    useSettingsStore();

  const [recommendations, setRecommendations] =
    useState<AiRecommendationParsed[]>();

  const [isStale, setIsStale] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [previousLoading, setPreviousLoading] = useState(false);

  const { data: docData } = useQuery(
    getResumesByIdOptions({ path: { id: resumeId } }),
  );

  const streamFn = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (options: Options<any>) =>
      getResumesByIdRecommendations({
        ...options,
        path: { id: resumeId },
        query: { mockData: useMockData },
      }),
    [resumeId, useMockData],
  );

  const { data: _data, loading, refetch } = useStream(streamFn);
  const data = _data as StreamResult;

  useEffect(() => {
    if (!data) return;
    setRecommendations(
      data.recommendations?.map((recc) => ({ included: true, ...recc })),
    );
  }, [data]);

  const applyRecommendations = useCallback(
    async (reccs: AiRecommendationParsed[]) => {
      setIsLoadingPreview(true);
      await postResumesProcessRecommendations({
        body: { id: resumeId, recommendations: reccs },
      });

      await queryClient.invalidateQueries({
        queryKey: getResumesByIdQueryKey({ path: { id: resumeId } }),
      });

      setIsLoadingPreview(false);
      setIsStale(false);
    },
    [queryClient, resumeId],
  );

  if (!loading && previousLoading && recommendations) {
    applyRecommendations(recommendations.filter((r) => r.included));
    setPreviousLoading(false);
  }

  if (loading !== previousLoading) setPreviousLoading(loading);

  const handleToggle = useCallback((lineNum: number) => {
    setIsStale(true);
    setRecommendations((prev) =>
      prev?.map((r) =>
        r.lineNum === lineNum ? { ...r, included: !r.included } : r,
      ),
    );
  }, []);

  if (!docData) return null;

  const iframeUrl =
    viewer === "microsoft"
      ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
          docData.signedUrl,
        )}`
      : `https://docs.google.com/gview?url=${encodeURIComponent(
          docData.signedUrl,
        )}&embedded=true`;

  const actions: {
    label: string;
    icon: LucideIcon;
    to?: LinkProps["to"];
    onClick?: () => void;
  }[] = [
    { label: "Upload Another Resume", icon: Upload, to: "/resumes/upload" },
    {
      label: "Regenerate Recommendations",
      icon: RefreshCw,
      onClick: () => refetch(),
    },
    {
      label: "Update Job Description / User Notes",
      icon: FileText,
      onClick: () => setOpenDialog(true),
    },
  ];

  return (
    <div className="flex-1 flex flex-col gap-2">
      <div className="w-full flex gap-4 flex-1">
        <div className="flex-1 flex flex-col gap-2 items-center bg-stone-900/50 rounded-lg p-4 border">
          {recommendations && (
            <>
              {isLoadingPreview || loading ? (
                <Skeleton className="w-full h-full rounded-md" />
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
                      recommendations.filter((r) => r.included),
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
          <div className="flex justify-between w-full mb-2">
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

            <IconTooltipButton
              label="Toggle Removed Text Visibility"
              onClick={toggleShowRemovedText}
              icon={Strikethrough}
              variant={showRemovedText ? "default" : "ghost"}
            />
          </div>

          <div className="relative w-full flex-1">
            <div className="overflow-y-auto absolute inset-0 flex flex-col-reverse gap-2 w-full">
              {recommendations
                ?.filter((r) => r.text)
                .slice()
                .reverse()
                .map((r) => (
                  <ReccCard
                    originalText={
                      docData.resumeParts.find(
                        (part) => part.lineNumber === r.lineNum,
                      )?.text ?? ""
                    }
                    key={r.lineNum}
                    lineNum={r.lineNum}
                    text={r.text}
                    rationale={r.rationale}
                    included={r.included}
                    onToggleIncluded={handleToggle}
                    loading={loading}
                  />
                )) ?? null}
            </div>
          </div>
        </div>
      </div>

      <JobDescriptionUserNotesDialog
        open={openDialog}
        onOpenChange={() => setOpenDialog(false)}
        onSave={() => {
          setOpenDialog(false);
          refetch();
        }}
      />
    </div>
  );
}
