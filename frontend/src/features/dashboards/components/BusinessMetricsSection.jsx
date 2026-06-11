import React, { useMemo } from 'react';
import Icon from '@/components/ui/Icon';
import { ratingStatsFromEntity, voteStatsFromEntity } from '@/services/marketApi';
import { getStoreVisits } from '@/utils/ratingStorage';

const getDayName = (dateStr) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    try {
        const d = new Date(dateStr + 'T00:00:00');
        return days[d.getDay()];
    } catch (e) {
        return '';
    }
};

export function BusinessMetricsSection({
    existingStore,
    existingServiceProfile,
    products = [],
    services = [],
}) {
    // 1. Gather visits data
    const storeVis = useMemo(() => {
        return existingStore ? getStoreVisits(existingStore.id, false) : { total: 0, history: [] };
    }, [existingStore]);

    const profileVis = useMemo(() => {
        return existingServiceProfile ? getStoreVisits(existingServiceProfile.id, true) : { total: 0, history: [] };
    }, [existingServiceProfile]);

    const totalVisits = storeVis.total + profileVis.total;

    // Merge 7-day histories
    const visitsChartData = useMemo(() => {
        const merged = {};
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            merged[dateStr] = 0;
        }

        if (existingStore) {
            storeVis.history.forEach(h => {
                if (merged[h.date] !== undefined) merged[h.date] += h.count;
            });
        }
        if (existingServiceProfile) {
            profileVis.history.forEach(h => {
                if (merged[h.date] !== undefined) merged[h.date] += h.count;
            });
        }

        return Object.entries(merged).map(([date, count]) => ({ date, count }));
    }, [existingStore, existingServiceProfile, storeVis.history, profileVis.history]);

    // 2. Gather catalog details & likes
    const catalogSize = products.length + services.length;

    const totalLikes = useMemo(() => {
        let count = 0;
        products.forEach(p => {
            const l = voteStatsFromEntity(p);
            count += (l?.likes || 0);
        });
        services.forEach(s => {
            const l = voteStatsFromEntity(s);
            count += (l?.likes || 0);
        });
        return count;
    }, [products, services]);

    // Top 5 items for Popularity
    const popularityItems = useMemo(() => {
        const list = [];
        products.forEach(p => {
            const l = voteStatsFromEntity(p);
            list.push({ name: p.name, likes: l?.likes || 0, type: "Producto" });
        });
        services.forEach(s => {
            const l = voteStatsFromEntity(s);
            list.push({ name: s.name, likes: l?.likes || 0, type: "Servicio" });
        });
        // Sort descending by likes
        list.sort((a, b) => b.likes - a.likes);
        const top5 = list.slice(0, 5);

        return top5;
    }, [products, services]);

    // 3. Gather rating details
    const storeRating = useMemo(() => {
        return existingStore ? ratingStatsFromEntity(existingStore) : null;
    }, [existingStore]);

    const profileRating = useMemo(() => {
        return existingServiceProfile ? ratingStatsFromEntity(existingServiceProfile) : null;
    }, [existingServiceProfile]);

    const ratingSummary = useMemo(() => {
        let totalSum = 0;
        let totalCount = 0;
        const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

        const processRating = (ratingData) => {
            if (ratingData && ratingData.count > 0) {
                totalSum += ratingData.sum || 0;
                totalCount += ratingData.count || 0;
                if (ratingData.breakdown) {
                    Object.keys(starCounts).forEach((star) => {
                        starCounts[star] += Number(ratingData.breakdown[star] || 0);
                    });
                }
            }
        };

        processRating(storeRating);
        processRating(profileRating);

        const average = totalCount > 0 ? parseFloat((totalSum / totalCount).toFixed(1)) : 0;

        return {
            average,
            count: totalCount,
            breakdown: starCounts
        };
    }, [storeRating, profileRating]);

    // SVG plotting variables for line chart
    const lineChartWidth = 500;
    const lineChartHeight = 220;
    const padding = 40;
    const chartW = lineChartWidth - padding * 2;
    const chartH = lineChartHeight - padding * 2;

    const maxVisitVal = Math.max(...visitsChartData.map(d => d.count), 10);
    const linePoints = visitsChartData.map((d, i) => {
        const x = padding + (i * (chartW / 6));
        const y = lineChartHeight - padding - (d.count / maxVisitVal) * chartH;
        return { x, y, ...d };
    });

    const pathD = linePoints.reduce((acc, p, i) => {
        return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, "");

    const fillD = linePoints.length > 0 
        ? `${pathD} L ${linePoints[linePoints.length - 1].x} ${lineChartHeight - padding} L ${linePoints[0].x} ${lineChartHeight - padding} Z`
        : "";

    return (
        <div className="space-y-8 animate-fade-in font-sans">
            <div>
                <h2 className="text-xl font-bold text-white tracking-wide uppercase flex items-center gap-2">
                    <Icon name="globe" className="h-5 w-5 text-[#f5d367]" />
                    <span>Métricas de Rendimiento</span>
                </h2>
                <p className="text-xs text-white/40 mt-1">Monitorea visitas, likes y calificaciones de tu comercio en tiempo real.</p>
            </div>

            {/* Summary KPI Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Visits KPI */}
                <div className="rounded-none border border-white/10 bg-white/[0.03] p-5 flex items-center gap-4 hover:border-[#f5d367]/30 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#f5d367]/5 transition-all duration-300">
                    <div className="h-12 w-12 bg-[#f5d367]/10 flex items-center justify-center text-[#f5d367]">
                        <Icon name="eye" className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Visitas Totales</p>
                        <p className="text-2xl font-black text-white mt-1">{totalVisits}</p>
                    </div>
                </div>

                {/* Likes KPI */}
                <div className="rounded-none border border-white/10 bg-white/[0.03] p-5 flex items-center gap-4 hover:border-[#f5d367]/30 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#f5d367]/5 transition-all duration-300">
                    <div className="h-12 w-12 bg-green-500/10 flex items-center justify-center text-green-400">
                        <Icon name="star" className="h-6 w-6 fill-green-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Likes Catálogo</p>
                        <p className="text-2xl font-black text-white mt-1">{totalLikes}</p>
                    </div>
                </div>

                {/* Rating KPI */}
                <div className="rounded-none border border-white/10 bg-white/[0.03] p-5 flex items-center gap-4 hover:border-[#f5d367]/30 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#f5d367]/5 transition-all duration-300">
                    <div className="h-12 w-12 bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <Icon name="star" className="h-6 w-6 fill-amber-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Calificación Promedio</p>
                        <p className="text-2xl font-black text-white mt-1">
                            {ratingSummary.average.toFixed(1)} <span className="text-xs font-normal text-white/40">({ratingSummary.count} calificaciones)</span>
                        </p>
                    </div>
                </div>

                {/* Size KPI */}
                <div className="rounded-none border border-white/10 bg-white/[0.03] p-5 flex items-center gap-4 hover:border-[#f5d367]/30 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#f5d367]/5 transition-all duration-300">
                    <div className="h-12 w-12 bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <Icon name="market" className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Tamaño del Catálogo</p>
                        <p className="text-2xl font-black text-white mt-1">
                            {catalogSize} <span className="text-xs font-normal text-white/40">items</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* 1. Visits Line Chart */}
                <div className="lg:col-span-2 rounded-none border border-white/10 bg-white/[0.02] p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white/70">Visitas Recientes (Últimos 7 días)</h3>
                        <span className="text-[10px] font-semibold text-white/40">Historial Semanal</span>
                    </div>

                    <div className="w-full h-60 flex items-center justify-center">
                        <svg viewBox={`0 0 ${lineChartWidth} ${lineChartHeight}`} className="w-full h-full text-white/20">
                            <defs>
                                <linearGradient id="visits-grad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f5d367" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#f5d367" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            {/* Gridlines */}
                            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                                const y = padding + ratio * chartH;
                                const val = Math.round(maxVisitVal * (1 - ratio));
                                return (
                                    <g key={i}>
                                        <line x1={padding} y1={y} x2={lineChartWidth - padding} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                                        <text x={padding - 10} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="9" fontWeight="bold">{val}</text>
                                    </g>
                                );
                            })}

                            {/* Area fill */}
                            {fillD && <path d={fillD} fill="url(#visits-grad)" className="transition-all duration-500" />}

                            {/* Path curve */}
                            {pathD && <path d={pathD} fill="none" stroke="#f5d367" strokeWidth="2.5" strokeLinecap="round" className="transition-all duration-500" />}

                            {/* Points and labels */}
                            {linePoints.map((p, i) => (
                                <g key={i} className="group/dot cursor-pointer">
                                    <circle cx={p.x} cy={p.y} r="4" fill="#07111f" stroke="#f5d367" strokeWidth="2" />
                                    <circle cx={p.x} cy={p.y} r="8" fill="#f5d367" fillOpacity="0" className="hover:fill-opacity-20 transition-all" />
                                    <text x={p.x} y={p.y - 12} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="extrabold">{p.count}</text>
                                    <text x={p.x} y={lineChartHeight - padding + 20} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9" fontWeight="bold">
                                        {getDayName(p.date)}
                                    </text>
                                </g>
                            ))}
                        </svg>
                    </div>
                </div>

                {/* 2. Rating Star Breakdown */}
                <div className="rounded-none border border-white/10 bg-white/[0.02] p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white/70">Calificaciones</h3>
                        <span className="text-[10px] font-semibold text-white/40">Distribución de estrellas</span>
                    </div>

                    <div className="space-y-3.5 pt-2">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = ratingSummary.breakdown[star] || 0;
                            const percentage = ratingSummary.count > 0 ? (count / ratingSummary.count) * 100 : 0;
                            return (
                                <div key={star} className="flex items-center gap-3">
                                    <span className="w-8 text-xs font-bold text-white/60 text-right flex items-center justify-end gap-1">
                                        <span>{star}</span>
                                        <Icon name="star" className="h-3 w-3 fill-amber-500 text-amber-500" />
                                    </span>
                                    <div className="flex-1 h-3 bg-white/5 rounded-none overflow-hidden relative">
                                        <div 
                                            className="h-full bg-amber-500 transition-all duration-1000 ease-out rounded-none"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="w-14 text-right text-xs font-bold text-white/40">
                                        {count} <span className="text-[10px] font-normal">({Math.round(percentage)}%)</span>
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="pt-2 text-center border-t border-white/5 mt-4">
                        <p className="text-[10px] text-white/40 italic">
                            Los datos provienen de calificaciones de clientes registrados.
                        </p>
                    </div>
                </div>

                {/* 3. Catalog Popularity */}
                <div className="lg:col-span-3 rounded-none border border-white/10 bg-white/[0.02] p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white/70">Popularidad del Catálogo (Top 5 con más likes)</h3>
                        <span className="text-[10px] font-semibold text-white/40">Recomendaciones</span>
                    </div>

                    <div className="space-y-4 pt-2">
                        {popularityItems.map((item, index) => {
                            const maxLikes = Math.max(...popularityItems.map(i => i.likes), 1);
                            const percent = (item.likes / maxLikes) * 100;
                            return (
                                <div key={index} className="space-y-1">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-white/80 truncate max-w-[70%]">
                                            {item.name} <span className="text-[9px] font-normal text-white/30 px-1.5 py-0.5 border border-white/10 ml-2 uppercase">{item.type}</span>
                                        </span>
                                        <span className="font-extrabold text-[#f5d367] flex items-center gap-1">
                                            <Icon name="star" className="h-3.5 w-3.5 fill-[#f5d367] text-[#f5d367]" />
                                            <span>{item.likes} likes</span>
                                        </span>
                                    </div>
                                    <div className="w-full h-2.5 bg-white/5 rounded-none overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-amber-500 to-[#f5d367] transition-all duration-1000 ease-out rounded-none"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
