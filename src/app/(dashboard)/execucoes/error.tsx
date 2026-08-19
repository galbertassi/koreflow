"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Execucoes Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center p-8 bg-red-50 text-red-900 rounded-xl m-4">
      <h2 className="text-xl font-bold mb-4">Algo deu errado na renderização da tabela!</h2>
      <pre className="bg-red-100 p-4 rounded text-sm w-full overflow-auto max-h-[300px] mb-4 border border-red-200">
        {error.message}
        {"\n"}
        {error.stack}
      </pre>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
      >
        Tentar novamente
      </button>
    </div>
  );
}
