import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
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

  const { data, isFetching } = useQuery({
    ...postResumesRecommendOptions(queryOptions),
    staleTime: Infinity,
  });

  if (isFetching || !data) {
    return <div>Loading your recommendations...</div>;
  }

  return (
    <div>
      <Button
        onClick={() => {
          router.navigate({ to: "/upload" });
        }}
      >
        Start over
      </Button>

      {data.recommendations
        .filter((recc) => recc.text)
        .map((recc) => (
          <div className="mt-8" key={recc.text}>
            <p>{recc.text}</p>
            <p className="text-gray-500">{recc.rationale}</p>
          </div>
        ))}

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
  );
}
