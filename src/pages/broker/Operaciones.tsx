import React, { useState, useEffect } from 'react';
import { Truck, Package, FileText, Clock, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ScoringFormData {
  id_Envio: number;
  id_Usuario: number;
  Eficiencia: string;
  Comunicacion: string;
  Estado_Unidad: string;
}

const BrokerOperaciones = () => {
  const [showScoringModal, setShowScoringModal] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<any>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [scoringData, setScoringData] = useState<ScoringFormData>({
    id_Envio: 0,
    id_Usuario: 0,
    Eficiencia: '',
    Comunicacion: '',
    Estado_Unidad: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUserId();
  }, []);

  const fetchUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: usuario } = await supabase
        .from('Usuarios')
        .select('id_Usuario')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (usuario) {
        setUserId(usuario.id_Usuario);
      }
    }
  };

  const handleOpenScoringModal = (operation: any) => {
    setSelectedOperation(operation);
    setScoringData({
      id_Envio: operation.id,
      id_Usuario: userId || 0,
      Eficiencia: '',
      Comunicacion: '',
      Estado_Unidad: ''
    });
    setShowScoringModal(true);
    setMessage('');
  };

  const handleScoringChange = (field: keyof ScoringFormData, value: string) => {
    setScoringData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitScoring = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!scoringData.Eficiencia || !scoringData.Comunicacion || !scoringData.Estado_Unidad) {
      setMessage('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('Scoring')
        .insert([{
          id_Usuario: scoringData.id_Usuario,
          id_Envio: scoringData.id_Envio,
          Eficiencia: scoringData.Eficiencia,
          Comunicacion: scoringData.Comunicacion,
          Estado_Unidad: scoringData.Estado_Unidad
        }]);

      if (error) throw error;

      setMessage('Scoring guardado exitosamente');
      setTimeout(() => {
        setShowScoringModal(false);
        setScoringData({
          id_Envio: 0,
          id_Usuario: 0,
          Eficiencia: '',
          Comunicacion: '',
          Estado_Unidad: ''
        });
      }, 1500);
    } catch (error: any) {
      setMessage('Error al guardar el scoring: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Operaciones</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Envíos Activos</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">24</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Entregas Hoy</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">8</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Documentos Pendientes</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">12</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-5 w-5 text-slate-600" />
            <h3 className="font-semibold text-gray-900">Tiempo Promedio</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">2.5 días</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Operaciones en Curso</h2>
        </div>
        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500">
                <th className="pb-3">ID Operación</th>
                <th className="pb-3">Cliente</th>
                <th className="pb-3">Origen</th>
                <th className="pb-3">Destino</th>
                <th className="pb-3">Estado</th>
                <th className="pb-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-t">
                <td className="py-3">#OP-2024-001</td>
                <td className="py-3">Empresa A</td>
                <td className="py-3">Buenos Aires</td>
                <td className="py-3">Córdoba</td>
                <td className="py-3">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">En Tránsito</span>
                </td>
                <td className="py-3">
                  <button
                    onClick={() => handleOpenScoringModal({ id: 1, name: 'OP-2024-001' })}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                  >
                    <Star size={14} />
                    Evaluar
                  </button>
                </td>
              </tr>
              <tr className="border-t">
                <td className="py-3">#OP-2024-002</td>
                <td className="py-3">Empresa B</td>
                <td className="py-3">Rosario</td>
                <td className="py-3">Mendoza</td>
                <td className="py-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Cargando</span>
                </td>
                <td className="py-3">
                  <button
                    onClick={() => handleOpenScoringModal({ id: 2, name: 'OP-2024-002' })}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                  >
                    <Star size={14} />
                    Evaluar
                  </button>
                </td>
              </tr>
              <tr className="border-t">
                <td className="py-3">#OP-2024-003</td>
                <td className="py-3">Empresa C</td>
                <td className="py-3">La Plata</td>
                <td className="py-3">Tucumán</td>
                <td className="py-3">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pendiente</span>
                </td>
                <td className="py-3">
                  <button
                    onClick={() => handleOpenScoringModal({ id: 3, name: 'OP-2024-003' })}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                  >
                    <Star size={14} />
                    Evaluar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {showScoringModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Evaluar Operación {selectedOperation?.name}
            </h2>

            <form onSubmit={handleSubmitScoring} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Eficiencia
                </label>
                <select
                  value={scoringData.Eficiencia}
                  onChange={(e) => handleScoringChange('Eficiencia', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="Excelente">Excelente</option>
                  <option value="Muy Buena">Muy Buena</option>
                  <option value="Buena">Buena</option>
                  <option value="Regular">Regular</option>
                  <option value="Mala">Mala</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comunicación
                </label>
                <select
                  value={scoringData.Comunicacion}
                  onChange={(e) => handleScoringChange('Comunicacion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="Excelente">Excelente</option>
                  <option value="Muy Buena">Muy Buena</option>
                  <option value="Buena">Buena</option>
                  <option value="Regular">Regular</option>
                  <option value="Mala">Mala</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado de la Unidad
                </label>
                <select
                  value={scoringData.Estado_Unidad}
                  onChange={(e) => handleScoringChange('Estado_Unidad', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="Excelente">Excelente</option>
                  <option value="Muy Buena">Muy Buena</option>
                  <option value="Buena">Buena</option>
                  <option value="Regular">Regular</option>
                  <option value="Mala">Mala</option>
                </select>
              </div>

              {message && (
                <div className={`p-3 rounded ${
                  message.includes('exitosamente')
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {message}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowScoringModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar Evaluación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrokerOperaciones;
