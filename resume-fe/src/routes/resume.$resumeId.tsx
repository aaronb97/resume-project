import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getResumesByIdOptions } from "../client/@tanstack/react-query.gen";
import { useRef, useState } from "react";
import {
  DocumentResponse,
  postResumesProcessRecommendations,
  postResumesRecommend,
} from "@/client";
import { ReccCard } from "@/components/ReccCard";
import { AiRecommendationExtended } from "@/types/AiRecommendationExtended";
import { ResumeActions } from "@/components/ResumeActions";
import { useSettingsStore } from "@/store/useSettingsStore";
import { RefreshCw, Upload } from "lucide-react";

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

  const { data: docData } = useQuery(
    getResumesByIdOptions({ path: { id: resumeId } })
  );

  async function getRecommendations(
    getRecommendationsDocData: DocumentResponse
  ) {
    setRecommendations(undefined);

    const response = await postResumesRecommend({
      body: {
        id: resumeId,
        jobDescription: getRecommendationsDocData.jobDescription,
        userNotes: getRecommendationsDocData.userNotes,
        mockData: useMockData,
      },
    });

    const recommendationsResponse = response.data;

    if (!recommendationsResponse) {
      alert("failed to get recs");
      return;
    }

    await postResumesProcessRecommendations({
      body: {
        id: resumeId,
        recommendations: recommendationsResponse.recommendations,
      },
    });

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
    getRecommendations(docData);
  }

  const iframeUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
    docData.signedUrl
  )}&embedded=true`;

  return (
    <div className="flex-1 flex flex-col gap-2">
      <div className="w-full flex gap-4 flex-1">
        <div className="flex-1">
          {recommendations && (
            <iframe
              ref={iframeRef}
              className="w-full h-full"
              src={iframeUrl}
            ></iframe>
          )}
        </div>

        <div className="flex-1 flex flex-col gap-1">
          <ResumeActions
            items={[
              {
                title: "Upload Another Resume",
                to: "/upload",
                icon: Upload,
              },
              {
                title: "Regenerate Recommendations",
                icon: RefreshCw,
                onClick: () => getRecommendations(docData),
              },
            ]}
          />

          <div className="relative w-full flex-1">
            <div className="overflow-y-auto absolute top-0 bottom-0 flex flex-col gap-2 w-full">
              {recommendations
                ?.filter((recc) => recc.text)
                .map((recc, i) => (
                  <ReccCard
                    onClick={() => {
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
    </div>
  );
}
