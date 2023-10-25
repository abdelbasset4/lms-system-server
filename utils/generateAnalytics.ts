import { Document, Model } from "mongoose";

interface AnalyticsData {
  month: string;
  count: number;
}

export const generateAnalytics = async <T extends Document>(
  model: Model<T>
): Promise<{ Last12Month: AnalyticsData[] }> => {
  const last12Months :AnalyticsData[]= [];
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() +1);
  for (let i = 11; i >=0; i--) {
    const endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() ,
        currentDate.getDate() - i *28
    )
    const startDate = new Date(
        endDate.getFullYear(),
        endDate.getMonth() ,
        endDate.getDate() - 28
    )
    const monthAndYear = endDate.toLocaleString("default", { day:"numeric",month: "short",year:"numeric" });
    const count = await model.countDocuments({
        createdAt: {
            $gte: startDate,
            $lte: endDate,
        },
    });
    last12Months.push({
        month: monthAndYear,
        count,
    });

    // const year = currentDate.getFullYear();
    
  }
  return { Last12Month: last12Months };
};
