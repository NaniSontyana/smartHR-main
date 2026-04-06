import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ScheduleWidget({ events }) {
  const [currentDate] = useState(new Date(2027, 5, 15)); // June 2027

  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  // Generate calendar days
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1).getDay();
  const days = [];

  // Previous month days
  const prevMonthDays = new Date(year, currentDate.getMonth(), 0).getDate();
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    days.push({ day: prevMonthDays - i, isCurrentMonth: false });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isCurrentMonth: true, isToday: i === 15 });
  }

  // Next month days
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({ day: i, isCurrentMonth: false });
  }

  return (
    <Card className="p-5 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Schedule</h3>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
          See All
        </Button>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-3">
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          {monthName} {year}
        </span>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-1 text-muted-foreground font-medium">
            {day}
          </div>
        ))}
        {days.slice(0, 35).map((day, index) => (
          <div
            key={index}
            className={`py-1.5 rounded-md cursor-pointer transition-colors ${
              day.isToday
                ? "bg-primary text-primary-foreground font-semibold"
                : day.isCurrentMonth
                ? "text-foreground hover:bg-muted"
                : "text-muted-foreground/50"
            }`}
          >
            {day.day}
          </div>
        ))}
      </div>

      {/* Events */}
      <div className="border-t border-border pt-4">
        <h4 className="font-semibold text-sm text-foreground mb-3">
          {monthName} {year}
        </h4>
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="flex items-start gap-3">
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {event.time}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {event.title}
                </p>
                <p className={`text-xs ${event.color === "primary" ? "text-primary" : "text-secondary"}`}>
                  {event.category}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default ScheduleWidget;
