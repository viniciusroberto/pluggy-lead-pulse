import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NPSGaugeProps {
  score: number;
  satisfeitos: number; // Score 5
  neutros: number;     // Score 1-4
  distribuicao: Array<{ score: number; quantidade: number }>; // Distribuição de 1 a 5
}

export function NPSGauge({ score, satisfeitos, neutros, distribuicao }: NPSGaugeProps) {
  const total = satisfeitos + neutros;
  
  const data = [
    { name: 'Satisfeitos', value: satisfeitos, color: 'hsl(var(--success))' },
    { name: 'Neutros', value: neutros, color: 'hsl(var(--warning))' },
  ].filter(item => item.value > 0);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-danger';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 50) return 'Bom';
    return 'Precisa Melhorar';
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
        <CardTitle>Avaliação Clientes</CardTitle>
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
        
        {/* Legenda com barras clean - similar ao Status de Validação */}
        <div className="grid grid-cols-5 gap-4 mt-4 pt-4 border-t">
          {distribuicao.map((item) => (
            <div key={item.score} className="text-center">
              <div 
                className="w-3 h-3 rounded-full mx-auto mb-1"
                style={{ 
                  backgroundColor: item.score === 5 ? '#10B981' : 
                                 item.score >= 3 ? '#F59E0B' : '#EF4444'
                }}
              ></div>
              <p className="text-sm font-medium">{item.quantidade}</p>
              <p className="text-xs text-muted-foreground">Score {item.score}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}