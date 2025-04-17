import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { getResumesByIdOptions } from "../client/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import {
  AiRecommendation,
  postResumesProcessRecommendations,
  postResumesRecommend,
} from "@/client";
import { ReccCard } from "@/components/ReccCard";

export const Route = createFileRoute("/resume/$resumeId")({
  component: RouteComponent,
});

let initialProcessed = false;

function RouteComponent() {
  const { resumeId } = Route.useParams();
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const queryOptions = {
    body: { id: resumeId, jobDescription: "Senior developer" },
  };

  const [recommendations, setRecommendations] = useState<AiRecommendation[]>();
  const [activeCard, setActiveCard] = useState(0);

  const { data: docData } = useQuery(
    getResumesByIdOptions({ path: { id: resumeId } })
  );

  function getRecommendations() {
    setRecommendations(undefined);

    postResumesRecommend(queryOptions).then((response) => {
      const recommendationsResponse = response.data;
      if (!recommendationsResponse) {
        alert("failed to get recs");
        return;
      }

      postResumesProcessRecommendations({
        body: {
          id: resumeId,
          recommendations: recommendationsResponse.recommendations,
        },
      }).then(() => {
        setRecommendations(response.data?.recommendations);
      });
    });
  }

  if (!initialProcessed) {
    initialProcessed = true;
    getRecommendations();
  }

  if (!docData) return null;

  const iframeUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
    docData.signedUrl
  )}&embedded=true`;

  return (
    <div className="h-full flex flex-col gap-2">
      <div>
        <Button
          onClick={() => {
            router.navigate({ to: "/upload" });
          }}
        >
          Start over
        </Button>
      </div>

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

        <div className="relative h-full flex-1">
          <div className="overflow-y-auto absolute top-0 bottom-0 flex flex-col gap-2">
            {recommendations
              ?.filter((recc) => recc.text)
              .map((recc, i) => (
                <ReccCard
                  recc={recc}
                  key={recc.text}
                  active={activeCard === i}
                  onMouseEnter={() => setActiveCard(i)}
                />
              )) ?? <>Loading your recommendations...</>}

            <Button
              onClick={() => {
                getRecommendations();
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
