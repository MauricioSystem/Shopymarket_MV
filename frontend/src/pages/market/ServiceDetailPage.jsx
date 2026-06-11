import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  getAllServices,
  getAllServiceProfiles,
  getServiceProfileRatingStats,
  saveServiceProfileRatingStats,
  getServiceVoteStats,
  saveServiceVoteStats,
  deleteServiceVoteStats,
  ratingStatsFromEntity,
  voteStatsFromEntity,
} from "@/services/marketApi";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { API_BASE_URL } from "@/config/appSettings";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { StarRatingPanel, ProductVotePanel } from "@/components/RatingActions";

const API_BASE = API_BASE_URL;

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token, user } = useAuth();

  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratingStats, setRatingStats] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingMessage, setRatingMessage] = useState(null);
  const [serviceVoteStats, setServiceVoteStats] = useState(null);
  const [serviceVoteLoading, setServiceVoteLoading] = useState(false);
  const [serviceVoteMessage, setServiceVoteMessage] = useState(null);

  useEffect(() => {
    async function fetchService() {
      try {
        setLoading(true);
        const [servicesRes, profilesRes] = await Promise.all([
          getAllServices(null),
          getAllServiceProfiles(null)
        ]);
        const servicesList = Array.isArray(servicesRes) ? servicesRes : servicesRes.data;
        if (servicesList) {
          const found = servicesList.find(s => Number(s.id) === Number(id));
          if (found) {
            setService(found);
            const userId = user?.id || user?.email;
            const likesData = userId
              ? await getServiceVoteStats(found.id, token, userId)
              : voteStatsFromEntity(found);
            setServiceVoteStats(likesData);

            const profilesList = Array.isArray(profilesRes) ? profilesRes : profilesRes.data;
            if (profilesList) {
              const p = profilesList.find(pr => Number(pr.id) === Number(found.service_profile_id));
              if (p) {
                setProvider(p);
                const rating = userId
                  ? await getServiceProfileRatingStats(p.id, token, userId)
                  : ratingStatsFromEntity(p);
                setRatingStats(rating);
              }
            }
          } else {
            setError("Servicio no encontrado.");
          }
        }
      } catch (err) {
        setError("Error al cargar el servicio.");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchService();
  }, [id, token, user]);

  const isOwner = isAuthenticated && user && provider && Number(provider.admin_user_id) === Number(user.id);

  useEffect(() => {
    if (isOwner && service) {
      navigate("/dashboard/vendor", {
        replace: true,
        state: { activeTab: "services", editServiceId: service.id }
      });
    }
  }, [isOwner, service, navigate]);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1: form, 2: processing, 3: success
  const [bookingData, setBookingData] = useState({ dateType: "single", date: null, dateEnd: null, time: "", notes: "" });
  const [bookingError, setBookingError] = useState(null);

  const handleAction = () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      setShowBookingModal(true);
      setBookingStep(1);
      setBookingError(null);
    }
  };

  const handleRate = async (rating) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setRatingLoading(true);
    setRatingMessage(null);

    try {
      const userId = user?.id || user?.email || "logged_in_user";
      const result = await saveServiceProfileRatingStats(provider.id, rating, token, userId);
      setRatingStats(result);
      setRatingMessage({ type: "success", text: "Calificación guardada." });
    } catch (err) {
      setRatingMessage({ type: "error", text: err?.message || "No se pudo guardar la calificación." });
    } finally {
      setRatingLoading(false);
    }
  };

  const handleServiceVote = async (vote) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setServiceVoteLoading(true);
    setServiceVoteMessage(null);

    try {
      const userId = user?.id || user?.email || "logged_in_user";
      const currentVote = Number(serviceVoteStats?.userVote || serviceVoteStats?.userVotes?.[userId] || 0);
      const newStats = currentVote === vote
        ? await deleteServiceVoteStats(service.id, token, userId)
        : await saveServiceVoteStats(service.id, vote, token, userId);
      setServiceVoteStats(newStats);
      setService((current) => current ? { ...current, ...newStats } : current);
      setServiceVoteMessage({ type: "success", text: "Voto guardado." });
    } catch (err) {
      setServiceVoteMessage({ type: "error", text: err?.message || "No se pudo guardar el voto." });
    } finally {
      setServiceVoteLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!bookingData.date || !bookingData.time) return;
    setBookingStep(2);
    setBookingError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/services/${id}/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setBookingStep(3);
      } else {
        throw new Error(result.message || result.error || "Error al realizar la reserva");
      }
    } catch (err) {
      console.error("Error al agendar servicio:", err);
      setBookingError(err.message || "Ocurrió un error al procesar tu solicitud.");
      setBookingStep(1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040912] text-white">
        <Navbar />
        <div className="flex h-[80vh] items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-none animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-[#040912] text-white">
        <Navbar />
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center p-8 bg-white/5 border border-white/10 rounded-none shadow-xl max-w-md w-full flex flex-col items-center">
            <Icon name="wrench" className="h-16 w-16 text-white/40 mb-4" />
            <h2 className="text-2xl font-bold text-white">Servicio no encontrado</h2>
            <p className="text-white/50 mt-2">{error}</p>
            <Button onClick={() => navigate(-1)} className="mt-6 bg-blue-500 text-white rounded-none">
              Volver Atrás
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const imageUrl = service.image_url ? (service.image_url.startsWith("http") ? service.image_url : `${API_BASE}${service.image_url}`) : null;
  const canRate = isAuthenticated && !isOwner;

  return (
    <div className="min-h-screen bg-[#040912] flex flex-col font-sans text-white">
      <Navbar />
      
      <main className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto md:py-10">
        {/* Izquierda: Portafolio */}
        <div className="relative w-full md:w-1/2 bg-[#07111f] md:rounded-none p-6 md:p-12 flex flex-col items-center justify-center min-h-[400px] border border-white/5">
          {provider && (
            <button
              onClick={() => navigate(`/service/${encodeURIComponent(provider.name)}`)}
              className="absolute top-6 left-6 text-sm font-bold text-white/50 hover:text-white transition-colors flex items-center gap-2 z-10 bg-[#040912]/80 px-3 py-1.5 rounded-none shadow-sm border border-white/10 backdrop-blur-sm"
            >
              ← Ir al perfil
            </button>
          )}
          {imageUrl ? (
            <img src={imageUrl} alt={service.name} className="w-full h-80 md:h-full max-h-[600px] object-cover rounded-none shadow-2xl border border-white/10" />
          ) : (
            <div className="w-full h-80 md:h-full max-h-[600px] flex flex-col items-center justify-center bg-blue-500/10 rounded-none border border-blue-500/20 p-8">
              <Icon name="wrench" className="h-20 w-20 text-blue-500/50" />
              <span className="text-lg text-blue-400 mt-6 opacity-70 font-semibold">Servicio sin imagen</span>
            </div>
          )}
        </div>

        {/* Derecha: Reserva/Alcance */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-[#07111f]/50 md:rounded-none border-y border-r border-white/5">
          <div className="space-y-8 flex-1">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 text-[0.65rem] font-bold uppercase tracking-widest border border-blue-500/20 rounded-none">
                Servicio Profesional
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
                {service.name}
              </h1>
              <p className="text-base text-white/60 leading-relaxed max-w-lg">
                {service.description || "Este servicio no tiene descripción adicional configurada en el portafolio."}
              </p>
            </div>

            <div className="py-6 border-y border-white/10 my-6">
              <p className="text-4xl font-extrabold text-blue-400">
                Bs {Number(service.price || 0).toFixed(2)}
                <span className="text-lg font-normal text-white/40 ml-2">/ servicio</span>
              </p>
              {service.estimated_time && (
                <p className="text-sm font-semibold text-white/50 mt-3 flex items-center gap-2">
                  <Icon name="clock" className="h-4 w-4 text-blue-400 shrink-0" /> Tiempo estimado: <span className="text-white/80">{service.estimated_time}</span>
                </p>
              )}
            </div>

            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-white/40">Calificación del Prestador</p>
              <StarRatingPanel
                stats={ratingStats || provider}
                userId={user?.id || user?.email}
                canInteract={canRate}
                onRate={handleRate}
                loading={ratingLoading}
                message={ratingMessage}
              />
            </div>

            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-white/40">Opiniones del Servicio</p>
              <ProductVotePanel
                likes={serviceVoteStats?.likes || 0}
                dislikes={serviceVoteStats?.dislikes || 0}
                userVote={serviceVoteStats?.userVote || (user?.id || user?.email ? serviceVoteStats?.userVotes?.[user?.id || user?.email] || 0 : 0)}
                canInteract={isAuthenticated && !isOwner}
                onVote={handleServiceVote}
                loading={serviceVoteLoading}
                message={serviceVoteMessage}
              />
            </div>
            
            <div className="space-y-6">
              <Button onClick={handleAction} className="w-full bg-blue-500 text-white font-bold py-4 rounded-none hover:bg-blue-600 shadow-xl shadow-blue-500/20 transition-all text-lg uppercase tracking-wider">
                Solicitar Reserva
              </Button>

              <div className="grid grid-cols-2 gap-4 text-sm text-white/50 pt-4">
                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-none border border-white/5">
                  <Icon name="calendar" className="h-5 w-5 text-blue-400 shrink-0" />
                  <span>Agenda flexible</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-none border border-white/5">
                  <Icon name="message" className="h-5 w-5 text-blue-400 shrink-0" />
                  <span>Contacto directo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#040912]/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#0a1628] border border-white/10 rounded-none w-full max-w-lg overflow-hidden shadow-2xl relative">
            {bookingStep === 1 && (
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Agendar Servicio</h3>
                    <p className="text-white/50 text-sm mt-1">{service.name}</p>
                  </div>
                  <button onClick={() => setShowBookingModal(false)} className="text-white/40 hover:text-white transition-colors">
                    <span className="text-2xl">×</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {bookingError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-none p-3 text-xs flex items-center gap-2">
                      <Icon name="alert" className="h-4 w-4 text-red-400 shrink-0" />
                      <span>{bookingError}</span>
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-blue-400">Fecha de servicio</label>
                      <select 
                        value={bookingData.dateType} 
                        onChange={(e) => setBookingData(prev => ({ ...prev, dateType: e.target.value, dateEnd: "" }))}
                        className="bg-transparent text-xs text-white/70 focus:outline-none cursor-pointer border-b border-white/20 pb-0.5"
                      >
                        <option value="single" className="bg-[#040912]">Día único</option>
                        <option value="range" className="bg-[#040912]">Rango de días</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3 relative z-50">
                      <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/50 z-10">
                          <Icon name="calendar" className="h-4 w-4" />
                        </span>
                        <DatePicker
                          selected={bookingData.date}
                          onChange={(date) => setBookingData(prev => ({ ...prev, date }))}
                          selectsStart
                          startDate={bookingData.date}
                          endDate={bookingData.dateType === "range" ? bookingData.dateEnd : null}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Seleccionar fecha"
                          className="w-full bg-[#040912] border border-white/10 rounded-none pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                          wrapperClassName="w-full"
                          minDate={new Date()}
                        />
                      </div>
                      
                      {bookingData.dateType === "range" && (
                        <>
                          <span className="text-white/40 font-bold text-xs">HASTA</span>
                          <div className="relative flex-1">
                            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/50 z-10">
                              <Icon name="calendar" className="h-4 w-4" />
                            </span>
                            <DatePicker
                              selected={bookingData.dateEnd}
                              onChange={(date) => setBookingData(prev => ({ ...prev, dateEnd: date }))}
                              selectsEnd
                              startDate={bookingData.date}
                              endDate={bookingData.dateEnd}
                              minDate={bookingData.date || new Date()}
                              dateFormat="dd/MM/yyyy"
                              placeholderText="Fecha final"
                              className="w-full bg-[#040912] border border-white/10 rounded-none pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                              wrapperClassName="w-full"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">Horario de preferencia</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/50">
                        <Icon name="clock" className="h-4 w-4" />
                      </span>
                      <input 
                        type="time" 
                        value={bookingData.time}
                        onChange={(e) => setBookingData(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full bg-[#040912] border border-white/10 rounded-none pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">Detalles adicionales (opcional)</label>
                    <textarea 
                      placeholder="Ej. Requiero que vengan por la mañana, es para un evento..."
                      value={bookingData.notes}
                      onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full bg-[#040912] border border-white/10 rounded-none px-4 py-3 text-white focus:outline-none focus:border-blue-500 h-24 resize-none" 
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <Button onClick={() => setShowBookingModal(false)} className="bg-transparent text-white/70 hover:bg-white/5 border border-white/10 flex-1 rounded-none">
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleConfirmBooking} 
                    disabled={!bookingData.date || !bookingData.time}
                    className="bg-blue-600 text-white font-bold flex-1 rounded-none hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirmar Reserva
                  </Button>
                </div>
              </div>
            )}

            {bookingStep === 2 && (
              <div className="p-16 text-center space-y-6">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-none animate-spin mx-auto"></div>
                <p className="text-lg text-white animate-pulse">Procesando solicitud...</p>
              </div>
            )}

            {bookingStep === 3 && (
              <div className="p-12 text-center space-y-6 animate-fade-in flex flex-col items-center">
                <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-none flex items-center justify-center mx-auto">
                  <Icon name="check" className="h-10 w-10 text-green-400" strokeWidth={3} />
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold text-white">¡Reserva solicitada!</h3>
                  <p className="text-white/60 mt-3 max-w-sm mx-auto">
                    Tu solicitud para el{' '}
                    {bookingData.dateType === 'range' ? (
                      <>del <b>{bookingData.date?.toLocaleDateString('es-ES')}</b> al <b>{bookingData.dateEnd?.toLocaleDateString('es-ES')}</b></>
                    ) : (
                      <>día <b>{bookingData.date?.toLocaleDateString('es-ES')}</b></>
                    )}{' '}
                    a las <b>{bookingData.time}</b> ha sido registrada.
                    El prestador del servicio te contactará muy pronto para afinar los detalles y el pago.
                  </p>
                </div>
                <Button onClick={() => setShowBookingModal(false)} className="bg-white text-[#040912] font-bold px-8 py-3 rounded-none mt-6 hover:bg-white/90">
                  Entendido
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
