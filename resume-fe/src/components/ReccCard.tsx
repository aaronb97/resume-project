import { AiRecommendation } from "@/client";
import { Card, CardContent } from "./ui/card";

interface Props {
  recc: AiRecommendation;
  active: boolean;
  onMouseEnter: () => void;
}

export function ReccCard({ recc, active, onMouseEnter }: Props) {
  return (
    <Card>
      <CardContent onMouseEnter={onMouseEnter}>
        <p>{recc.text}</p>
        {active && <p className="text-gray-500 text-xs">{recc.rationale}</p>}
      </CardContent>
    </Card>
  );
}
