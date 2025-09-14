import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NPSGaugeProps {
  score: number;
  promoters: number;
  passives: number;
  detractors: number;
}

export function NPSGauge({ score, promoters, passives, detractors }: NPSGaugeProps) {
  const total = promoters + passives + detractors;
  
  const data = [
    { name: 'Promotores', value: promoters, color: 'hsl(var(--success))' },
    { name: 'Passivos', value: passives, color: 'hsl(var(--warning))' },
    { name: 'Detratores', value: detractors, color: 'hsl(var(--danger))' },
  ].filter(item => item.value > 0);

  const getScoreColor = (score: number) => {
    if (score >= 50) return 'text-success';
    if (score >= 0) return 'text-warning';
    return 'text-danger';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 50) return 'Excelente';
    if (score >= 0) return 'Zona de Melhoria';
    return 'Crítico';
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';
      return (
        <div className="bg-background border rounded-lg p-3 shadow-md">
          <p className="font-semibold">{data.name}</p>
          <p className="text-primary">
            {data.value} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Net Promoter Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-center space-y-2">
            <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
              {score.toFixed(0)}
            </div>
            <div className="text-sm text-muted-foreground">
              {getScoreLabel(score)}
            </div>
            <div className="text-xs text-muted-foreground">
              {total} respostas
            </div>
          </div>
          
          {total > 0 && (
            <div className="flex-1 max-w-[200px]">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-success">{promoters}</div>
            <div className="text-xs text-muted-foreground">Promotores</div>
            <div className="text-xs text-success">Score 9-10</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-warning">{passives}</div>
            <div className="text-xs text-muted-foreground">Passivos</div>
            <div className="text-xs text-warning">Score 7-8</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-danger">{detractors}</div>
            <div className="text-xs text-muted-foreground">Detratores</div>
            <div className="text-xs text-danger">Score 0-6</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}