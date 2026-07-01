import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getSubscriptionPlans, getMySubscription, subscribeToPlan } from '../../services/subscriptionApi';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import PaymentModal from '../../components/ui/PaymentModal';

export default function PlansPage() {
  const { isAuthenticated, token, role } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlanToPay, setSelectedPlanToPay] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await getSubscriptionPlans();
        setPlans(res.data);

        if (isAuthenticated && token) {
          try {
            const subRes = await getMySubscription(token);
            if (subRes.data) {
              setCurrentSubscription(subRes.data);
            }
          } catch (subErr) {
            console.error("Error fetching subscription:", subErr);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Error al cargar los planes.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [isAuthenticated, token]);

  const handleSubscribeClick = (plan) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (Number(plan.price) > 0) {
      setSelectedPlanToPay(plan);
    } else {
      confirmSubscription(plan);
    }
  };

  const confirmSubscription = async (plan) => {
    setSubscribing(true);
    setSelectedPlanToPay(null);
    try {
      const res = await subscribeToPlan(plan.id, token);
      alert('Suscripción exitosa!');
      const subRes = await getMySubscription(token);
      setCurrentSubscription(subRes.data);
    } catch (err) {
      alert('Error al suscribirse: ' + (err.message || 'Error desconocido'));
    } finally {
      setSubscribing(false);
    }
  };

  const normalizedRole = role ? String(role).trim().toLowerCase() : null;
  const isCustomerRole = normalizedRole === 'cliente' || normalizedRole === 'customer';
  const isUserPlan = isCustomerRole || !isAuthenticated;
  
  const displayPlans = plans.filter(p => {
    if (isUserPlan) return p.type === 'user';
    return p.type === 'admin';
  });

  const isPremiumCurrent = currentSubscription && Number(currentSubscription.plan_price) > 0;
  const canSwitchToBasic = () => {
    if (!isPremiumCurrent || !currentSubscription?.start_date) return true;
    const startDate = new Date(currentSubscription.start_date);
    const oneMonthLater = new Date(startDate);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    return new Date() >= oneMonthLater;
  };
  const disableBasic = !canSwitchToBasic();

  return (
    <main className="min-h-screen bg-[#faf9f5]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-[#1a1200] mb-4">
            Planes y Membresías
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades y disfruta de beneficios exclusivos.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-none border border-red-200 text-center mb-8">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Icon name="loader" className="h-10 w-10 text-[#c8960c] animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {displayPlans.map(plan => {
              const isPremium = plan.price > 0;
              const isCurrent = currentSubscription?.plan_id === plan.id;

              return (
                <div 
                  key={plan.id}
                  className={`relative flex flex-col p-8 rounded-none border-2 transition-all duration-300 bg-white ${
                    isPremium 
                      ? 'border-[#c8960c] shadow-[0_10px_40px_-10px_rgba(201,150,12,0.3)] scale-105 z-10' 
                      : 'border-slate-200 shadow-sm'
                  }`}
                >
                  {isPremium && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1a1200] text-[#f5d367] text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-none">
                      Recomendado
                    </div>
                  )}
                  
                  <div className="text-center mb-8">
                    <h3 className={`text-xl font-bold uppercase tracking-wider mb-2 ${isPremium ? 'text-[#c8960c]' : 'text-slate-700'}`}>
                      {plan.name}
                    </h3>
                    <div className="flex justify-center items-baseline gap-1">
                      <span className="text-4xl font-black text-[#1a1200]">
                        {Number(plan.price) === 0 ? 'Gratis' : `Bs ${plan.price}`}
                      </span>
                      {Number(plan.price) > 0 && <span className="text-slate-500 font-medium">/mes</span>}
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.free_shipping && (
                      <li className="flex items-start gap-3">
                        <Icon name="check" className="h-5 w-5 text-green-500 shrink-0" />
                        <span className="text-slate-700 text-sm font-medium">Envíos Gratuitos</span>
                      </li>
                    )}
                    {Number(plan.discount) > 0 && (
                      <li className="flex items-start gap-3">
                        <Icon name="check" className="h-5 w-5 text-green-500 shrink-0" />
                        <span className="text-slate-700 text-sm font-medium">Descuentos del {plan.discount}% en productos</span>
                      </li>
                    )}
                    {plan.featured_products && (
                      <li className="flex items-start gap-3">
                        <Icon name="check" className="h-5 w-5 text-green-500 shrink-0" />
                        <span className="text-slate-700 text-sm font-medium">Productos y Servicios Destacados en búsquedas</span>
                      </li>
                    )}
                    {plan.reduced_commission && (
                      <li className="flex items-start gap-3">
                        <Icon name="check" className="h-5 w-5 text-green-500 shrink-0" />
                        <span className="text-slate-700 text-sm font-medium">Cero gastos de aplicación y menos comisiones</span>
                      </li>
                    )}
                    {plan.points_enabled && (
                      <li className="flex items-start gap-3">
                        <Icon name="check" className="h-5 w-5 text-green-500 shrink-0" />
                        <span className="text-slate-700 text-sm font-medium">Acumulación de puntos Shopy</span>
                      </li>
                    )}
                  </ul>

                  {Number(plan.price) === 0 && disableBasic && (
                    <p className="text-xs text-red-500 text-center mb-2 font-medium">
                      Debes mantener tu plan Premium al menos 1 mes antes de volver al Básico.
                    </p>
                  )}
                  <Button
                    type="button"
                    disabled={isCurrent || subscribing || (Number(plan.price) === 0 && disableBasic)}
                    onClick={() => handleSubscribeClick(plan)}
                    className={`w-full py-4 text-sm font-bold uppercase tracking-wider rounded-none transition-all ${
                      isCurrent
                        ? 'bg-green-100 text-green-700 border border-green-200 cursor-not-allowed'
                        : (Number(plan.price) === 0 && disableBasic) 
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                          : isPremium
                            ? 'bg-[#1a1200] text-[#f5d367] hover:bg-[#2c1f06]'
                            : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isCurrent ? 'Plan Actual' : (subscribing ? 'Procesando...' : 'Seleccionar Plan')}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PaymentModal 
        isOpen={!!selectedPlanToPay} 
        onClose={() => setSelectedPlanToPay(null)} 
        onSuccess={() => confirmSubscription(selectedPlanToPay)} 
        plan={selectedPlanToPay} 
      />
    </main>
  );
}
