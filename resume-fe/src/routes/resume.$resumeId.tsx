import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  getResumesByIdOptions,
  postResumesRecommendOptions,
  postResumesRecommendQueryKey,
} from "../client/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/resume/$resumeId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { resumeId } = Route.useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const queryOptions = {
    body: { id: resumeId, jobDescription: "Senior developer" },
  };

  const { data: reccData } = useQuery({
    ...postResumesRecommendOptions(queryOptions),
    staleTime: Infinity,
  });

  const { data: docData } = useQuery(
    getResumesByIdOptions({ path: { id: resumeId } })
  );

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
          <iframe className="w-full h-full" src={iframeUrl}></iframe>
        </div>

        <div className="flex-1">
          {reccData?.recommendations
            .filter((recc) => recc.text)
            .map((recc) => (
              <div className="mt-4" key={recc.text}>
                <p>{recc.text}</p>
                <p className="text-gray-500 text-xs">{recc.rationale}</p>
              </div>
            )) ?? <>Loading your reccomendations...</>}

          <Button
            onClick={() => {
              queryClient.invalidateQueries({
                queryKey: postResumesRecommendQueryKey(queryOptions),
              });
            }}
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
