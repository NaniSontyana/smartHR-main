import { Card } from "@/components/ui/card";

export function WelcomeBanner({ userName, date }) {
  return (
    <Card className="relative overflow-hidden p-6 border-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 dark:from-violet-700 dark:via-purple-800 dark:to-indigo-900">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-10 -translate-x-10" />
      <div className="relative z-10">
        <p className="text-sm text-white/70 mb-2">{date}</p>
        <h1 className="text-2xl font-bold text-white mb-1">
          Hello, {userName}! 👋
        </h1>
        <p className="text-white/70">
          Track & manage your team progress here
        </p>
      </div>
    </Card>
  );
}

export default WelcomeBanner;
