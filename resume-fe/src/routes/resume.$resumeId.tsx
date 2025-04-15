import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  postResumesRecommendOptions,
  postResumesRecommendQueryKey,
} from "../client/@tanstack/react-query.gen";

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
      <button
        onClick={() => {
          router.navigate({ to: "/upload" });
        }}
      >
        Start over
      </button>
      {data.recommendations.map((recc) => (
        <div style={{ marginTop: "8px" }}>
          <p>{recc.text}</p>
          <p style={{ color: "gray", fontSize: "12px" }}>{recc.rationale}</p>
        </div>
      ))}
      <button
        onClick={() => {
          queryClient.invalidateQueries({
            queryKey: postResumesRecommendQueryKey(queryOptions),
          });
        }}
      >
        Try Again
      </button>
    </div>
  );
}
