import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FunnelData {
  stage: string;
  count: number;
  rate: number;
}

interface FunnelChartProps {
  data: FunnelData[];
  onStageClick?: (stage: string) => void;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--danger))',
  'hsl(var(--accent))',
];

export function FunnelChart({ data, onStageClick }: FunnelChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-md">
          <p className="font-semibold">{label}</p>
          <p className="text-primary">
            Leads: <span className="font-semibold">{data.count}</span>
          </p>
          <p className="text-muted-foreground">
            Taxa: <span className="font-semibold">{data.rate.toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Funil de Qualificação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            layout="horizontal"
            margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="stage" width={80} />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="count" 
              onClick={(data) => onStageClick?.(data.stage)}
              className="cursor-pointer"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        <div className="mt-4 grid grid-cols-5 gap-2">
          {data.map((stage, index) => (
            <div key={stage.stage} className="text-center">
              <div 
                className="w-4 h-4 rounded mx-auto mb-1"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <p className="text-xs text-muted-foreground">{stage.stage}</p>
              <p className="text-sm font-semibold">{stage.rate.toFixed(1)}%</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}