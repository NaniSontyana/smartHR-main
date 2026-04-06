import { Card } from "@/components/ui/card";

export function PredictionFormSection({ title, icon: Icon, children, className = "" }) {
  return (
    <Card className={`p-6 card-shadow ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        {Icon && (
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </Card>
  );
}

export default PredictionFormSection;
