import React from "react";
import { motion } from "motion/react";
import { Card, CardContent } from "../ui/card";
import { Tilt } from "../ui/tilt";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "../ui/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  // accept any component or element type for icons (covers lucide icons and our glyph)
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  index?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  className,
  index = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Tilt className={cn("overflow-hidden relative group", className)}>
  <Card className="h-full">
        {/* Gradient Overlay on Hover */}
    <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <CardContent className="p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-muted-foreground text-sm mb-1">{title}</p>
              <motion.h3
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: index * 0.1 + 0.2,
                  type: "spring",
                  stiffness: 200,
                }}
                className="mt-1"
              >
                {value}
              </motion.h3>
              {trend && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="flex items-center gap-1 mt-2"
                >
                  {trend.isPositive ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <p
                    className={cn(
                      "text-sm font-medium",
                      trend.isPositive ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {trend.isPositive ? "+" : ""}
                    {trend.value}%
                  </p>
                  <span className="text-xs text-muted-foreground ml-1">
                    vs last month
                  </span>
                </motion.div>
              )}
            </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.25 }}
                className="rounded-full bg-linear-to-br from-primary/20 to-primary/5 p-2 w-9 h-9 flex items-center justify-center shadow-sm"
                style={{ transformOrigin: "center" }}
              >
                <Icon className="h-4 w-4 text-primary" />
              </motion.div>
          </div>
          </CardContent>
        </Card>
      </Tilt>
    </motion.div>
  );
};
