'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSimulationsPanel from '@/components/AdminSimulationsPanel';
import CreateSimulationForm from '@/components/CreateSimulationForm';
import { simulationsApi, type SimulationDto } from '@/lib/api/simulations';

type AdminLabsManagerProps = {
  simulations: SimulationDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  initialDifficulty?: string;
  initialStatus?: string;
};

export default function AdminLabsManager({
  simulations,
  total,
  page,
  limit,
  totalPages,
  initialDifficulty,
  initialStatus,
}: AdminLabsManagerProps) {
  const router = useRouter();
  const [selectedSimulation, setSelectedSimulation] = useState<SimulationDto | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (simulation: SimulationDto) => {
    setSelectedSimulation(simulation);
  };

  const handleDelete = async (simulationId: string) => {
    const confirmed = window.confirm('Delete this simulation? This action cannot be undone.');
    if (!confirmed) return;

    try {
      setDeletingId(simulationId);
      await simulationsApi.delete(simulationId);

      if (selectedSimulation?._id === simulationId) {
        setSelectedSimulation(null);
      }

      router.refresh();
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaved = () => {
    setSelectedSimulation(null);
    router.refresh();
  };

  return (
    <>
      <AdminSimulationsPanel
        simulations={simulations}
        total={total}
        page={page}
        limit={limit}
        totalPages={totalPages}
        initialDifficulty={initialDifficulty}
        initialStatus={initialStatus}
        selectedSimulationId={selectedSimulation?._id}
        deletingId={deletingId}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <div className="xl:sticky xl:top-24 self-start">
        <CreateSimulationForm
          selectedSimulation={selectedSimulation}
          onSaved={handleSaved}
          onCancelEdit={() => setSelectedSimulation(null)}
        />
      </div>
    </>
  );
}
