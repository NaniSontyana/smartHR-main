import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function UpgradeCard() {
  return (
    <Card className="relative overflow-hidden p-6 border-0 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 dark:from-amber-500 dark:via-orange-600 dark:to-rose-600">
      <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
      <div className="absolute bottom-4 right-4 w-16 h-16 bg-white/5 rounded-full" />
      <div className="relative z-10">
        <h3 className="text-lg font-semibold text-white mb-2">
          Unlock New Features!
        </h3>
        <p className="text-sm text-white/80 mb-4 max-w-[200px]">
          Dive into our advanced analytics and customize reports - designed to streamline your HR tasks.
        </p>
        <Button className="bg-white text-orange-600 hover:bg-white/90 font-semibold">
          Upgrade Now
        </Button>
      </div>
    </Card>
  );
}

export default UpgradeCard;
