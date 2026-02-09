import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  href?: string;
}

const StatsCard = ({
  title,
  value,
  description,
  icon,
  href,
}: StatsCardProps) => {
  return (
    <Card className={"overflow-hidden relative bg-white/95 shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300"}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="w-4 h-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
      <Link
        to={href!}
        className="absolute inset-0"
        aria-label={`View ${title} details`}
      />
    </Card>
  );
}

export default StatsCard;
