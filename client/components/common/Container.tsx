import { cn } from "@/lib/utils";

interface iAppProps {
  children: React.ReactNode;
  className?: string;
}

const Container = ({ children, className }: iAppProps) => {
  return <div className={cn("px-6", className)}>{children}</div>;
};

export default Container;
