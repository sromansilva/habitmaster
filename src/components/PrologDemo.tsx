import { useState, useEffect } from 'react';
import { Brain, Play, CheckCircle, AlertCircle, Bug, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { prologApi } from '../services/prologApi';

export function PrologDemo() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [availableActions, setAvailableActions] = useState<string[]>([]);
    const [selectedAction, setSelectedAction] = useState<string>('sugerir_habito');
    const [params, setParams] = useState<any>({
        categoria: 'Salud',
        dificultad: 'Facil',
        puntos: 120,
        racha: 20
    });

    // Load available actions on mount
    useEffect(() => {
        const loadActions = async () => {
            try {
                const actions = await prologApi.getAvailableActions();
                // Parse actions to get just the names if needed, or use as is.
                // The backend returns strings like "sugerir_habito?categoria=Salud"
                // We'll extract the base action name for the dropdown
                const actionNames = actions.map(a => a.split('?')[0]);
                // Remove duplicates
                const uniqueActions = Array.from(new Set(actionNames));

                if (uniqueActions.length > 0) {
                    setAvailableActions(uniqueActions);
                    // Don't override selectedAction if it's already set to a valid one
                    if (!uniqueActions.includes(selectedAction)) {
                        setSelectedAction(uniqueActions[0]);
                    }
                }
            } catch (err) {
                console.error('Failed to load actions:', err);
                toast.error('No se pudieron cargar las acciones disponibles');
            }
        };
        loadActions();
    }, []);

    const executeQuery = async () => {
        setLoading(true);
        setResult(null);
        setError(null);

        try {
            // Filter params relevant to the selected action
            const relevantParams: any = {};
            if (selectedAction === 'sugerir_habito') relevantParams.categoria = params.categoria;
            if (selectedAction === 'sugerir_por_dificultad') relevantParams.dificultad = params.dificultad;
            if (selectedAction === 'nivel_usuario') relevantParams.puntos = params.puntos;
            if (selectedAction === 'calcular_bonus') relevantParams.racha = params.racha;

            const data = await prologApi.executeQuery(selectedAction, relevantParams);
            setResult(data);
            toast.success('Consulta ejecutada correctamente');
        } catch (err: any) {
            const errorMsg = err.message || 'Error de conexión con el servidor';
            setError(errorMsg);
            setResult({ error: errorMsg });
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8 flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Demo de Integración Prolog</h1>
                    <p className="text-slate-600 dark:text-slate-400">Prueba la lógica definida en base.pl</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Panel de Control */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                        <Play className="w-5 h-5 text-blue-500" />
                        Configurar Consulta
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Tipo de Consulta
                            </label>
                            <select
                                value={selectedAction}
                                onChange={(e) => setSelectedAction(e.target.value)}
                                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                            >
                                {/* Default options if API fails or is loading */}
                                {availableActions.length === 0 && (
                                    <>
                                        <option value="sugerir_habito">Sugerir Hábito</option>
                                        <option value="sugerir_por_dificultad">Sugerir por Dificultad</option>
                                        <option value="nivel_usuario">Nivel de Usuario</option>
                                        <option value="calcular_bonus">Calcular Bonus</option>
                                    </>
                                )}
                                {availableActions.map(action => (
                                    <option key={action} value={action}>
                                        {action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Dynamic Form Fields */}
                        {selectedAction === 'sugerir_habito' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Categoría
                                </label>
                                <select
                                    value={params.categoria}
                                    onChange={(e) => setParams({ ...params, categoria: e.target.value })}
                                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                                >
                                    <option value="Salud">Salud</option>
                                    <option value="Estudio">Estudio</option>
                                    <option value="Mindfulness">Mindfulness</option>
                                </select>
                            </div>
                        )}

                        {selectedAction === 'sugerir_por_dificultad' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Dificultad
                                </label>
                                <select
                                    value={params.dificultad}
                                    onChange={(e) => setParams({ ...params, dificultad: e.target.value })}
                                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                                >
                                    <option value="Facil">Fácil</option>
                                    <option value="Medio">Medio</option>
                                    <option value="Dificil">Difícil</option>
                                </select>
                            </div>
                        )}

                        {selectedAction === 'nivel_usuario' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Puntos Totales
                                </label>
                                <input
                                    type="number"
                                    value={params.puntos}
                                    onChange={(e) => setParams({ ...params, puntos: parseInt(e.target.value) || 0 })}
                                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                                />
                            </div>
                        )}

                        {selectedAction === 'calcular_bonus' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Racha Actual (días)
                                </label>
                                <input
                                    type="number"
                                    value={params.racha}
                                    onChange={(e) => setParams({ ...params, racha: parseInt(e.target.value) || 0 })}
                                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                                />
                            </div>
                        )}

                        <button
                            onClick={executeQuery}
                            disabled={loading}
                            className="
                                w-full py-2 px-4
                                bg-purple-500 hover:bg-purple-600
                                text-white font-semibold
                                rounded-lg border border-purple-300
                                dark:border-purple-500
                                shadow-md
                                transition-all
                                disabled:opacity-50 disabled:cursor-not-allowed
                                flex items-center justify-center gap-2
                            "
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Ejecutando...
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 text-black" /> Ejecutar Consulta
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Panel de Resultados */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col">
                    <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Resultados
                    </h2>

                    <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 font-mono text-sm overflow-auto min-h-[200px]">
                        {error ? (
                            <div className="text-red-500 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                <div className="flex items-center gap-2 mb-2 font-bold">
                                    <Bug className="w-5 h-5" /> Error
                                </div>
                                {error}
                            </div>
                        ) : result ? (
                            <div className="animate-in fade-in duration-300">
                                <div className="text-xs text-slate-400 mb-2 uppercase tracking-wider">Respuesta JSON:</div>
                                <pre className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                    {JSON.stringify(result, null, 2)}
                                </pre>

                                {/* Friendly display of results */}
                                {result.resultado && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                        <div className="text-xs text-slate-400 mb-2 uppercase tracking-wider">Interpretación:</div>
                                        <div className="text-lg font-medium text-purple-700 dark:text-purple-400">
                                            {Array.isArray(result.resultado)
                                                ? result.resultado.length > 0
                                                    ? <ul className="list-disc list-inside">{result.resultado.map((item: any, i: number) => <li key={i}>{item}</li>)}</ul>
                                                    : "No se encontraron resultados."
                                                : String(result.resultado)
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                                <p>Ejecuta una consulta para ver los resultados aquí</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
