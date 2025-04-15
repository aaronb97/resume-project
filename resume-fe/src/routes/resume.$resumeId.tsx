import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { postResumesRecommendOptions } from "../client/@tanstack/react-query.gen";

export const Route = createFileRoute("/resume/$resumeId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { resumeId } = Route.useParams();

  const { data, isLoading } = useQuery({
    ...postResumesRecommendOptions({
      body: { id: resumeId, jobDescription: "Senior developer" },
    }),
    staleTime: Infinity,
  });

  if (isLoading || !data) {
    return <div>Loading your recommendations...</div>;
  }

  return (
    <div>
      {data.recommendations.map((recc) => (
        <div style={{ marginTop: "8px" }}>
          <p>{recc.text}</p>
          <p style={{ color: "gray", fontSize: "12px" }}>{recc.rationale}</p>
        </div>
      ))}
    </div>
  );
}
