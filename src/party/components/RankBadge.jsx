import Card from "../../../shared/ui/Card";
import Badge from "../../../shared/ui/Badge";

export default function RankBadge({ rank, total }) {
  const isWinning = rank <= 3;

  return (
    <Badge variant={isWinning ? "success" : "warning"}>
      #{rank} / {total}
    </Badge>
  );
}
