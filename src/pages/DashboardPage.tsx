import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBalance } from '@/hooks/useBalance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  ChartNoAxesCombined,
  TrendingUp,
  Wallet,
  Users,
  Gift,
  LogOut,
  Copy,
  RefreshCw,
  Bell,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const referralCode = 'ELITE123';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { balanceData, simulateUpdate } = useBalance();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('inicio');
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralCode);
    toast({ title: '¡Copiado!', description: 'Código de referido copiado', variant: 'success' });
  };

  const handleSimulateUpdate = () => {
    simulateUpdate();
    toast({ title: '¡Actualizado!', description: 'Saldo actualizado con ganancias diarias', variant: 'success' });
  };

  const chartData = {
    labels: balanceData.history.map((h) => new Date(h.date).toLocaleDateString('es', { day: 'numeric' })) || ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Balance',
        data: balanceData.history.map((h) => h.balance) || [50, 50.25, 50.5, 50.75, 51, 51.25, 51.5],
        fill: true,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#22c55e',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(34, 197, 94, 0.3)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 10 } },
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#64748b', font: { size: 10 }, callback: (value: any) => `$${value}` },
      },
    },
    interaction: { intersect: false, mode: 'index' as const },
  };

  const navItems = [
    { icon: ChartNoAxesCombined, label: 'Inicio', key: 'inicio' },
    { icon: Wallet, label: 'Historial', key: 'historial' },
    { icon: Gift, label: 'Retiros', key: 'retiros' },
    { icon: Users, label: 'Referidos', key: 'referidos' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gold/10 rounded-full blur-[80px]" />
      </div>

      <header className="relative z-10 p-4 pt-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
              <ChartNoAxesCombined className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">Elite Forex</h1>
              <p className="text-xs text-muted-foreground">Bienvenido, {user?.username || 'Usuario'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
            </button>
            <button onClick={handleLogout} className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-4 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="border-0 shadow-2xl shadow-primary/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-emerald-500/10 to-transparent" />
            <CardContent className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Saldo Actual</p>
                  <motion.p
                    className="text-4xl font-bold text-foreground"
                    key={balanceData.balance}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                  >
                    {formatCurrency(balanceData.balance)}
                  </motion.p>
                </div>
                <Badge variant="success" className="gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +{balanceData.dailyProfit.toFixed(2)} hoy
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded-xl bg-secondary/30">
                  <p className="text-xs text-muted-foreground mb-1">Ganancia Total</p>
                  <p className="text-lg font-bold text-primary">+{formatCurrency(balanceData.totalProfit)}</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/30">
                  <p className="text-xs text-muted-foreground mb-1">Tu Plan</p>
                  <p className="text-lg font-bold text-gold capitalize">{user?.plan || 'Básico'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Próxima actualización: {balanceData.nextUpdate.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={handleSimulateUpdate} variant="outline" className="flex-1 gap-2" size="sm">
              <RefreshCw className="w-4 h-4" />
              Simular 24h
            </Button>
            <Button onClick={() => setIsWithdrawalOpen(true)} variant="premium" className="flex-1 gap-2" size="sm">
              <DollarSign className="w-4 h-4" />
              Retirar
            </Button>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4">
            {navItems.map((item) => (
              <TabsTrigger key={item.key} value={item.key} className="gap-1">
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="inicio" className="space-y-4 mt-4">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Evolución de tu Inversión
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gold/10 to-transparent" />
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center">
                      <Gift className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <p className="font-semibold">Programa de Referidos</p>
                      <p className="text-sm text-muted-foreground">Gana 10% de cada referido</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => setActiveTab('referidos')}>
                    Ver Más
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historial" className="space-y-4 mt-4">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">📜 Historial de Actividad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {balanceData.history.slice().reverse().map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        i === 0 ? 'bg-primary/20' : 'bg-secondary/50'
                      )}>
                        <TrendingUp className={cn(
                          'w-4 h-4',
                          i === 0 ? 'text-primary' : 'text-muted-foreground'
                        )} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Ganancia diaria</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleDateString('es')}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-primary">
                      +{formatCurrency(balanceData.dailyProfit)}
                    </span>
                  </motion.div>
                ))}
                {balanceData.history.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Sin actividad aún</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="retiros" className="space-y-4 mt-4">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  Solicitar Retiro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-secondary/30">
                  <p className="text-sm text-muted-foreground mb-1">Monto disponible</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(balanceData.balance)}</p>
                </div>
                <Input
                  placeholder="Monto a retirar (min. $50)"
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  icon={<DollarSign className="w-4 h-4" />}
                />
                <Button
                  className="w-full"
                  variant="premium"
                  disabled={parseFloat(withdrawalAmount) < 50 || parseFloat(withdrawalAmount) > balanceData.balance}
                  onClick={() => {
                    toast({ title: '¡Solicitud enviada!', description: `Retiro de ${formatCurrency(parseFloat(withdrawalAmount))} en proceso`, variant: 'success' });
                    setWithdrawalAmount('');
                    setIsWithdrawalOpen(false);
                  }}
                >
                  Solicitar Retiro
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referidos" className="space-y-4 mt-4">
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-gold/10" />
              <CardHeader className="relative">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Invita y Gana
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="p-4 rounded-xl bg-secondary/30">
                  <p className="text-sm text-muted-foreground mb-2">Tu código de referido</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 rounded-lg bg-secondary font-mono text-lg font-bold text-primary">
                      {referralCode}
                    </code>
                    <Button size="icon" variant="secondary" onClick={handleCopyReferral}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-secondary/30 text-center">
                    <p className="text-2xl font-bold text-primary">3</p>
                    <p className="text-xs text-muted-foreground">Referidos</p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/30 text-center">
                    <p className="text-2xl font-bold text-gold">$45</p>
                    <p className="text-xs text-muted-foreground">Ganado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isWithdrawalOpen} onOpenChange={setIsWithdrawalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Retiro</DialogTitle>
            <DialogDescription>
              Mínimo $50. Tiempo de procesamiento según tu plan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-secondary/30">
              <p className="text-sm text-muted-foreground">Saldo disponible</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(balanceData.balance)}</p>
            </div>
            <Input
              placeholder="Monto a retirar"
              type="number"
              value={withdrawalAmount}
              onChange={(e) => setWithdrawalAmount(e.target.value)}
              icon={<DollarSign className="w-4 h-4" />}
            />
            <Button
              className="w-full"
              variant="premium"
              disabled={parseFloat(withdrawalAmount) < 50 || parseFloat(withdrawalAmount) > balanceData.balance}
              onClick={() => {
                toast({ title: '¡Solicitud enviada!', description: `Retiro de ${formatCurrency(parseFloat(withdrawalAmount))} en proceso`, variant: 'success' });
                setWithdrawalAmount('');
                setIsWithdrawalOpen(false);
              }}
            >
              Confirmar Retiro
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
