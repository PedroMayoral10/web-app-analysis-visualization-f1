import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { URL_API_BACKEND } from "../../config";

// Mapeo de países para las banderas
const countryToIso = {
    "spain": "es", "united-kingdom": "gb", "germany": "de", "brazil": "br", "france": "fr",
    "italy": "it", "netherlands": "nl", "monaco": "mc", "austria": "at", "australia": "au",
    "finland": "fi", "belgium": "be", "canada": "ca", "mexico": "mx", "japan": "jp",
    "switzerland": "ch", "argentina": "ar", "new-zealand": "nz", "south-africa": "za",
    "sweden": "se", "colombia": "co", "united-states-of-america": "us", "china": "cn",
    "uruguay": "uy", "malasya": "my", "malaysia": "my", "ireland": "ie", "hong-kong": "hk",
    "zimbabwe": "zw", "portugal": "pt", "poland": "pl", "morocco": "ma", "marruecos": "ma",
    "israel": "il", "indonesia": "id"
};

const F1Teams = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [f1Teams, setF1Teams] = useState([]);
    const [selectedF1Team, setSelectedF1Team] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [chronology, setChronology] = useState([]);
    const [teamDrivers, setTeamDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    const getFlagCode = (countryId) => {
        if (!countryId) return "un";
        const cleanId = countryId.toLowerCase().trim();
        return countryToIso[cleanId] || (cleanId.length >= 2 ? cleanId.substring(0, 2) : "un");
    };

    // Carga inicial de todas las escuderías 
    useEffect(() => {
        fetch(`${URL_API_BACKEND}/f1_teams/lista`)
            .then(res => res.json())
            .then(data => {
                const results = Array.isArray(data) ? data : [];
                setF1Teams(results);

                // Si venimos de la página de un piloto y se ha pasado el constructorId, seleccionamos esa escudería
                const targetF1TeamId = location.state?.constructorId;

                if (targetF1TeamId) {
                    const target = results.find(c => c.id === targetF1TeamId);
                    if (target) {
                        setSelectedF1Team(target);
                        setLoading(false);
                        return;
                    }
                }
                // Selección por defecto
                if (results.length > 0) setSelectedF1Team(results[0]);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error cargando escuderías:", err);
                setLoading(false);
            });
    }, [location.state]);

    // Carga de cronología y pilotos al seleccionar una escudería
    useEffect(() => {
        if (selectedF1Team) {
            fetch(`${URL_API_BACKEND}/f1_teams/cronologia/${selectedF1Team.id}`)
                .then(res => res.json())
                .then(data => {
                    const sorted = Array.isArray(data) ? [...data].sort((a, b) => b.yearFrom - a.yearFrom) : [];
                    setChronology(sorted);
                })
                .catch(err => console.error("Error cronología:", err));
            fetch(`${URL_API_BACKEND}/f1_teams/pilotos/${selectedF1Team.id}`)
                .then(res => res.json())
                .then(data => {
                    setTeamDrivers(Array.isArray(data) ? data : []);
                })
                .catch(err => console.error("Error pilotos:", err));
        }
    }, [selectedF1Team]);

    const filteredF1Teams = (f1Teams || []).filter(c =>
        (c.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="h-screen bg-zinc-900 flex items-center justify-center text-red-600 font-bold uppercase italic tracking-tighter">
            Cargando...
        </div>
    );

    return (
        <div className="flex h-screen bg-zinc-900 text-white p-6 font-sans gap-2 overflow-hidden" style={{ height: 'calc(100vh - 70px)' }}>

            {/* LISTA DE ESCUDERÍAS */}
            <div className="w-[20%] flex flex-col border-r border-zinc-800 pr-4">
                <input
                    type="text"
                    placeholder="Buscar escudería..."
                    className="w-full p-2 mb-4 bg-black border border-zinc-700 rounded text-sm outline-none focus:border-red-600 transition-all font-bold italic uppercase"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <style>{`.custom-scrollbar::-webkit-scrollbar { display: none; }`}</style>
                    {filteredF1Teams.map(c => (
                        <div
                            key={c._id}
                            onClick={() => setSelectedF1Team(c)}
                            className={`p-3 rounded cursor-pointer flex items-center border-l-4 transition-all ${selectedF1Team?._id === c._id ? 'bg-black border-red-600' : 'bg-transparent border-transparent hover:bg-black/50'
                                }`}
                        >
                            <span className={`fi fi-${getFlagCode(c.countryId)} mr-3 shadow-sm flex-shrink-0`}></span>
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-sm m-0 leading-tight break-words uppercase">{c.name}</p>
                                <p className="text-[10px] uppercase text-zinc-500 m-0 truncate font-bold italic">{c.countryId}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* INFORMACIÓN GENERAL Y PILOTOS */}
            <div className="w-[60%] px-8 overflow-y-auto custom-scrollbar">
                {selectedF1Team ? (
                    <div className="animate-in fade-in duration-500 pb-10">
                        <div className="flex justify-between items-end border-b border-zinc-800 pb-4 mb-8">
                            <div>
                                <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-tight m-0">
                                    {selectedF1Team.name}
                                </h1>
                                <p className="text-red-600 font-mono text-7xl uppercase leading-none m-0">
                                    {selectedF1Team.fullName}
                                </p>
                            </div>
                            <div className="text-7xl font-black text-zinc-800 uppercase italic">
                                {selectedF1Team.countryId?.substring(0, 3)}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-zinc-950 p-6 rounded-xl border border-danger">
                                    <h6 className="text-red-600 text-xm font-bold uppercase mb-3 italic tracking-widest">Información Técnica</h6>
                                    <div className="space-y-4">
                                        <InfoItem label="Sede Principal" value={selectedF1Team.countryId} />
                                        <InfoItem label="Vueltas Competidas" value={selectedF1Team.totalRaceLaps} />
                                        <InfoItem label="Podios en Carrera" value={selectedF1Team.totalPodiumRaces} />
                                    </div>
                                </div>
                                <div className="bg-zinc-950 p-6 rounded-xl border border-danger">
                                    <h6 className="text-red-600 text-xm font-bold uppercase mb-6 italic tracking-widest">Hitos de la Escudería</h6>
                                    <div className="space-y-8">
                                        <InfoItem label="Mejor Posición Cto." value={selectedF1Team.bestChampionshipPosition} important />
                                        <InfoItem label="Mejor Resultado Carrera" value={selectedF1Team.bestRaceResult} important />
                                    </div>
                                </div>
                            </div>

                            {/* ESTADÍSTICAS TOTALES */}
                            <div>
                                <h6 className="text-zinc-500 text-xm font-bold uppercase mb-4 px-1 italic font-bold">Estadísticas de Competición</h6>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-bold">
                                    <StatCard label="Mundiales" value={selectedF1Team.totalChampionshipWins} isRed />
                                    <StatCard label="Victorias" value={selectedF1Team.totalRaceWins} />
                                    <StatCard label="Podios" value={selectedF1Team.totalPodiums} />
                                    <StatCard label="Puntos" value={selectedF1Team.totalPoints} />
                                    <StatCard label="Poles" value={selectedF1Team.totalPolePositions} />
                                    <StatCard label="Vueltas Rápidas" value={selectedF1Team.totalFastestLaps} />
                                    <StatCard label="GP Iniciados" value={selectedF1Team.totalRaceStarts} />
                                    <StatCard label="Dobletes 1-2" value={selectedF1Team.total1And2Finishes} />
                                </div>
                            </div>

                            {/* LISTA DE PILOTOS HISTÓRICOS */}
                            <div>
                                <h6 className="text-zinc-500 text-xm font-bold uppercase mb-4 px-1 italic font-bold tracking-wider">Pilotos de la Escudería</h6>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {teamDrivers.map((driver) => (
                                        <div
                                            key={driver.id}
                                            onClick={() => navigate('/pilotos', { state: { driverId: driver.id } })}
                                            className="bg-zinc-950 p-3 rounded border border-danger hover:border-red-600 hover:bg-black transition-all cursor-pointer flex items-center group shadow-sm"
                                        >
                                            <span className={`fi fi-${getFlagCode(driver.nationalityCountryId)} mr-3 opacity-60 group-hover:opacity-100 transition-opacity`}></span>
                                            <span className="text-xs font-bold uppercase tracking-tight truncate group-hover:text-red-600 transition-colors">
                                                {driver.fullName}
                                            </span>
                                        </div>
                                    ))}
                                    {teamDrivers.length === 0 && (
                                        <p className="text-zinc-700 text-xs italic font-bold uppercase px-1">Cargando nómina de pilotos...</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-700 font-black text-xl uppercase italic tracking-widest opacity-20">
                        <p>Selecciona una escudería</p>
                    </div>
                )}
            </div>

            {/* CRONOLOGÍA */}
            <div className="w-[20%] border-l border-zinc-800 pl-4 flex flex-col">
                <h6 className="text-red-600 text-xm font-bold uppercase mb-4 italic tracking-widest leading-none">Cronología</h6>
                <div className="flex-1 overflow-y-auto space-y-4 pb-10 custom-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {chronology.map((item, index) => (
                        <div key={index} className="bg-zinc-950 p-4 rounded border border-danger group flex flex-col items-start gap-y-1">
                            <div className="w-full flex justify-between items-start gap-2">
                                <p className="text-sm font-bold text-zinc-200 uppercase truncate leading-tight m-0 italic flex-1">
                                    {item.name || item.constructorId?.replace(/-/g, ' ')}
                                </p>
                                <span className="text-[11px] text-zinc-600 font-black group-hover:text-red-600 transition-colors whitespace-nowrap pt-0.5 uppercase tracking-tighter">
                                    {item.yearFrom} — {(!item.yearTo || item.yearTo === 9999 || item.yearTo === "Actualidad") ? "ACTUALIDAD" : item.yearTo}
                                </span>
                            </div>
                        </div>
                    ))}
                    {chronology.length === 0 && (
                        <p className="text-zinc-700 text-xs italic font-bold uppercase px-1">Sin historial</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// Componentes para mostrar toda la información de la misma forma
const InfoItem = ({ label, value, important }) => (
    <div className="flex flex-col font-bold">
        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1 italic leading-none">{label}</span>
        {important ? (
            <span className="bg-zinc-800 text-white text-xs font-bold px-2 py-1 rounded w-fit border border-zinc-700 italic">
                {value || "N/A"}º Posición
            </span>
        ) : (
            <span className="text-sm text-zinc-200 capitalize font-bold italic leading-tight">
                {String(value || "---").replace(/-/g, ' ')}
            </span>
        )}
    </div>
);

const StatCard = ({ label, value, isRed }) => (
    <div className="p-4 rounded-lg border border-danger bg-zinc-950 shadow-sm transition-all hover:border-red-600/50">
        <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1 italic leading-none">{label}</p>
        <p className={`text-3xl font-black ${isRed ? 'text-red-600' : 'text-white'} tracking-tighter leading-none`}>
            {value || 0}
        </p>
    </div>
);

export default F1Teams;