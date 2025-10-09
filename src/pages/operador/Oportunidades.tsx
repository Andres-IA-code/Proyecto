import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { Envio } from '../../types';
import { Package, MapPin, Calendar } from 'lucide-react';

export function OperadorOportunidades() {
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnvios();
  }, []);

  const loadEnvios = async () => {
    try {
      const { data } = await supabase
        .from('General')
        .select('*')
        .eq('Estado', 'Solicitado')
        .order('Fecha_Retiro', { ascending: true });

      if (data) {
        setEnvios(data);
      }
    } catch (error) {
      console.error('Error loading envios:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Cargando oportunidades...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Oportunidades</h1>
        <p className="text-gray-600 mt-2">Cargas disponibles para cotizar</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {envios.map((envio) => (
          <div key={envio.id_Envio} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Envío #{envio.id_Envio}</h3>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                    {envio.Estado}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span><strong>Origen:</strong> {envio.Origen}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span><strong>Destino:</strong> {envio.Destino}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span><strong>Fecha:</strong> {new Date(envio.Fecha_Retiro || '').toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-3 flex gap-4 text-sm">
                  <span className="text-gray-600"><strong>Peso:</strong> {envio.Peso} kg</span>
                  <span className="text-gray-600"><strong>Tipo:</strong> {envio.Tipo_Carga}</span>
                  <span className="text-gray-600"><strong>Distancia:</strong> {envio.Distancia} km</span>
                </div>
              </div>

              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Cotizar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
